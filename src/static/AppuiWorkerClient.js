class AppuiWorkerClient {
  constructor(siteUrl) {
    const url = new URL(siteUrl + 'worker');
    // Client side
    const w = new SharedWorker(url, {
      type: 'module',
      name: 'worker-27',
      credentials: 'same-origin'
    });
    w.onerror = event => {
      console.error('SharedWorker error');
      console.log('constructor:', event.constructor.name);
      console.log('type:', event.type);
      console.log('message' in event ? event.message : '(no message)');
      console.log('filename' in event ? event.filename : '(no filename)');
      console.log('lineno' in event ? event.lineno : '(no lineno)');
      console.log('colno' in event ? event.colno : '(no colno)');
      console.log('error' in event ? event.error : '(no error object)');
      event.preventDefault();
    };
    w.port.start();
    w.port.onmessage = event => {
      const message = event.data;
      console.log('Message from shared worker:', message);

      switch (message.type) {
        case 'connected':
          console.log('SharedWorker connected');
          break;

        case 'disconnected':
          console.log('SharedWorker disconnected');
          break;

        case 'message':
          console.log('SharedWorker message:', message.data);
          break;

        case 'db':
          console.log('SharedWorker db:', message.data);
          break;

        case 'status':
          console.log(
            'SharedWorker status:',
            message.connected ? 'connected' : 'disconnected'
          );
          break;
      }
    };
    setTimeout(() => {
      this.sendMessage({type: 'connection'});
    }, 1000);

    this.worker = w;
  }

  sendMessage(message, ports) {
    if (this.worker) {
      this.worker.port.postMessage(message, ports);
    }
  }
}

export default AppuiWorkerClient;
