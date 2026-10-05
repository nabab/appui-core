const RESERVED = new Set([
  'subscribe', 'unsubscribe', 'connected', 'disconnected',
  'subscribed', 'unsubscribed', 'error'
]);
const NAME = /^[A-Za-z][A-Za-z0-9_.:-]{0,127}$/;

export class Poller {
  constructor(core) {
    this.core = core;
    this.pollerUrl = core.socketUrl || '/socket';
    this.socket = null;
    this.ready = false;
    this.stopped = false;
    this.isRunning = false;
    this.errorState = false;
    this.retries = 0;
    this.reconnectTimeout = null;
    this.connectionTimer = null;
    this.heartbeatTimer = null;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 60000;
    this.connectionTimeout = 15000;
    this.heartbeatDelay = 30000;
    this.heartbeatTimeout = 20000;
    this.offlineTimeout = 3600000;
    this.maxBufferedAmount = 1024 * 1024;
    this.lastPing = 0;
    this.awaitingPong = null;
    // Subscriptions are reference-counted by port through the union of these sets.
    this.portSubscriptions = new Map();
    this.sentSubscriptions = new Set();
  }

  /** Application-ready, not merely HTTP-upgraded. */
  get connected() {
    return this.ready && this.socket?.readyState === WebSocket.OPEN;
  }

  get connecting() {
    return this.socket?.readyState === WebSocket.CONNECTING
      || (this.socket?.readyState === WebSocket.OPEN && !this.ready);
  }

  setPoller() { this.launchPoller(); return this; }
  poll() { return this.launchPoller(); }
  retryPoll() { return this.scheduleReconnect(); }
  realTimeConnect() { return this.launchPoller(); }
  sendSocket(data) { return this.send(data); }

  canRun() {
    if (!this.pollerUrl || !this.core.isConnected || !this.core.ports.size) {
      return false;
    }
    const wm = this.core.windowManager;
    // Unregistered ports must be able to complete initialization.
    if (wm?.isFocused === false && wm.lastFocused > 0
      && Object.keys(wm.windows || {}).length
      && Date.now() - wm.lastFocused >= this.offlineTimeout) {
      return false;
    }
    return true;
  }

  launchPoller() {
    if (!this.canRun()) return false;
    if (this.connected || this.connecting) return true;
    if (this.reconnectTimeout !== null) return false;
    this.stopped = false;
    return this.connect();
  }

  connect() {
    if (this.stopped || !this.canRun()) return false;
    if (this.connected || this.connecting) return true;
    let socket;
    try {
      const url = this.getSocketUrl(this.pollerUrl);
      socket = new WebSocket(url);
      const attemptStarted = performance.now();

      socket.addEventListener('open', () => {
        console.log('WebSocket transport opened', {
          elapsedMs: Math.round(
            performance.now() - attemptStarted
          )
        });
      });

      socket.addEventListener('close', event => {
        console.warn('WebSocket transport closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          elapsedMs: Math.round(
            performance.now() - attemptStarted
          )
        });
      });
      socket.binaryType = 'arraybuffer';
    } catch (error) {
      this.errorState = true;
      this.core.log('Unable to create WebSocket', error);
      console.log()
      this.scheduleReconnect();
      return false;
    }
    this.socket = socket;
    this.ready = false;
    this.isRunning = true;
    this.connectionTimer = setTimeout(() => {
      if (this.socket === socket && !this.ready) {
        this.failSocket(socket, 'Connection initialization timed out');
      }
    }, this.connectionTimeout);

    socket.onopen = () => {
      if (this.socket !== socket) return;
      // Wait for PHP's {type:'connected'} after authentication/binding.
      this.core.log?.('WebSocket upgraded; waiting for server readiness');
    };

    // Serialize async decoding/dispatch so Blob conversion cannot reorder messages.
    let incoming = Promise.resolve();
    socket.onmessage = event => {
      incoming = incoming.then(async () => {
        if (this.socket !== socket) return;
        const message = await this.parseMessage(event.data);
        if (this.socket !== socket) return; // Guard again AFTER await.
        if (!message || typeof message !== 'object' || Array.isArray(message)
          || typeof message.type !== 'string' || !NAME.test(message.type)) {
          throw new Error('Invalid WebSocket envelope');
        }
        // Temporary diagnostics: log message types, not tokens or payloads.
        this.core.log?.('WebSocket received: ' + message.type);
        if (message.type === 'connected' && !this.ready) {
          this.ready = true;
          this.errorState = false;
          this.retries = 0;
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
          this.sentSubscriptions.clear();
          this.core.log?.('WebSocket ready', {fd: message.data?.fd ?? null});
          this.sendClients();
          this.syncSubscriptions();
          this.startHeartbeat();
          this.core.broadcast?.({type: 'connected', data: message.data});
        }
        if (message.type === 'pong') {
          this.awaitingPong = null;
          return;
        }
        await this.core.messageHandler.processSocketMessage(message);
      }).catch(error => {
        this.core.log?.('Error decoding or handling WebSocket message', error);
      });
    };

    socket.onerror = () => {
      if (this.socket !== socket) return;
      this.errorState = true;
      this.core.log?.('WebSocket transport error');
      // onclose or the initialization/heartbeat timeout handles recovery.
    };

    socket.onclose = event => {
      if (this.socket !== socket) return;
      this.core.log?.('WebSocket closed', {
        code: event.code,
        reason: event.reason || '(no reason)',
        wasReady: this.ready
      });
      this.releaseSocket();
      this.core.broadcast?.({
        type: 'disconnected', data: {code: event.code, reason: event.reason}
      });
      if (event.code === 4001 || event.code === 4003) {
        this.stopped = true;
        this.core.broadcast?.({
          type: 'socket:rejected', data: {code: event.code, reason: event.reason}
        });
        // Do not retry a rejected identity/origin forever.
        Promise.resolve(this.core.checkConnection?.()).catch(error => {
          this.core.log?.('Session check failed', error);
        });
        return;
      }
      this.errorState = !this.stopped;
      this.scheduleReconnect();
    };
    return true;
  }

  releaseSocket() {
    const socket = this.socket;
    this.socket = null;
    this.ready = false;
    this.isRunning = false;
    this.sentSubscriptions.clear();
    this.stopHeartbeat();
    clearTimeout(this.connectionTimer);
    this.connectionTimer = null;
    if (socket) {
      socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
    }
    return socket;
  }

  failSocket(socket, reason) {
    console.trace('Poller.failSocket() called', {
      reason
    });
    if (this.socket !== socket) return;
    this.core.log?.('WebSocket failure: ' + reason);
    this.releaseSocket();
    try { socket.close(4000, reason); } catch (_) {}
    this.errorState = true;
    this.core.broadcast?.({type: 'disconnected', data: {reason}});
    this.scheduleReconnect();
  }

  stop() {
    console.trace('Poller.stop() called');
    this.stopped = true;
    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
    const socket = this.releaseSocket();
    try { socket?.close(1000, 'Client stopped'); } catch (_) {}
    if (socket) this.core.broadcast?.({type: 'disconnected'});
    return true;
  }

  scheduleReconnect() {
    if (this.stopped || this.reconnectTimeout !== null || !this.canRun()) return false;
    const base = Math.min(
      this.reconnectDelay * 2 ** Math.min(this.retries++, 16),
      this.maxReconnectDelay
    );
    const delay = Math.min(this.maxReconnectDelay, Math.round(base * (0.8 + Math.random() * 0.4)));
    this.core.log?.('WebSocket reconnect scheduled in ' + delay + 'ms');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (!this.stopped && this.canRun()) this.connect();
    }, delay);
    return true;
  }

  async parseMessage(data) {
    if (typeof data === 'string') return JSON.parse(data);
    if (data instanceof Blob) return JSON.parse(await data.text());
    if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      return JSON.parse(new TextDecoder().decode(data));
    }
    throw new Error('Unsupported WebSocket payload');
  }

  /** Returns local enqueue success, not server acknowledgement. Does not queue offline. */
  send(message) {
    if (!this.connected) return false;
    try {
      if (!message || typeof message !== 'object' || Array.isArray(message)
        || typeof message.type !== 'string' || !NAME.test(message.type)) {
        throw new Error('Use {type: string, data: any}');
      }
      const json = JSON.stringify({type: message.type, data: message.data ?? null});
      const bytes = new TextEncoder().encode(json).byteLength;
      if (this.socket.bufferedAmount + bytes > this.maxBufferedAmount) {
        this.core.log?.('WebSocket outbound buffer limit reached');
        return false;
      }
      this.socket.send(json);
      return true;
    } catch (error) {
      this.core.log?.('WebSocket send failed', error);
      return false;
    }
  }

  sendClients() {
    const clients = Object.create(null);
    for (const [id, win] of Object.entries(this.core.windowManager.windows)) {
      clients[id] = win.data || {};
    }
    return this.send({type: 'clients', data: {clients}});
  }

  normalizeEvents(raw) {
    if (typeof raw === 'string') raw = [raw];
    if (raw && !Array.isArray(raw) && typeof raw === 'object') {
      raw = Object.hasOwn(raw, 'events') ? raw.events : Object.keys(raw);
    }
    if (!Array.isArray(raw) || !raw.length || raw.length > 256) {
      throw new Error('Provide between 1 and 256 events');
    }
    return [...new Set(raw.map(name => {
      if (typeof name !== 'string' || !NAME.test(name.trim()) || RESERVED.has(name.trim())) {
        throw new Error('Invalid or reserved event name');
      }
      return name.trim();
    }))];
  }

  desiredSubscriptions() {
    const events = new Set();
    for (const names of this.portSubscriptions.values()) {
      for (const name of names) events.add(name);
    }
    return events;
  }

  subscribeFor(port, raw) {
    if (!this.core.ports.has(port)) throw new Error('Unknown MessagePort');
    const events = this.normalizeEvents(raw);
    const desired = this.desiredSubscriptions();
    for (const event of events) desired.add(event);
    if (desired.size > 256) throw new Error('Too many subscriptions');
    const names = this.portSubscriptions.get(port) || new Set();
    for (const event of events) names.add(event);
    this.portSubscriptions.set(port, names);
    this.syncSubscriptions();
    return [...names];
  }

  unsubscribeFor(port, raw = null) {
    const names = this.portSubscriptions.get(port) || new Set();
    const all = raw === null || raw === '' || (Array.isArray(raw) && !raw.length);
    const remove = all ? [...names] : this.normalizeEvents(raw);
    for (const name of remove) names.delete(name);
    if (names.size) this.portSubscriptions.set(port, names);
    else this.portSubscriptions.delete(port);
    this.syncSubscriptions();
    return [...names];
  }

  removePort(port) {
    this.portSubscriptions.delete(port);
    if (this.core.ports.size) this.syncSubscriptions();
  }

  clearSubscriptions() {
    this.portSubscriptions.clear();
    if (this.connected) this.syncSubscriptions();
    else this.sentSubscriptions.clear();
  }

  syncSubscriptions() {
    if (!this.connected) return false;
    const wanted = this.desiredSubscriptions();
    const remove = [...this.sentSubscriptions].filter(name => !wanted.has(name));
    const add = [...wanted].filter(name => !this.sentSubscriptions.has(name));
    if (remove.length && this.send({type: 'unsubscribe', data: remove})) {
      for (const name of remove) this.sentSubscriptions.delete(name);
    }
    // Send independently: one unauthorized event does not reject other requests.
    for (const name of add) {
      if (this.send({type: 'subscribe', data: [name]})) this.sentSubscriptions.add(name);
    }
    return true;
  }

  startHeartbeat() {
    this.stopHeartbeat();
    if (!this.heartbeatDelay) return;
    this.lastPing = 0;
    const tick = () => {
      if (!this.connected) return;
      const now = Date.now();
      if (this.awaitingPong !== null) {
        if (now - this.awaitingPong >= this.heartbeatTimeout) {
          this.failSocket(this.socket, 'Heartbeat timed out');
        }
        return;
      }
      if (now - this.lastPing >= this.heartbeatDelay) {
        if (this.send({type: 'ping', data: {time: now}})) {
          this.lastPing = this.awaitingPong = now;
        } else {
          this.failSocket(this.socket, 'Heartbeat send failed');
        }
      }
    };
    this.heartbeatTimer = setInterval(tick, 1000);
    tick();
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
    this.awaitingPong = null;
  }

  clientsChanged() {
    if (!this.core.ports.size) return this.stop();
    if (this.connected) {
      this.syncSubscriptions();
      return this.sendClients();
    }
    return this.launchPoller();
  }

  getSocketUrl(url) {
    return url;
    const base = this.core.scope?.location?.href || globalThis.location?.href;
    const parsed = new URL(url, base);
    if (parsed.protocol === 'http:') parsed.protocol = 'ws:';
    if (parsed.protocol === 'https:') parsed.protocol = 'wss:';
    if (!['ws:', 'wss:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.hash) {
      throw new Error('Invalid WebSocket URL');
    }
    return parsed.href;
  }
}
