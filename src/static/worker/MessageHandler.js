export class MessageHandler {
  constructor(core) {
    this.core = core;

    this.lastClientMessage = {};
    this.lastResponse = {};
  }

  /**
   * Handles messages coming from a connected window.
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

    const data = message.data || {};

    this.core.log?.(["MessageHandler: " + message.type, data]);

    switch (message.type) {
      case "start":
        this.onMessageStart(port, data);
        return true;

      case "test":
        this.onMessageTest(port, data);
        return true;

      case "connection":
        this.onMessageConnection(port, data);
        return true;

      case "init":
        this.onMessageInit(port, data);
        return true;

      case "login":
        this.onMessageLogin(port, data);
        return true;

      case "initCompleted":
        this.core.connect();
        this.core.poller.setPoller(5);
        return true;

      case "registerChannel":
        this.onMessageRegisterChannel(port, message);
        return true;

      case "unregisterChannel":
        this.onMessageUnregisterChannel(port, message);
        return true;

      case "messageChannel":
        this.onMessageChannel(port, message);
        return true;

      case "messageFromChannel":
        this.onMessageFromChannel(port, message);
        return true;

      case "beforeRouting":
        this.onMessageBeforeRouting(port, data);
        return true;

      case "routing":
        this.onMessageRouting(port, data);
        return true;

      case "open-link":
        this.onMessageOpenLink(port, data);
        return true;

      case "clientMessage":
        this.processClientMessage(port, data);
        return true;
    }

    return false;
  }

  /**
   * Sends a message to a specific SharedWorker port.
   *
   * @param {MessagePort} port
   * @param {Object} message
   * @returns {Boolean}
   */
  send(port, message) {
    if (!port) {
      return false;
    }

    try {
      port.postMessage(message);
      return true;
    } catch (e) {
      this.core.log?.("Unable to send message to window");
      this.core.log?.(e);

      return false;
    }
  }

  /**
   * Returns the registered window associated with a port.
   *
   * @param {MessagePort} port
   * @returns {Object|null}
   */
  getWindow(port) {
    return this.core.windowManager.getWindowFromPort(port);
  }

  /**
   * Sends a URL to another registered window.
   *
   * Expected data:
   * {
   *   url,
   *   windowId
   * }
   */
  onMessageOpenLink(port, data) {
    if (!data?.url || !data?.windowId) {
      return false;
    }

    const targetPort = this.core.windowManager.getPort(data.windowId);

    if (!targetPort) {
      return false;
    }

    return this.send(targetPort, {
      type: "open-link",
      data: {
        url: data.url,
      },
    });
  }

  /**
   * Checks whether the requested URL is already displayed
   * in another registered window.
   */
  onMessageBeforeRouting(port, data) {
    if (!data?.url) {
      return false;
    }

    const sender = this.core.windowManager.getWindowFromPort(port);

    if (!sender) {
      return false;
    }

    const url = data.url;
    const windows = this.core.windowManager.windows;

    this.core.log?.(
      "Looking for url " +
        url +
        " in " +
        Object.keys(windows).length +
        " windows",
    );

    for (const windowId in windows) {
      if (windowId === sender.windowId) {
        continue;
      }

      const win = windows[windowId];

      const row = bbn.fn.getRow(
        win.views || [],
        (a) => a?.current && !a.current.indexOf(url),
      );

      if (row) {
        this.core.log?.("Found url " + url + " in window " + windowId);

        this.send(port, {
          type: "routing",
          data: {
            windowId,
            url,
          },
        });

        return true;
      }
    }

    this.send(port, {
      type: "routing",
      data: {
        ok: true,
        url,
      },
    });

    return true;
  }

  /**
   * Updates the routing/window information received
   * from one window.
   */
  onMessageRouting(port, data) {
    return this.core.windowManager.update(port, data);
  }

  /**
   * Stores data sent by a window for the poller.
   */
  processClientMessage(port, data) {
    const win = this.core.windowManager.getWindowFromPort(port);

    if (!win) {
      this.core.log?.("Poller data received from an unregistered window");

      return false;
    }

    if (data.poll) {
      this.core.poller.poll();
    }

    if (data.token) {
      if (!win.token) {
        win.token = data.token;
      } else if (win.token !== data.token) {
        throw new Error("The token doesn't correspond");
      }
    }

    this.lastClientMessage = data;
    win.data = data;

    /*
     * New state should be taken into account immediately.
     * Abort the current long poll; the poller will restart.
     */
    if (this.core.poller.isRunning && this.core.poller.aborter) {
      this.core.poller.aborter.abort();
    }

    return true;
  }

  /**
   * Processes server data returned by Poller and dispatches
   * each entry to its corresponding window.
   *
   * The server response is expected to be keyed by windowId.
   *
   * @param {Object} obj
   * @returns {Promise<Boolean>}
   */
  async processServerMessage(obj) {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    const windows = this.core.windowManager.windows;

    for (const windowId in obj) {
      const win = windows[windowId];

      /*
       * The server may return stale data for a window that
       * has since disappeared.
       */
      if (!win) {
        continue;
      }

      const message = obj[windowId];

      if (message?.disconnected) {
        this.core.disconnect();
      }

      /*
       * Merge ServiceWorker/plugin state into the window's
       * stored polling data, preserving the behaviour of the
       * old ServiceWorker implementation.
       */
      if (message?.plugins && Object.keys(message.plugins).length) {
        if (!win.data) {
          win.data = {};
        }

        for (const plugin in message.plugins) {
          const pluginData = message.plugins[plugin];

          if (pluginData && "serviceWorkers" in pluginData) {
            if (!win.data[plugin]) {
              win.data[plugin] = {};
            }

            Object.assign(win.data[plugin], pluginData.serviceWorkers);
          }
        }
      }

      if (win.port) {
        this.send(win.port, {
          type: "message",
          data: message,
        });
      }
    }

    this.lastResponse = obj;

    return true;
  }

  /**
   * Retrieves application configuration.
   */
  async onMessageInit(port) {
    await this.core.dataManager.retrieveIndexCfg();

    this.send(port, {
      type: "init",
      data: this.core.dataManager.indexCfg,
    });

    return true;
  }

  /**
   * Retrieves login configuration.
   */
  async onMessageLogin(port) {
    await this.core.dataManager.retrieveLoginCfg();

    this.send(port, {
      type: "login",
      data: this.core.dataManager.loginCfg,
    });

    return true;
  }

  /**
   * Checks server connection status.
   */
  async onMessageConnection(port) {
    await this.core.checkConnection();

    this.send(port, {
      type: "connection",
      data: {
        connected: this.core.isConnected,
      },
    });

    return true;
  }

  /**
   * Registers the current window to a message channel.
   *
   * Supports either:
   *
   * {type:'registerChannel', channel:'foo'}
   *
   * or:
   *
   * {type:'registerChannel', data:{channel:'foo'}}
   */
  onMessageRegisterChannel(port, message) {
    const channel = message.channel;
    const win = this.getWindow(port);

    if (!channel || !win) {
      return false;
    }

    if (!win.channels.includes(channel)) {
      win.channels.push(channel);
    }

    return true;
  }

  /**
   * Removes the current window from a message channel.
   */
  onMessageUnregisterChannel(port, message) {
    const channel = message.channel || message.data?.channel;

    if (!channel) {
      return false;
    }

    const win = this.getWindow(port);

    if (!win?.channels) {
      return false;
    }

    const idx = win.channels.indexOf(channel);

    if (idx > -1) {
      win.channels.splice(idx, 1);
    }

    return true;
  }

  /**
   * Broadcasts a channel message to every other subscribed
   * window.
   */
  onMessageChannel(port, message) {
    if (!message.channel) {
      return false;
    }

    const sender = this.core.windowManager.getWindowFromPort(port);

    for (const windowId in this.core.windowManager.windows) {
      const win = this.core.windowManager.windows[windowId];

      if (sender && windowId === sender.windowId) {
        continue;
      }

      if (win.channels.includes(message.channel)) {
        win.port.postMessage({
          type: "messageFromChannel",
          channel: message.channel,
          data: message.data,
        });
      }
    }

    return true;
  }

  /**
   * Kept for compatibility.
   *
   * messageFromChannel is normally a worker -> window event,
   * so receiving it from a window requires no action.
   */
  onMessageFromChannel() {
    return true;
  }

  /**
   * Temporary diagnostic endpoint.
   */
  async onMessageTest(port, data) {
    this.core.log?.([
      "TEST MESSAGE RECEIVED",
      "DATA:",
      data,
      "WINDOW:",
      this.core.windowManager.getWindowFromPort(port)?.windowId,
    ]);

    return true;
  }

  /**
   * Legacy start/test endpoint.
   */
  async onMessageStart(port) {
    try {
      const response = await fetch(this.core.data.site_url + "core/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: 1,
        }),
      });

      const json = await response.json();

      this.core.log?.("RESPONSE", json);

      return true;
    } catch (e) {
      this.core.log?.("Error in start message");
      this.core.log?.(e);

      return false;
    }
  }
}
