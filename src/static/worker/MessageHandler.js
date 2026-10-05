import bbn from '/static/lib/bbn-js/v2/dist/bbn.sw.js';

export class MessageHandler {
  constructor(core) {
    this.core = core;
    this.lastClientMessage = {};
    this.lastResponse = {};
  }

  async handleMessage(port, event) {
    const message = event.data;
    if (!message?.type) return false;
    const data = message.data ?? {};
    switch (message.type) {
      case 'start': await this.onMessageStart(port, data); return true;
      case 'test': await this.onMessageTest(port, data); return true;
      case 'connection': await this.onMessageConnection(port); return true;
      case 'init': await this.onMessageInit(port); return true;
      case 'login': await this.onMessageLogin(port); return true;
      case 'initCompleted': this.core.connect(); return true;
      case 'registerChannel': this.onMessageRegisterChannel(port, message); return true;
      case 'unregisterChannel': this.onMessageUnregisterChannel(port, message); return true;
      case 'messageChannel': this.onMessageChannel(port, message); return true;
      case 'messageFromChannel': return true;
      case 'beforeRouting': this.onMessageBeforeRouting(port, data); return true;
      case 'routing': this.onMessageRouting(port, data); return true;
      case 'open-link': this.onMessageOpenLink(port, data); return true;
      case 'clientMessage': this.processClientMessage(port, data); return true;
      default: return false; // Never swallow someone else's protocol.
    }
  }

  send(port, message) {
    if (!port) return false;
    try { port.postMessage(message); return true; }
    catch (error) {
      this.core.log?.('Unable to send to window', error);
      return false;
    }
  }

  getWindow(port) { return this.core.windowManager.getWindowFromPort(port); }

  /** The ONE entry point for PHP's {type, data} WebSocket protocol. */
  async processSocketMessage(message) {
    if (!message || typeof message !== 'object' || Array.isArray(message)
      || typeof message.type !== 'string') return false;

    if (message.type === 'windows') {
      // Only this explicit event uses the old per-window response structure.
      return this.processServerMessage(message.data);
    }
    if (message.type === 'error') {
      this.core.log?.('WebSocket server error', message.data);
    }
    // Socket notifications are distinct from window-manager/channel protocols.
    // All tabs sharing this socket receive the envelope, including subscription ACKs.
    this.core.broadcast({type: 'socket', data: message});
    return true;
  }

  /** Legacy response, now nested under {type:'windows', data:{windowId: ...}}. */
  async processServerMessage(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    const windows = this.core.windowManager.windows;
    for (const [windowId, message] of Object.entries(obj)) {
      if (!Object.hasOwn(windows, windowId)) continue;
      const win = windows[windowId];
      if (!message || typeof message !== 'object' || Array.isArray(message)) continue;
      if (message.disconnected) {
        this.core.disconnect();
        this.core.broadcast({type: 'DISCONNECTED'});
      }
      if (message.plugins && typeof message.plugins === 'object') {
        if (!win.data || typeof win.data !== 'object' || Array.isArray(win.data)) win.data = {};
        for (const [plugin, pluginData] of Object.entries(message.plugins)) {
          if (['__proto__', 'constructor', 'prototype'].includes(plugin)) continue;
          const workers = pluginData?.serviceWorkers;
          if (!workers || typeof workers !== 'object' || Array.isArray(workers)) continue;
          if (!win.data[plugin] || typeof win.data[plugin] !== 'object' || Array.isArray(win.data[plugin])) {
            win.data[plugin] = {};
          }
          for (const [key, value] of Object.entries(workers)) {
            if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
              win.data[plugin][key] = value;
            }
          }
        }
      }
      if (win.port) this.send(win.port, {type: 'message', data: message});
    }
    this.lastResponse = obj;
    return true;
  }

  processClientMessage(port, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Client metadata must be an object');
    }
    const win = this.getWindow(port);
    if (!win) {
      this.core.log?.('Client data received from an unregistered window');
      return false;
    }
    if (data.token) {
      if (!win.token) win.token = data.token;
      else if (win.token !== data.token) throw new Error("The token doesn't correspond");
    }
    this.lastClientMessage = data;
    win.data = data;
    // No AbortController/long-poll logic remains. Send the new snapshot now.
    this.core.poller.clientsChanged();
    return true;
  }

  onMessageOpenLink(port, data) {
    if (!data?.url || !data?.windowId) return false;
    return this.send(this.core.windowManager.getPort(data.windowId), {
      type: 'open-link', data: {url: data.url}
    });
  }

  onMessageBeforeRouting(port, data) {
    if (!data?.url) return false;
    const sender = this.getWindow(port);
    if (!sender) return false;
    for (const [windowId, win] of Object.entries(this.core.windowManager.windows)) {
      if (windowId === sender.windowId) continue;
      const row = bbn.fn.getRow(win.views || [], item => item?.current?.startsWith(data.url));
      if (row) {
        this.send(port, {type: 'routing', data: {windowId, url: data.url}});
        return true;
      }
    }
    this.send(port, {type: 'routing', data: {ok: true, url: data.url}});
    return true;
  }

  onMessageRouting(port, data) {
    return this.core.windowManager.update(port, data);
  }

  async onMessageInit(port) {
    await this.core.dataManager.retrieveIndexCfg();
    return this.send(port, {type: 'init', data: this.core.dataManager.indexCfg});
  }

  async onMessageLogin(port) {
    await this.core.dataManager.retrieveLoginCfg();
    return this.send(port, {type: 'login', data: this.core.dataManager.loginCfg});
  }

  async onMessageConnection(port) {
    await this.core.checkConnection();
    return this.send(port, {type: 'connection', data: {connected: this.core.isConnected}});
  }

  onMessageRegisterChannel(port, message) {
    const channel = message.channel ?? message.data?.channel;
    const win = this.getWindow(port);
    if (typeof channel !== 'string' || !channel || !win) return false;
    win.channels ||= [];
    if (!win.channels.includes(channel)) win.channels.push(channel);
    return true;
  }

  onMessageUnregisterChannel(port, message) {
    const channel = message.channel ?? message.data?.channel;
    const win = this.getWindow(port);
    if (!channel || !win?.channels) return false;
    const index = win.channels.indexOf(channel);
    if (index >= 0) win.channels.splice(index, 1);
    return true;
  }

  onMessageChannel(port, message) {
    if (!message.channel) return false;
    const sender = this.getWindow(port);
    for (const [windowId, win] of Object.entries(this.core.windowManager.windows)) {
      if (windowId !== sender?.windowId && win.channels?.includes(message.channel)) {
        this.send(win.port, {
          type: 'messageFromChannel', channel: message.channel, data: message.data
        });
      }
    }
    return true;
  }

  onMessageFromChannel() { return true; }

  async onMessageTest(port, data) {
    this.core.log?.('TEST MESSAGE', data, this.getWindow(port)?.windowId);
    return true;
  }

  async onMessageStart() {
    const response = await this.core.fetch(this.core.data.site_url + 'core/index', {test: 1});
    this.core.log?.('RESPONSE', response);
    return true;
  }
}
