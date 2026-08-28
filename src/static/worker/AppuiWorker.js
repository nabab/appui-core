// shared-worker.js

class AppuiWorker {
  constructor(worker, socketUrl) {
    this.worker = worker;
    this.socketUrl = socketUrl;
    this.ports = new Set();
    this.socket = null;
    this.reconnectTimer = null;
  }

  start() {
    this.worker.onconnect = event => {
      this.addPort(event.ports[0]);
      this.realTimeConnect();
      this.broadcast({
        type: 'message',
        data: 'WORKER START STILL OK'
      });
    };

    return this;
  }

  addPort(port) {
    this.ports.add(port);

    port.start();

    port.onmessage = event => {
      this.handlePortMessage(port, event.data);
    };

    this.connect();
  }

  handlePortMessage(port, message) {
    switch (message.type) {
      case 'send':
        this.send(message.data);
        break;

      case 'status':
        port.postMessage({
          type: 'status',
          connected: this.socket?.readyState === WebSocket.OPEN
        });
        break;
    }
  }

  realTimeConnect() {
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    console.log('Connecting WebSocket...');

    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');

      this.broadcast({
        type: 'connected'
      });
    };

    this.socket.onmessage = event => {
      this.broadcast({
        type: 'message',
        data: event.data
      });
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');

      this.socket = null;

      this.broadcast({
        type: 'disconnected'
      });

      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2000);
  }

  send(data) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(data);

    return true;
  }

  broadcast(message) {
    for (const port of this.ports) {
      port.postMessage(message);
    }
  }
}

export default AppuiWorker;
