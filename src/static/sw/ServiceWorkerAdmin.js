import { CacheManager } from './CacheManager.js';
import { Poller } from './Poller.js';
import { MessageHandler } from './MessageHandler.js';
import { WindowManager } from './WindowManager.js';
import { NotificationHandler } from './NotificationHandler.js';
import { SearchManager } from './SearchManager.js';
import { DataManager } from './DataManager.js';
export { CacheManager, Poller, MessageHandler, WindowManager, NotificationHandler, SearchManager, DataManager};


export default class ServiceWorkerAdmin {
  #isConnected = null;
  constructor(data) {
    this.data = data;
    console.log("DATA");
    console.log(data);
    const version = data.version;
    /**
     * @const {String} CACHE_NAME The cache name
     * @example "v39"
     */
    const CACHE_VERSION = 18;
    this.CACHE_NAME = 'v' + data.version + '.' + CACHE_VERSION;
    // Initialize all components
    this.cacheManager = new CacheManager(this);
    this.poller = new Poller(this);
    this.messageHandler = new MessageHandler(this);
    this.windowManager = new WindowManager(this);
    this.notificationHandler = new NotificationHandler(this);
    this.searchManager = new SearchManager(this);
    this.dataManager = new DataManager(this);

    // Initialize state variables
    this.offlineTimeout = 3600000;
    this.isRunning = false;
    this.isFocused = false;
    this.errorState = false;
    this.lastFocused = (new Date()).getTime();
    this.retries = 0;
    this.aborter = null;
    this.interval = null;
    this.intervalObj = null;
    this.lastChat = 0;
    this.observers = {};
    this.noResp = false;
    this.lastClientMessage = {};
    this.lastResponse = {};
    this.numberOfRequests = 0;
    this.allRequests = [];
    this.searchValue = '';
    this.searchAborter = null;
    this.searchReader = null;
    this.jsonSearch = '';
    this.indexCfg = null;
    this.loginCfg = null;

    // Set up event listeners
    this.setupEventListeners();
    bbn.fn.init({
      env: {
        logging: data.is_dev,
        isDev: data.is_dev,
        mode: data.is_dev ? 'dev' : (data.is_test ? 'test' : 'prod'),
        lang: data.language,
        siteTitle: data.site_title,
        appPrefix: data.app_prefix,
        appName: data.app_name,
        plugins: data.plugins,
        cdn: data.static_path,
      }
    });
    this.dbCenter = bbn.dbCenter();
  }

  get windows() {
    return this.windowManager?.windows || null;
  }

  connect() {
    this.#isConnected = true;
  }

  disconnect() {
    this.#isConnected = false;
  }

  get isConnected() {
    return this.#isConnected;
  }

  async checkConnection() {
    try {
      const response = await this.fetch('/' + this.data.plugins['appui-core'] + '/connected', {method: 'POST'});
      if ('connected' in response && (response.connected !== this.#isConnected)) {
        this[response.connected ? 'connect' : 'disconnect']();
      }
    } catch (e) {
      //this.disconnect();
      this.log("Error checking connection status");
    }
  }

  log(...args) {
    for (let i = 0; i < args.length; i++) {
      bbn.fn.log(args[i]);
    }
    self.clients.matchAll({ includeUncontrolled: true }).then(clientList => {
      clientList.forEach(client => {
        if (this.windows[client.id]) {
          try {
            client.postMessage({
              client: client.id,
              type: 'log',
              data: { logs: args }
            });
          } catch (e) {
            client.postMessage({
              client: client.id,
              type: 'log',
              data: { logs: JSON.parse(JSON.stringify(args)) }
            });
          }
        }
      })
    })
  }

  async fetch(url, params, meth = 'POST') {
    const d = await fetch(url, {method: meth, body: JSON.stringify(params || {}), headers: { 'Content-Type': 'application/json' } })
    if (d.status === 200) {
      const data = await d.json();
      if (data.disconnected) {
        self.clients.matchAll().then(clientList => {
          clientList.forEach(client => client.postMessage({ type: 'DISCONNECTED' }));
        });
        return null;
      }

      return data;
    }

    throw new Error("Fetch error: " + d.status);
  }

  debug(data) {
    self.clients.matchAll({ includeUncontrolled: true }).then(clientList => {
      clientList.forEach(client => {
        if (this.windows[client.id]) {
          try {
            client.postMessage({
              client: client.id,
              type: 'debug',
              data,
              windows: this.windows
            });
          } catch (e) { }
        }
      })
    })
  }

  setupEventListeners() {
    self.addEventListener('install', (event) => this.cacheManager.onInstall(event));
    self.addEventListener('activate', (event) => this.cacheManager.onActivate(event));
    self.addEventListener('fetch', (event) => this.cacheManager.onFetch(event));
    self.addEventListener('message', (event) => this.messageHandler.onMessage(event));
    self.onnotificationclick = (event) => this.notificationHandler.onnotificationclick(event);

    // Start the poller
    this.poller.setPoller(1);
  }

  async hash(message, algo = 'SHA-256') {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const binary = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(binary));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
}
