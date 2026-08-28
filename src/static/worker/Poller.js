export class Poller {
  constructor(core) {
    this.core = core;

    /*
     * Poller is the sole owner of the SharedWorker's
     * realtime WebSocket connection.
     */
    this.pollerUrl =
      core.socketUrl || '/socket';

    this.socket = null;
    this.reconnectTimeout = null;
    this.heartbeatTimer = null;

    this.isRunning = false;
    this.errorState = false;
    this.retries = 0;

    /*
     * If no window has been focused for this amount of time,
     * don't keep reopening the socket.
     */
    this.offlineTimeout = 3600000;

    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 60000;

    this.heartbeatDelay = 30000;

    this.stopped = false;
  }


  /**
   * Whether the realtime WebSocket is currently open.
   */
  get connected() {
    return (
      this.socket?.readyState === WebSocket.OPEN
    );
  }


  /**
   * Whether the WebSocket is currently connecting.
   */
  get connecting() {
    return (
      this.socket?.readyState === WebSocket.CONNECTING
    );
  }


  /**
   * Kept for backwards compatibility with code that
   * previously configured a polling interval.
   *
   * With WebSockets there is no polling interval anymore,
   * so calling this simply ensures the socket is running.
   */
  setPoller() {
    this.launchPoller();

    return this;
  }


  /**
   * Stops the socket and prevents automatic reconnection.
   */
  stop() {
    this.stopped = true;
    this.isRunning = false;

    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      const socket = this.socket;

      /*
       * Clear the reference before closing so any late
       * callback from this socket is considered stale.
       */
      this.socket = null;

      /*
       * Remove handlers first, otherwise our own close()
       * could schedule a reconnect.
       */
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      try {
        socket.close(
          1000,
          'Client stopped'
        );
      }
      catch (err) {
        this.core.log?.(
          'Error closing WebSocket',
          err
        );
      }
    }

    return true;
  }


  /**
   * Starts the WebSocket when appropriate.
   */
  launchPoller() {
    if (!this.pollerUrl) {
      return false;
    }

    /*
     * A SharedWorker without any connected browser contexts
     * shouldn't maintain a realtime connection.
     */
    if (!this.core.ports.size) {
      this.core.log?.(
        'There is no connected window. Socket not started.'
      );

      return false;
    }

    /*
     * The application/session itself must be connected.
     */
    if (!this.core.isConnected) {
      return false;
    }

    const now = Date.now();

    /*
     * Preserve the previous background/offline behaviour.
     */
    if (
      !this.core.windowManager.isFocused &&
      (
        now -
        this.core.windowManager.lastFocused >=
        this.offlineTimeout
      )
    ) {
      return false;
    }

    /*
     * Never create a second WebSocket.
     */
    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.CONNECTING ||
        this.socket.readyState === WebSocket.OPEN
      )
    ) {
      return true;
    }

    /*
     * If we explicitly try to connect now, an old reconnect
     * timer is no longer useful.
     */
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopped = false;

    return this.connect();
  }


  /**
   * Opens the single realtime WebSocket connection.
   */
  connect() {
    if (
      this.stopped ||
      !this.pollerUrl ||
      !this.core.isConnected ||
      !this.core.ports.size
    ) {
      return false;
    }

    /*
     * Final guard against duplicate connections.
     */
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return true;
    }

    const url =
      this.getSocketUrl(this.pollerUrl);

    this.core.log?.(
      'Connecting socket to ' + url
    );

    this.isRunning = true;
    this.errorState = false;

    let socket;

    try {
      socket = new WebSocket(url);
    }
    catch (err) {
      this.isRunning = false;
      this.errorState = true;

      this.core.log?.(
        'Could not create WebSocket for ' + url,
        err
      );

      this.scheduleReconnect();

      return false;
    }

    this.socket = socket;


    socket.onopen = () => {
      /*
       * Ignore stale sockets.
       */
      if (this.socket !== socket) {
        try {
          socket.close();
        }
        catch (e) {
        }

        return;
      }

      this.core.log?.(
        'Socket connected'
      );

      this.isRunning = true;
      this.errorState = false;
      this.retries = 0;

      /*
       * If a reconnect timer somehow survived until now,
       * make sure it can't create another socket later.
       */
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      /*
       * Send information about the currently connected
       * SharedWorker clients.
       */
      this.sendClients();

      /*
       * Poller now owns heartbeat handling too.
       */
      this.startHeartbeat();

      /*
       * Preserve the old AppuiWorkerService notification
       * behaviour for browser windows.
       */
      this.core.broadcast?.({
        type: 'connected'
      });
    };


    socket.onmessage = async event => {
      if (this.socket !== socket) {
        return;
      }

      let json;

      try {
        json =
          await this.parseMessage(
            event.data
          );
      }
      catch (err) {
        this.errorState = true;

        this.core.log?.(
          'The socket response is not valid JSON',
          err
        );

        return;
      }

      if (!json) {
        this.core.log?.(
          'The socket response is empty'
        );

        return;
      }

      this.core.debug?.({
        response: json
      });

      if (
        typeof json === 'object' &&
        !Array.isArray(json) &&
        !Object.keys(json).length
      ) {
        return;
      }

      this.core.log?.(
        'SOCKET RESULT: \n' +
        (
          json && typeof json === 'object' ?
            JSON.stringify(json, null, 2)
            : typeof json
        )
      );

      /*
       * The Poller keeps the old server-message processing
       * path. This avoids having two competing realtime
       * protocols in AppuiWorkerService.
       */
      try {
        const result =
          await this.core.messageHandler
            .processServerMessage(json);

        if (result === false) {
          this.core.log?.(
            'processServerMessage returned false'
          );
        }
      }
      catch (err) {
        this.core.log?.(
          'Error processing socket message',
          err
        );
      }
    };


    socket.onerror = event => {
      if (this.socket !== socket) {
        return;
      }

      /*
       * Browser WebSocket error events expose very little
       * useful information. onclose handles reconnection.
       */
      this.errorState = true;

      this.core.log?.(
        'WebSocket error',
        event
      );
    };


    socket.onclose = event => {
      if (this.socket !== socket) {
        return;
      }

      this.core.log?.(
        'Socket closed. Code: ' +
        event.code +
        ', reason: ' +
        (event.reason || 'none')
      );

      this.stopHeartbeat();

      this.socket = null;
      this.isRunning = false;

      this.core.broadcast?.({
        type: 'disconnected'
      });

      if (this.stopped) {
        return;
      }

      this.errorState = true;

      this.scheduleReconnect();
    };

    return true;
  }


  /**
   * Parses supported browser WebSocket payload formats.
   *
   * @param {*} data
   * @returns {Promise<*>}
   */
  async parseMessage(data) {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }

    if (data instanceof Blob) {
      return JSON.parse(
        await data.text()
      );
    }

    if (data instanceof ArrayBuffer) {
      return JSON.parse(
        new TextDecoder().decode(data)
      );
    }

    if (ArrayBuffer.isView(data)) {
      return JSON.parse(
        new TextDecoder().decode(
          data.buffer.slice(
            data.byteOffset,
            data.byteOffset + data.byteLength
          )
        )
      );
    }

    throw new Error(
      'Unknown WebSocket message format'
    );
  }


  /**
   * Sends the currently connected application windows
   * to the server.
   */
  sendClients() {
    const clients = {};

    for (
      const id in this.core.windowManager.windows
    ) {
      clients[id] =
        this.core.windowManager
          .windows[id]
          .data || {};
    }

    const message =
      Object.keys(clients).length
        ? {clients}
        : {test: 1};

    this.core.debug?.({
      request: message
    });

    return this.send(message);
  }


  /**
   * Sends a JSON message through the realtime socket.
   *
   * @param {*} message
   */
  send(message) {
    if (!this.connected) {
      return false;
    }

    try {
      this.socket.send(
        JSON.stringify(message)
      );

      return true;
    }
    catch (err) {
      this.core.log?.(
        'Could not send WebSocket message',
        err
      );

      return false;
    }
  }


  /**
   * Starts the WebSocket heartbeat.
   */
  startHeartbeat() {
    this.stopHeartbeat();

    if (!this.heartbeatDelay) {
      return;
    }

    this.heartbeatTimer = setInterval(
      () => {
        if (!this.connected) {
          return;
        }

        this.send({
          type: 'ping'
        });
      },
      this.heartbeatDelay
    );
  }


  /**
   * Stops the WebSocket heartbeat.
   */
  stopHeartbeat() {
    if (!this.heartbeatTimer) {
      return;
    }

    clearInterval(
      this.heartbeatTimer
    );

    this.heartbeatTimer = null;
  }


  /**
   * Schedules a reconnect with exponential backoff.
   */
  scheduleReconnect() {
    if (
      this.stopped ||
      this.reconnectTimeout ||
      !this.core.isConnected ||
      !this.core.ports.size
    ) {
      return false;
    }

    this.retries++;

    const delay = Math.min(
      this.reconnectDelay *
        Math.pow(
          2,
          this.retries - 1
        ),
      this.maxReconnectDelay
    );

    this.core.log?.(
      'Reconnecting socket in ' +
      delay +
      'ms'
    );

    this.reconnectTimeout =
      setTimeout(
        () => {
          this.reconnectTimeout = null;

          this.launchPoller();
        },
        delay
      );

    return true;
  }


  /**
   * Converts a relative URL or HTTP URL into a valid
   * WebSocket URL.
   *
   * Examples:
   *
   * /socket
   *   -> ws://example.com/socket
   *
   * https://example.com/socket
   *   -> wss://example.com/socket
   */
  getSocketUrl(url) {
    if (
      url.startsWith('ws://') ||
      url.startsWith('wss://')
    ) {
      return url;
    }

    if (url.startsWith('http://')) {
      return (
        'ws://' +
        url.slice(7)
      );
    }

    if (url.startsWith('https://')) {
      return (
        'wss://' +
        url.slice(8)
      );
    }

    const parsed = new URL(
      url,
      self.location.href
    );

    parsed.protocol =
      parsed.protocol === 'https:'
        ? 'wss:'
        : 'ws:';

    return parsed.href;
  }


  /**
   * Notify the realtime system when the collection of
   * connected windows changes.
   *
   * Call this after adding/removing/updating a window.
   */
  clientsChanged() {
    /*
     * No connected browser contexts:
     *
     * Close the socket completely. A SharedWorker may stay
     * alive for a while after its last page disappears, and
     * we don't want that worker keeping the server socket
     * alive unnecessarily.
     */
    if (!this.core.ports.size) {
      this.stop();

      return true;
    }

    /*
     * A new window may arrive after stop() was called when
     * there were no remaining ports.
     */
    this.stopped = false;

    if (this.connected) {
      return this.sendClients();
    }

    return this.launchPoller();
  }


  /**
   * Compatibility alias for code that still calls poll().
   */
  poll() {
    this.launchPoller();

    return true;
  }


  /**
   * Compatibility alias for code that still calls
   * retryPoll().
   */
  retryPoll() {
    return this.scheduleReconnect();
  }


  /**
   * Compatibility alias with the previous
   * AppuiWorkerService realtime API.
   */
  realTimeConnect() {
    return this.launchPoller();
  }


  /**
   * Compatibility alias with the previous
   * AppuiWorkerService sendSocket() method.
   */
  sendSocket(data) {
    return this.send(data);
  }
}