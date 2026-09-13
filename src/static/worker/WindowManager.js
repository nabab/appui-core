export class WindowManager {
  constructor(core) {
    this.core = core;

    this.windows = {};
    this.portToWindow = new Map();
    this.mainClient = null;

    this.isFocused = false;
    this.lastFocused = Date.now();
  }


  /**
   * Handles window-related messages.
   *
   * @param {MessagePort} port
   * @param {MessageEvent} event
   * @returns {Boolean}
   */
  handleMessage(port, event) {
    const message = event.data;

    if (!message || !message.type) {
      return false;
    }

    switch (message.type) {
      case 'registerWindow':
        this.register(port, message.data);
        return true;

      case 'unregisterWindow':
        this.unregister(port, message.data);
        return true;

      case 'focus':
        this.setFocus(port, true);
        return true;

      case 'blur':
        this.setFocus(port, false);
        return true;
    }

    return false;
  }


  /**
   * Registers a window connected through a SharedWorker port.
   *
   * @param {MessagePort} port
   * @param {Object} data
   */
  register(port, data = {}) {
    let {
      windowId,
      url,
      focused,
      views
    } = data;

    if (!windowId) {
      throw new Error('No windowId provided');
    }

    /*
     * If this port was previously registered,
     * remove its old registration first.
     */
    const previousId = this.portToWindow.get(port);

    if (previousId && (previousId !== windowId)) {
      this.remove(previousId);
    }

    /*
     * A windowId must uniquely identify one connected window.
     *
     * If another port already owns the requested id,
     * generate a new one.
     */
    if (
      this.windows[windowId] &&
      this.windows[windowId].port !== port
    ) {
      windowId = crypto.randomUUID().replace(/-/g, '');
    }

    this.portToWindow.set(port, windowId);

    this.windows[windowId] = {
      windowId,
      url: url || null,
      token: null,
      data: {},
      channels: [],
      views: views || null,
      focused: !!focused,
      connected: true,

      /*
       * Keep the actual MessagePort private to the worker.
       * We'll exclude it when sending window definitions
       * to clients.
       */
      port
    };

    if (focused) {
      this.isFocused = true;
      this.lastFocused = Date.now();
    }

    if (
      !this.mainClient ||
      !this.windows[this.mainClient]
    ) {
      this.mainClient = windowId;
    }

    port.postMessage({
      type: 'appui-definition',
      data: {
        windowId,
        auxiliary: this.mainClient !== windowId,
        windows: this.getPublicWindows()
      }
    });

    this.broadcastUpdate();

    return windowId;
  }


  /**
   * Unregisters the window associated with a port.
   *
   * @param {MessagePort} port
   * @param {Object} data
   */
  unregister(port, data = {}) {
    const windowId =
      data.windowId ||
      this.portToWindow.get(port);

    if (!windowId || !this.windows[windowId]) {
      return false;
    }

    this.core.log?.(
      'Unregistering window ' + windowId
    );

    this.remove(windowId);

    this.broadcastUpdate();

    return true;
  }


  /**
   * Updates information about a registered window.
   *
   * @param {MessagePort} port
   * @param {Object} data
   */
  update(port, data = {}) {
    const windowId =
      data.windowId ||
      this.portToWindow.get(port);

    if (!windowId) {
      return false;
    }

    let win = this.windows[windowId];

    /*
     * Be tolerant if an update arrives before registration.
     */
    if (!win) {
      this.register(port, {
        ...data,
        windowId
      });

      win = this.windows[windowId];
    }

    if ('url' in data) {
      win.url = data.url;
    }

    if ('views' in data) {
      win.views = data.views;
    }

    if ('token' in data) {
      win.token = data.token;
    }

    if ('data' in data) {
      win.data = data.data;
    }

    if ('channels' in data) {
      win.channels = data.channels;
    }

    if ('focused' in data) {
      this.setFocus(
        port,
        !!data.focused,
        false
      );
    }

    this.broadcastUpdate();

    return true;
  }


  /**
   * Updates focus information for a window.
   *
   * Since SharedWorker has no Client.focused property,
   * each window must explicitly report focus/blur changes.
   *
   * @param {MessagePort} port
   * @param {Boolean} focused
   * @param {Boolean} broadcast
   */
  setFocus(port, focused, broadcast = true) {
    const windowId = this.portToWindow.get(port);

    if (!windowId || !this.windows[windowId]) {
      return false;
    }

    const win = this.windows[windowId];

    win.focused = focused;

    if (focused) {
      /*
       * There should normally only be one focused browser
       * window, so clear the flag from the others.
       */
      for (const id in this.windows) {
        if (id !== windowId) {
          this.windows[id].focused = false;
        }
      }

      this.lastFocused = Date.now();
    }

    this.isFocused = Object.values(
      this.windows
    ).some(w => w.focused);

    if (broadcast) {
      this.broadcastUpdate();
    }

    return true;
  }


  /**
   * Removes a window from the internal registry.
   *
   * @param {String} windowId
   */
  remove(windowId) {
    const win = this.windows[windowId];

    if (!win) {
      return false;
    }

    if (win.port) {
      this.portToWindow.delete(win.port);
    }

    delete this.windows[windowId];

    if (this.mainClient === windowId) {
      this.mainClient =
        Object.keys(this.windows)[0] || null;
    }

    this.isFocused = Object.values(
      this.windows
    ).some(w => w.focused);

    return true;
  }


  /**
   * Removes the window associated with a disconnected port.
   *
   * This will be useful from AppuiWorkerService.removePort().
   *
   * @param {MessagePort} port
   */
  removePort(port) {
    const windowId = this.portToWindow.get(port);

    if (!windowId) {
      return false;
    }

    this.core.log?.(
      'Removing window ' + windowId
    );

    this.remove(windowId);
    this.broadcastUpdate();

    return true;
  }


  /**
   * Returns the window corresponding to a MessagePort.
   *
   * @param {MessagePort} port
   */
  getWindowFromPort(port) {
    const windowId = this.portToWindow.get(port);

    return windowId
      ? this.windows[windowId] || null
      : null;
  }


  /**
   * Returns the MessagePort corresponding to a windowId.
   *
   * @param {String} windowId
   */
  getPort(windowId) {
    return this.windows[windowId]?.port || null;
  }


  /**
   * Returns the preferred window for worker-originated actions.
   *
   * Priority:
   * 1. focused window
   * 2. main window
   * 3. any available window
   */
  getPrimaryPort() {
    for (const id in this.windows) {
      if (this.windows[id].focused) {
        return this.windows[id].port;
      }
    }

    if (this.mainClient && this.windows[this.mainClient]) {
      return this.windows[this.mainClient].port;
    }

    return this.core.ports.values().next().value || null;
  }


  /**
   * Returns window data safe to send through postMessage.
   *
   * MessagePort itself must not be embedded in the window object.
   */
  getPublicWindows() {
    const res = {};

    for (const id in this.windows) {
      const {
        port,
        ...win
      } = this.windows[id];

      res[id] = {
        ...win
      };
    }

    return res;
  }


  /**
   * Sends the current window state to all connected windows.
   */
  broadcastUpdate() {
    this.core.broadcast({
      type: 'update-windows',
      data: {
        windows: this.getPublicWindows()
      }
    });
  }
}