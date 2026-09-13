export class SearchManager {
  constructor(core) {
    this.core = core;

    this.value = '';
    this.aborter = null;
    this.reader = null;
    this.buffer = '';
    this.port = null;
  }


  /**
   * Handles search-related messages.
   *
   * @param {MessagePort} port
   * @param {MessageEvent} event
   * @returns {Boolean|Promise<Boolean>}
   */
  handleMessage(port, event) {
    const message = event.data;

    if (!message?.type) {
      return false;
    }

    if (message.type !== 'search') {
      return false;
    }

    this.search(port, message.data);

    return true;
  }


  /**
   * Starts or cancels a search.
   *
   * Expected data:
   * {
   *   done,
   *   filters,
   *   uid
   * }
   *
   * @param {MessagePort} port
   * @param {Object} data
   */
  async search(port, data) {
    this.core.log?.('RECEIVING SEARCH');

    if (!data) {
      return false;
    }

    if (data.done) {
      this.core.log?.('DONE');
      this.abort();
      return true;
    }

    const filters = data.filters;
    const uid = data.uid;

    if (
      !filters ||
      !Array.isArray(filters.conditions) ||
      !filters.conditions.length
    ) {
      this.core.log?.('Invalid search conditions');
      return false;
    }

    this.value = filters.conditions[0]?.value || '';

    /*
     * A new search always supersedes the previous one.
     */
    this.abort();

    if (this.value.length <= 1) {
      return true;
    }

    this.port = port;
    this.buffer = '';

    const aborter = new AbortController();
    this.aborter = aborter;

    this.core.log?.('LAUNCHING SEARCH FOR ' + this.value);

    try {
      const response = await fetch('search/start', {
        method: 'POST',
        mode: 'same-origin',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        signal: aborter.signal,
        body: JSON.stringify({
          uid,
          conditions: filters.conditions
        })
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`
        );
      }

      if (!response.body) {
        this.finish(aborter);
        return true;
      }

      const reader = response.body.getReader();
      this.reader = reader;

      await this.pump(reader, aborter, port);

      return true;
    }
    catch (err) {
      /*
       * Only clean the current request.
       * A newer search may already have replaced this.aborter.
       */
      if (err.name !== 'AbortError') {
        this.value = '';

        this.core.log?.('ERROR in search');
        this.core.log?.(err);
      }

      this.finish(aborter);
    }

    return false;
  }


  /**
   * Reads and processes the response stream.
   *
   * @param {ReadableStreamDefaultReader} reader
   * @param {AbortController} aborter
   * @param {MessagePort} port
   */
  async pump(reader, aborter, port) {
    const decoder = new TextDecoder();

    try {
      while (this.aborter === aborter) {
        const {done, value} = await reader.read();

        this.core.log?.(
          'pump ' + (done ? 'done' : 'not done')
        );

        if (value) {
          /*
           * stream:true is important because an UTF-8 character
           * can theoretically be split between chunks.
           */
          this.buffer += decoder.decode(value, {
            stream: !done
          });

          await this.processBuffer(port, done);
        }

        if (done) {
          /*
           * Flush anything remaining in the decoder.
           */
          this.buffer += decoder.decode();

          if (this.buffer.trim()) {
            await this.processBuffer(port, true);
          }

          this.core.log?.('STREAM DONE');

          this.send(port, [{
            done: 1
          }]);

          this.finish(aborter);

          return;
        }
      }
    }
    catch (err) {
      if (err.name !== 'AbortError') {
        this.core.log?.('ERROR in pump read');
        this.core.log?.(err);
      }

      this.finish(aborter);
    }
  }


  /**
   * Extracts complete JSON lines from the stream buffer.
   *
   * @param {MessagePort} port
   * @param {Boolean} done
   */
  async processBuffer(port, done = false) {
    const lines = this.buffer.split('\n');

    if (!done) {
      this.buffer = lines.pop() || '';
    }
    else {
      this.buffer = '';
    }

    /*
     * Ignore empty lines.
     */
    const validLines = lines.filter(line => line.trim());

    if (validLines.length) {
      this.treatJSON(port, validLines);
    }
  }


  /**
   * Parses and forwards search results.
   *
   * @param {MessagePort} port
   * @param {Array<String|Object>} arr
   */
  treatJSON(port, arr) {
    if (!arr?.length) {
      return;
    }

    const finalArr = [];

    for (const line of arr) {
      if (
        typeof line !== 'string' &&
        line?.done
      ) {
        finalArr.push(line);
        continue;
      }

      let obj;

      try {
        obj = typeof line === 'string'
          ? JSON.parse(line)
          : line;
      }
      catch (e) {
        this.core.log?.(
          'Error parsing JSON line: ' + line
        );

        continue;
      }

      if (obj?.data?.length) {
        this.core.log?.(
          `treatJSON with ${obj.data.length} entries`
        );

        obj.data.sort(
          (a, b) => b.score - a.score
        );

        finalArr.push(obj);
      }
    }

    if (finalArr.length) {
      this.send(port, finalArr);
    }
  }


  /**
   * Sends search results to the window which initiated the search.
   *
   * @param {MessagePort} port
   * @param {Array} data
   */
  send(port, data) {
    if (!port) {
      return false;
    }

    try {
      port.postMessage({
        type: 'appui-search-stream',
        data
      });

      return true;
    }
    catch (e) {
      this.core.log?.(
        'Error sending search results'
      );
      this.core.log?.(e);
    }

    return false;
  }


  /**
   * Cancels the current search.
   */
  abort() {
    if (this.reader) {
      try {
        this.reader.cancel();
      }
      catch (e) {
      }

      this.reader = null;
    }

    if (this.aborter) {
      this.aborter.abort();
      this.aborter = null;
    }

    this.buffer = '';
    this.port = null;
  }


  /**
   * Cleans up a completed request, provided it is still
   * the active request.
   *
   * @param {AbortController} aborter
   */
  finish(aborter) {
    if (this.aborter !== aborter) {
      return;
    }

    this.aborter = null;
    this.reader = null;
    this.buffer = '';
    this.port = null;
  }
}