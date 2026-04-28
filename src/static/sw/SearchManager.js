export class SearchManager {
  constructor(core) {
    this.core = core;
  }

  async onMessageSearch(event, clientList) {
    this.core.log("RECEIVING SEARCH");
    const data = event.data.data;

    if (data.done) {
      this.core.log("DONE");
      return;
    }

    const filters = data.filters;
    const uid = data.uid;
    this.core.searchValue = filters.conditions[0].value;

    if (this.core.searchAborter) {
      this.core.log("UPDATING SEARCH");
      this.core.searchAborter.abort();
      this.core.searchAborter = null;
    }

    if (this.core.searchValue.length > 1) {
      this.core.log("LAUNCHING SEARCH FOR " + this.core.searchValue + " WITH DATA");
      this.core.log(data);

      this.core.searchAborter = new AbortController();

      try {
        const response = await fetch('search/start', {
          method: 'POST',
          mode: 'same-origin',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          signal: this.core.aborter.signal,
          body: JSON.stringify({ uid, conditions: filters.conditions })
        });

        if (response.body) {
          try {
            this.core.searchReader = response.body.getReader();
            const { done, value } = await this.core.searchReader.read();
            this.pump({ done, value });
          } catch (err) {
            let isAbort = err.name == 'AbortError';
            if (!isAbort) {
              this.core.searchValue = '';
              this.core.log("ERROR");
              this.core.log(err.message);
            }
            this.core.searchAborter = null;
            return;
          }
        }
      } catch (err) {
        let isAbort = err.name == 'AbortError';
        if (!isAbort) {
          this.core.searchValue = '';
          this.core.log("ERROR");
          this.core.log(err.message);
        }
        this.core.searchAborter = null;
        return;
      }
    }
  }

  async pump(res) {
    const { done, value } = res;
    this.core.log("pump " + (done ? 'done' : 'not done'));

    if (value) {
      this.core.jsonSearch += new TextDecoder().decode(value).trim();
    }

    if (this.core.json) {
      const arr = this.core.json.split('\n');
      this.core.json = '';
      try {
        await this.treatJSON(arr);
      } catch (e) { }
    }

    if (done) {
      this.core.searchAborter = null;
      this.core.log("DONE");
      await this.treatJSON([{ done: 1 }]);
      return;
    }

    this.core.searchReader.read().then(res => this.pump(res));
  }

  async treatJSON(arr) {
    if (arr.length) {
      for (let i = 0; i < arr.length; i++) {
        const finalArr = [];
        let obj;

        if ((typeof(arr[i]) !== 'string') && arr[i]?.done) {
          finalArr.push(arr[i]);
          this.core.log("DONE");
        } else {
          try {
            obj = JSON.parse(arr[i]);
          } catch (e) {
            this.core.log("Error parsing JSON");
            this.core.log(arr[i]);
            this.core.log(e.message);
            this.core.json = arr[i];
          }

          if (obj?.data?.length) {
            this.core.log("treatJSON with " + obj.data?.length + " entries");
            obj.data.sort((a, b) => b.score - a.score);
            finalArr.push(obj);
          }
        }

        if (finalArr.length) {
          const clientList = await self.clients.matchAll({ includeUncontrolled: false });
          clientList.forEach(client => {
            if (this.core.windows[client.id]) {
              client.postMessage({
                client: client.id,
                type: 'appui-search-stream',
                data: finalArr
              });
            }
          });
        }
      }
    }
  }
}
