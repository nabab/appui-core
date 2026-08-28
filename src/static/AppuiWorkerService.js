import bbn from "/static/lib/bbn-js/v2/dist/bbn.sw.js";

import { DataManager } from "./worker/DataManager.js";
import { Poller } from "./worker/Poller.js";
import { MessageHandler } from "./worker/MessageHandler.js";
import { WindowManager } from "./worker/WindowManager.js";
import { NotificationHandler } from "./worker/NotificationHandler.js";
import { SearchManager } from "./worker/SearchManager.js";


export default class AppuiWorkerService {
  #isConnected = null;

  constructor(scope, socketUrl, data) {
    this.scope = scope;
    this.socketUrl = socketUrl;
    this.data = data;
    scope.app = this;

    /*
     * Connected SharedWorker ports.
     */
    this.ports = new Set();

    /*
     * Initialize bbn environment before creating managers
     * that may depend on it.
     */
    bbn.fn.init({
      env: {
        logging: data.is_dev,
        isDev: data.is_dev,
        mode: data.is_dev
          ? 'dev'
          : (
            data.is_test
              ? 'test'
              : 'prod'
          ),
        lang: data.language,
        siteTitle: data.site_title,
        appPrefix: data.app_prefix,
        appName: data.app_name,
        plugins: data.plugins,
        cdn: data.static_path
      }
    });

    /*
     * Managers.
     *
     * WindowManager should exist before managers that may
     * need to resolve a MessagePort into a window.
     */
    this.windowManager = new WindowManager(this);
    this.dataManager = new DataManager(this, bbn.dbCenter());
    this.poller = new Poller(this);
    this.searchManager = new SearchManager(this);
    this.notificationHandler = new NotificationHandler(this);
    this.messageHandler = new MessageHandler(this);

    /*
     * Optional generic state which genuinely belongs to
     * the service itself rather than one of the managers.
     */
    this.numberOfRequests = 0;
    this.allRequests = [];

    this.scope.onconnect = event => {
      const port = event.ports?.[0];

      if (!port) {
        return;
      }

      this.addPort(port);
    };
  }


  /**
   * Starts the SharedWorker service.
   */
  async start() {
    /*
     * Prepare IndexedDB before messages start using it.
     */
    try {
      await this.dataManager.setUpDb();
    }
    catch (e) {
      this.log(
        'Error while setting up SharedWorker database',
        e
      );
    }

    /*
     * Initialize the realtime Poller.
     *
     * It will do nothing until:
     * - at least one window is connected;
     * - the application/session is connected.
     */
    this.poller.setPoller();

    return this;
  }


  /**
   * Current registered windows.
   */
  get windows() {
    return this.windowManager.windows;
  }


  /**
   * Whether the application/server session is connected.
   */
  get isConnected() {
    return this.#isConnected;
  }


  /**
   * Mark application session as connected.
   */
  connect() {
    if (this.#isConnected === true) {
      return false;
    }

    this.#isConnected = true;

    /*
     * Poller owns the single WebSocket.
     */
    this.poller.launchPoller();

    return true;
  }


  /**
   * Mark application session as disconnected.
   */
  disconnect() {
    if (this.#isConnected === false) {
      return false;
    }

    this.#isConnected = false;

    /*
     * A disconnected application/session shouldn't keep
     * the realtime WebSocket alive.
     */
    this.poller.stop();

    return true;
  }


  /**
   * Registers a new browser MessagePort.
   *
   * @param {MessagePort} port
   */
  addPort(port) {
    if (!port || this.ports.has(port)) {
      return false;
    }

    this.ports.add(port);

    port.onmessage = event => {
      this.handlePortMessage(port, event);
    };

    port.onmessageerror = event => {
      this.log(
        'SharedWorker MessagePort messageerror',
        event
      );
    };

    port.start();

    port.postMessage({
      type: 'init',
      data: {
        hello: 'world'
      }
    });

    /*
     * There is now at least one active browser context.
     *
     * Poller decides whether the WebSocket should actually
     * be opened.
     */
    this.poller.clientsChanged();

    return true;
  }


  /**
   * Removes a MessagePort and its corresponding window.
   *
   * @param {MessagePort} port
   * @param {Boolean} removeWindow
   */
  removePort(port, removeWindow = true) {
    if (!port || !this.ports.has(port)) {
      return false;
    }

    if (removeWindow) {
      /*
       * WindowManager also removes the port/window mapping.
       *
       * We don't want it to recursively manipulate
       * core.ports here.
       */
      const windowId =
        this.windowManager.portToWindow.get(port);

      if (windowId) {
        this.windowManager.remove(windowId);
      }
    }

    this.ports.delete(port);

    /*
     * Let Poller react to the changed client collection.
     *
     * If there are no ports left, it won't reconnect.
     */
    this.poller.clientsChanged();

    try {
      port.onmessage = null;
      port.onmessageerror = null;
      port.close();
    }
    catch (e) {
      /*
       * Port may already effectively be gone.
       */
    }

    return true;
  }


  /**
   * Main entry point for messages coming from windows.
   *
   * @param {MessagePort} port
   * @param {MessageEvent} event
   */
  async handlePortMessage(port, event) {
    try {
      /*
       * IndexedDB messages are special because dbCenter
       * already knows its own protocol.
       *
       * If it consumed the message, stop here.
       */
      const processed =
        await this.dataManager.handleMessage(event);

      if (processed) {
        return true;
      }

      /*
       * Specialized managers first.
       *
       * Each returns true when it recognizes/consumes
       * the message.
       */
      if (
        this.windowManager.handleMessage?.(
          port,
          event
        )
      ) {
        return true;
      }

      if (
        this.searchManager.handleMessage?.(
          port,
          event
        )
      ) {
        return true;
      }

      if (
        this.notificationHandler.handleMessage?.(
          port,
          event
        )
      ) {
        return true;
      }

      /*
       * MessageHandler is deliberately last because
       * untyped messages may be interpreted as poller
       * or application state.
       */
      if (
        await this.messageHandler.handleMessage(
          port,
          event
        )
      ) {
        return true;
      }

      /*
       * AppuiWorkerService-specific protocol.
       */
      const message = event.data;

      switch (message?.type) {
        /*
         * Delegate all realtime sending to Poller.
         */
        case 'send':
          this.poller.send(message.data);
          return true;

        /*
         * Poller is the authority on WebSocket state.
         */
        case 'status':
          port.postMessage({
            type: 'status',
            connected: this.poller.connected
          });

          return true;
      }

      return false;
    }
    catch (e) {
      this.log(
        'Error processing SharedWorker message',
        e
      );

      return false;
    }
  }


  /**
   * Broadcasts a message to every active SharedWorker port.
   *
   * Failed ports are removed automatically.
   *
   * @param {Object} message
   */
  broadcast(message) {
    const dead = [];

    for (const port of this.ports) {
      try {
        port.postMessage(message);
      }
      catch (e) {
        dead.push(port);
      }
    }

    for (const port of dead) {
      this.removePort(port);
    }

    return this.ports.size - dead.length;
  }


  /**
   * Sends logs to connected application windows.
   */
  log(...args) {
    /*
     * Keep worker-side logging too.
     */
    try {
      for (const arg of args) {
        bbn.fn.log(arg);
      }
    }
    catch (e) {
      console.log(...args);
    }

    this.broadcast({
      type: 'log',
      data: {
        logs: this.makeCloneable(args)
      }
    });
  }


  /**
   * Sends debug information to registered application
   * windows.
   *
   * @param {*} data
   */
  debug(data) {
    this.broadcast({
      type: 'debug',
      data: this.makeCloneable(data),
      windows:
        this.windowManager.getPublicWindows()
    });
  }


  /**
   * Makes diagnostic data structured-clone safe.
   *
   * This is intentionally only used for logs/debug data,
   * not normal application messages.
   */
  makeCloneable(data) {
    try {
      structuredClone(data);

      return data;
    }
    catch (e) {
      try {
        return JSON.parse(
          JSON.stringify(data)
        );
      }
      catch (e2) {
        return String(data);
      }
    }
  }


  /**
   * Checks whether the user/session is connected.
   */
  async checkConnection() {
    try {
      const response = await this.fetch(
        '/' +
        this.data.plugins['appui-core'] +
        '/connected',
        {},
        'POST'
      );

      if (
        response &&
        ('connected' in response) &&
        response.connected !== this.#isConnected
      ) {
        if (response.connected) {
          this.connect();
        }
        else {
          this.disconnect();
        }
      }

      return this.#isConnected;
    }
    catch (e) {
      this.log(
        'Error checking connection status',
        e
      );

      return this.#isConnected;
    }
  }


  /**
   * Generic JSON HTTP helper.
   */
  async fetch(
    url,
    params,
    meth = 'POST'
  ) {
    const response = await fetch(
      url,
      {
        method: meth,
        body:
          meth === 'GET' || meth === 'HEAD'
            ? undefined
            : JSON.stringify(params || {}),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      }
    );

    if (!response.ok) {
      throw new Error(
        'Fetch error: ' +
        response.status
      );
    }

    /*
     * 204 / empty bodies should not generate a JSON error.
     */
    if (
      response.status === 204 ||
      !response.headers
        .get('content-type')
        ?.includes('application/json')
    ) {
      const text = await response.text();

      return text
        ? JSON.parse(text)
        : null;
    }

    const data = await response.json();

    /*
     * Preserve the old ServiceWorker behaviour.
     */
    if (data?.disconnected) {
      this.disconnect();

      this.broadcast({
        type: 'DISCONNECTED'
      });

      return null;
    }

    return data;
  }


  /**
   * SHA hash helper retained from ServiceWorkerAdmin.
   */
  async hash(
    message,
    algo = 'SHA-256'
  ) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const binary = await crypto.subtle.digest(
      algo,
      data
    );

    return Array
      .from(new Uint8Array(binary))
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(2, '0')
      )
      .join('');
  }


  /**
   * Stops worker-managed resources.
   *
   * Mostly useful during development/tests.
   */
  destroy() {
    /*
     * Poller is solely responsible for closing the
     * WebSocket and cancelling reconnect timers.
     */
    this.poller.stop?.();

    this.searchManager.abort?.();

    for (const port of Array.from(this.ports)) {
      this.removePort(port);
    }
  }
}
