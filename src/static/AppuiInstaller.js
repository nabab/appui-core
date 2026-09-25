/**
 * @fileoverview AppuiInstaller
 * 
 * This module provides the `AppuiInstaller` class, which handles the client-side
 * bootstrap process for an application built on the "bbn" framework (or similar).
 * 
 * **Primary Responsibilities:**
 * 1. **Connection Check**: Verifies if the user is currently authenticated via a backend endpoint.
 * 2. **Configuration Retrieval**: Fetches the necessary configuration data (scripts, initialization code) from the server based on connection status.
 * 3. **Dynamic Script Loading**: Dynamically injects required JavaScript files into the DOM, supporting both standard and ES modules.
 * 4. **Execution**: Evaluates and executes the bootstrap function returned by the server to initialize the application UI.
 * 5. **Service Worker Registration**: Registers a Service Worker for caching purposes (decoupled from app initialization).
 * 
 * The class manages its own state (`isInit`, `connected`) and provides utility methods for logging, displaying loading/error messages, and making authenticated JSON requests.
 */

export default class AppuiInstaller {
  /**
   * @private
   * Indicates whether the application initialization process has started or completed.
   * Once set to true, subsequent calls to `init()` will be ignored to prevent parallel bootstrapping.
   * @type {boolean}
   */
  #isInit = false;

  /**
   * @private
   * Stores the connection status of the current user/session.
   * `null` indicates state has not yet been determined, `true` means connected, `false` means not connected.
   * @type {boolean|null}
   */
  #connected = null;

  /**
   * @param {string} siteUrl - The base URL of the application backend (e.g., "https://example.com/").
   */
  constructor(siteUrl) {
    this.siteUrl = siteUrl;
  }

  /**
   * Gets the initialization status.
   * 
   * @readonly
   * @type {boolean}
   */
  get isInit() {
    return this.#isInit;
  }

  /**
   * Gets the current connection status.
   * 
   * @readonly
   * @type {boolean|null}
   */
  get connected() {
    return this.#connected;
  }

  /**
   * Sets the initialization flag.
   * This setter ensures that once initialized, it cannot be reset to false (preventing re-initialization).
   * 
   * @param {boolean} value - The new state for the init flag.
   */
  set isInit(value) {
    if (!this.#isInit && value) {
      this.#isInit = true;
    }
  }

  /**
   * Logs arguments to the console.
   * 
   * @param {...*} args - Any number of arguments to log.
   */
  log(...args) {
    for (const arg of args) {
      console.log(arg);
    }
  }

  /**
   * Updates the text content of the loading message element in the DOM.
   * 
   * @param {string} msg - The HTML string to display as a loading status.
   */
  loadMessage(msg) {
    const ele = document.getElementById('loading_message');

    if (ele) {
      ele.innerHTML = msg;
    }
  }

  /**
   * Updates the text content of the error message element in the DOM.
   * 
   * @param {string} msg - The HTML string to display as an error status.
   */
  errorMessage(msg) {
    const ele = document.getElementById('error_message');

    if (ele) {
      ele.innerHTML = msg;
    }
  }

  /**
   * Dynamically loads a script file into the DOM.
   * If the script is already present, it resolves immediately without reloading.
   * 
   * @param {string} url - The URL of the script to load.
   * @param {boolean} [module=false] - Whether to load the script as an ES module (`type="module"`).
   * @returns {Promise<void>} A promise that resolves when the script is loaded, or rejects if loading fails.
   */
  async load(url, module = false) {
    return new Promise((resolve, reject) => {
      let script = document.querySelector(
        `script[src="${url}"]`
      );

      // If script already exists in DOM, resolve immediately
      if (script) {
        resolve();
        return;
      }

      script = document.createElement('script');

      if (module) {
        script.type = 'module';
      }

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(
          new Error(
            'Failed to load script: ' + url
          )
        );
      };

      script.src = url;

      document.head.appendChild(script);
    });
  }

  /**
   * Creates the main container element for the application UI if it does not already exist.
   * The container is initially hidden (opacity: 0) and transitions to visible when ready.
   */
  buildContainer() {
    let container = document.body.querySelector(
      '.appui-container'
    );

    if (!container) {
      container = document.createElement('div');
      container.className = 'appui-container';
      container.style.opacity = '0';
      container.style.transition = 'opacity 0.5s';

      const appui = document.createElement('div');
      appui.className = 'appui';

      container.appendChild(appui);
      document.body.appendChild(container);
    }
  }

  buildCustomCss(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Generic JSON request used during application bootstrap.
   * 
   * @param {string} url - The endpoint URL to fetch from.
   * @param {Object} [params={}] - The data object to send in the request body (for POST/PUT/PATCH).
   * @param {string} [method='POST'] - The HTTP method to use ('GET', 'POST', etc.).
   * @returns {Promise<Object>} A promise that resolves with the parsed JSON response.
   * @throws {Error} If the HTTP request fails or returns a non-OK status.
   */
  async fetch(url, params = {}, method = 'POST') {
    if ((method === 'POST') && !Object.keys(params || {}).length) {
      params = {_bbn: 1};
    }
    const hasBody = !['GET', 'HEAD'].includes(method);;
    const opt = {
      method,
      credentials: 'same-origin'
    };
    if (hasBody) {
      opt.headers = {
        'Content-Type': 'application/json'
      };
      opt.body = JSON.stringify(params);
    }

    let response;
    try {
      response = await window.fetch(url, opt);
    }
    catch (err) {
      throw new Error(`Network error fetching ${url}: ${err.message}`);
    }

    if (!response.ok) {
      throw new Error(
        `HTTP error ${response.status} for ${url}`
      );
    }

    try {
      return response.json();
    }
    catch {
      return response.text();
    }
  }

  /**
   * Checks whether the current user/session is connected.
   * 
   * @returns {Promise<boolean>} A promise that resolves to true if connected, false otherwise.
   */
  async checkConnection() {
    console.log("TRYING TO REACH " + this.siteUrl + 'core/connected');
    const data = await this.fetch(
      this.siteUrl + 'core/connected'
    );

    this.#connected = !!data?.connected;

    this.log(
      'Checking connection: ' +
        (
          this.#connected
            ? 'Connected'
            : 'Not connected'
        )
    );

    return this.#connected;
  }

  /**
   * Retrieves the configuration necessary to bootstrap
   * either the logged-in application or login screen.
   * 
   * @param {boolean} connected - Whether the user is currently connected/authenticated.
   * @returns {Promise<Object>} A promise that resolves with the configuration data from the server.
   */
  async retrieveConfig(connected) {
    return this.fetch(
      this.siteUrl + 'core/index',
      {
        get: 1,
        login: connected ? 0 : 1
      }
    );
  }

  /**
   * Loads all scripts returned by the bootstrap endpoint.
   * 
   * @param {Object} data - The configuration object containing script sources.
   * @returns {Promise<void>} A promise that resolves when all scripts are loaded.
   */
  async loadScripts(data) {
    if (!data?.script_src) {
      return;
    }

    const scripts = Array.isArray(data.script_src)
      ? data.script_src
      : [data.script_src];

    for (const src of scripts) {
      // Heuristic: treat as module if filename contains 'index.js'
      await this.load(
        src,
        src.indexOf('index.js') > -1
      );
    }
  }

  /**
   * Executes the bootstrap script returned by the server.
   * 
   * @param {Object} data - The configuration object containing the bootstrap script code and other metadata.
   * @returns {Promise<void>} A promise that resolves when the bootstrap function has executed.
   * @throws {Error} If no config is received, if `window.bbn` is not loaded after scripts, or if the bootstrap script does not return a function.
   */
  async execute(data) {
    if (!data) {
      throw new Error('No application configuration received');
    }

    await this.loadScripts(data);
    // Verify that the core framework (bbn) has been loaded by the scripts
    if (!window.bbn) {
      throw new Error('Application configuration received but bbn is not loaded');
    }

    if (data.custom_css) {
      this.buildCustomCss(data.custom_css);
    }

    this.buildContainer();
    if (!data.script) {
      return;
    }

    // Safely evaluate the bootstrap script string to get a function
    let fn;
    try {
      fn = eval(data.script);
    } catch (e) {
      throw new Error('Error evaluating bootstrap script: ' + e.message);
    }

    if (typeof fn !== 'function') {
      throw new Error('Bootstrap script did not return a function');
    }

    await fn(data);
  }

  /**
   * Initializes the application directly from the server.
   * 
   * No ServiceWorker/SharedWorker communication is involved in this step.
   * This method orchestrates the full bootstrap sequence: check connection, fetch config, load scripts, and execute.
   * 
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   * @throws {Error} If any part of the initialization process fails.
   */
  async init() {
    if (this.isInit) {
      return;
    }

    /*
     * Mark it immediately so multiple init() calls cannot
     * start bootstrap in parallel.
     */
    this.isInit = true;

    try {
      this.loadMessage('Checking connection...');
      const connected = await this.checkConnection();
      this.loadMessage(
        connected
          ? 'Loading application...'
          : 'Loading login...'
      );
      const response = await this.retrieveConfig(connected);

      /*
       * Depending on the backend response, index may return
       * the configuration directly or wrapped in `data`.
       */
      const data = response?.data || response;
      await this.execute(data);
      this.loadMessage('Initialization complete.');
    } catch (e) {
      this.log('Application initialization failed', e);
      this.errorMessage(e.message || 'Application initialization failed');
      throw e;
    }
  }

  /**
   * Registers the ServiceWorker used exclusively for cache.
   * 
   * App initialization does NOT depend on SW messages and
   * does not need the SW to control the current page.
   * 
   * @returns {Promise<ServiceWorkerRegistration|null>} A promise that resolves with the registration object, or null if unsupported/failed.
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      this.log('Service workers are not supported');

      return null;
    }

    try {
      const registration =
        await navigator.serviceWorker.register(
          '/sw',
          {
            type: 'module',
            scope: '/'
          }
        );

      this.log('Service worker registered');

      /*
       * We deliberately don't wait for controller here.
       *
       * The worker is now only responsible for caching,
       * therefore application bootstrap does not depend
       * on it controlling this page.
       */
      return registration;
    } catch (e) {
      /*
       * A caching failure should normally not prevent the
       * application itself from starting.
       */
      this.log('Service worker registration failed', e);
      return null;
    }
  }

  /**
   * Main application startup entry point.
   * 
   * This method triggers Service Worker registration (in parallel) and then awaits the full application initialization.
   * 
   * @returns {Promise<AppuiInstaller>} A promise that resolves with the instance itself, allowing for chaining.
   */
  async setUp() {
    /*
     * Start ServiceWorker registration independently.
     *
     * Do not await it before bootstrapping the application,
     * since the SW is only used for cache now.
     */
    await this.registerServiceWorker();
    // Await full app initialization
    await this.init();
    return this;
  }
}
