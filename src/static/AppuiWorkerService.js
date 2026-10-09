import bbn from '/static/lib/bbn-js/v2/dist/bbn.sw.js';
import {DataManager} from './worker/DataManager.js';
import {Poller} from './worker/Poller.js';
import {MessageHandler} from './worker/MessageHandler.js';
import {WindowManager} from './worker/WindowManager.js';
import {NotificationHandler} from './worker/NotificationHandler.js';
import {SearchManager} from './worker/SearchManager.js';

export default class AppuiWorkerService {
  #isConnected = null;

  constructor(scope, socketUrl, data) {
    this.scope = scope;
    this.socketUrl = socketUrl;
    this.data = data;
    scope.app = this;
    this.ports = new Set();
    this.portQueues = new Map();
    this.destroyed = false;
    this.startPromise = null;
    bbn.fn.init({env: {
      logging: data.is_dev,
      isDev: data.is_dev,
      mode: data.is_dev ? 'dev' : data.is_test ? 'test' : 'prod',
      lang: data.language,
      siteTitle: data.site_title,
      appPrefix: data.app_prefix,
      appName: data.app_name,
      plugins: data.plugins,
      cdn: data.static_path
    }});
    this.windowManager = new WindowManager(this);
    this.dataManager = new DataManager(this, bbn.dbCenter());
    this.poller = new Poller(this);
    this.searchManager = new SearchManager(this);
    this.notificationHandler = new NotificationHandler(this);
    this.messageHandler = new MessageHandler(this);
    this.numberOfRequests = 0;
    this.allRequests = [];
    scope.onconnect = event => {
      const port = event.ports?.[0];
      if (port && !this.destroyed) this.addPort(port);
    };
  }

  async start() {
    if (this.destroyed) throw new Error('Worker service has been destroyed');
    if (!this.startPromise) {
      this.startPromise = (async () => {
        try { await this.dataManager.setUpDb(); }
        catch (error) { this.log('Error setting up SharedWorker database', error); }
        if (!this.destroyed) {
          await this.poller.launchPoller();
        }

        return this;
      })();
    }
    return this.startPromise;
  }

  get windows() { return this.windowManager.windows; }
  get isConnected() { return this.#isConnected; }

  async connect() {
    if (this.destroyed) return false;
    const changed = this.#isConnected !== true;
    this.#isConnected = true;
    await this.poller.launchPoller();
    return changed;
  }

  disconnect() {
    const changed = this.#isConnected !== false;
    this.#isConnected = false;
    this.poller.stop();
    // An account/session change must not inherit another account's subscriptions.
    this.poller.clearSubscriptions();
    return changed;
  }

  addPort(port) {
    if (!port || this.destroyed || this.ports.has(port)) return false;
    this.ports.add(port);
    this.portQueues.set(port, Promise.resolve());
    port.onmessage = event => {
      // Await each message for THIS port; async init must not be overtaken by its next message.
      const next = (this.portQueues.get(port) || Promise.resolve())
        .then(async () => {
          await this.start();
          if (this.ports.has(port)) await this.handlePortMessage(port, event);
        })
        .catch(error => this.log('SharedWorker port handler failed', error));
      this.portQueues.set(port, next);
    };
    port.onmessageerror = event => this.log('MessagePort messageerror', event);
    port.start();
    port.postMessage({type: 'init', data: {hello: 'world'}});
    this.poller.clientsChanged();
    return true;
  }

  removePort(port, removeWindow = true) {
    if (!port || !this.ports.has(port)) return false;
    const windowId = this.windowManager.portToWindow.get(port);
    // Delete FIRST so a WindowManager callback cannot recursively remove this port.
    this.ports.delete(port);
    this.portQueues.delete(port);
    this.poller.removePort(port);
    if (removeWindow && windowId) this.windowManager.remove(windowId);
    if (!this.destroyed) this.poller.clientsChanged();
    try {
      port.onmessage = port.onmessageerror = null;
      port.close();
    } catch (_) {}
    return true;
  }

  async handlePortMessage(port, event) {
    if (this.destroyed || !this.ports.has(port)) return false;
    const message = event.data;
    try {
      // Service-level realtime commands go BEFORE managers to avoid accidental swallowing.
      switch (message?.type) {
        case 'send': {
          const envelope = message.data;
          if (envelope?.type === 'subscribe') {
            this.poller.subscribeFor(port, envelope.data);
          } else if (envelope?.type === 'unsubscribe') {
            this.poller.unsubscribeFor(port, envelope.data);
          } else {
            const ok = this.poller.send(envelope);
            port.postMessage({type: 'send:result', data: {ok, requestId: message.requestId ?? null}});
          }
          return true;
        }
        case 'subscribe':
        case 'unsubscribe': {
          const events = message.type === 'subscribe'
            ? this.poller.subscribeFor(port, message.data)
            : this.poller.unsubscribeFor(port, message.data);
          // Local requested state. PHP's subscribed/unsubscribed messages are the ACKs.
          port.postMessage({type: 'subscriptions', data: {events, connected: this.poller.connected}});
          return true;
        }
        case 'status':
          port.postMessage({type: 'status', connected: this.poller.connected});
          return true;
        case 'detach':
          return this.removePort(port);
      }
      if (await this.dataManager.handleMessage(event)) return true;
      for (const manager of [this.windowManager, this.searchManager, this.notificationHandler]) {
        if (await manager.handleMessage?.(port, event)) return true;
      }
      return await this.messageHandler.handleMessage(port, event);
    } catch (error) {
      this.log('Error processing SharedWorker message', error);
      try { port.postMessage({type: 'worker:error', data: {message: error.message}}); } catch (_) {}
      return false;
    }
  }

  broadcast(message) {
    let sent = 0;
    const dead = [];
    for (const port of Array.from(this.ports)) {
      try { port.postMessage(message); sent++; }
      catch (_) { dead.push(port); }
    }
    for (const port of dead) this.removePort(port);
    return sent; // Failed ports are not subtracted twice.
  }

  log(...args) {
    try { for (const arg of args) bbn.fn.log(arg); }
    catch (_) { console.log(...args); }
    this.broadcast({type: 'log', data: {logs: this.makeCloneable(args)}});
  }

  debug(data) {
    this.broadcast({
      type: 'debug', data: this.makeCloneable(data),
      windows: this.windowManager.getPublicWindows()
    });
  }

  makeCloneable(data) {
    try { structuredClone(data); return data; }
    catch (_) {
      try { return JSON.parse(JSON.stringify(data)); }
      catch (_) { return String(data); }
    }
  }

  async checkConnection() {
    try {
      const response = await this.fetch('/' + this.data.plugins['appui-core'] + '/connected', {});
      if (typeof response?.connected === 'boolean' && response.connected !== this.#isConnected) {
        if (response.connected) {
          await this.connect();
        }
        else {
          this.disconnect();
        }
      }
    } catch (error) { this.log('Error checking session status', error); }
    return this.#isConnected;
  }

  async fetch(url, params, method = 'POST') {
    method = method.toUpperCase();
    const response = await globalThis.fetch(url, {
      method,
      body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(params ?? {}),
      headers: {'Content-Type': 'application/json'},
      credentials: 'same-origin'
    });
    if (!response.ok) throw new Error('Fetch error: ' + response.status);
    if (response.status === 204) return null;
    const text = await response.text();
    if (!text.trim()) return null;
    const data = JSON.parse(text);
    if (data?.disconnected) {
      this.disconnect();
      this.broadcast({type: 'DISCONNECTED'});
      return null;
    }
    return data;
  }

  async hash(message, algo = 'SHA-256') {
    const binary = await crypto.subtle.digest(algo, new TextEncoder().encode(message));
    return Array.from(new Uint8Array(binary), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.#isConnected = false;
    this.poller.stop();
    this.poller.clearSubscriptions();
    this.searchManager.abort?.();
    this.scope.onconnect = null;
    for (const port of Array.from(this.ports)) this.removePort(port);
  }
}
