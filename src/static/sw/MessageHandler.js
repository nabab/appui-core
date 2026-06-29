export class MessageHandler {
  constructor(core) {
    this.core = core;
  }

  async onMessage(event) {
    const processed = await this.core.dbCenter.handleMessage(event);
    
    if (processed) {
      // It's a DB message.
      //this.core.log(['DB message:', event.data, processed]);
      return;
    }
    this.core.log(['client ' + event.source.id + ': ' + (event.data?.type || 'unknown'), event.data]);
    const clientList = await self.clients.matchAll();
    const data = event.data?.data || {};

    switch (event.data?.type) {
      case 'start': return this.onMessageStart(event, clientList);
      case 'test': return this.onMessageTest(event, clientList);
      case 'connection': return this.onMessageConnection(event, clientList);
      case 'init': return this.onMessageInit(event, clientList);
      case 'login': return this.onMessageLogin(event, clientList);
      case 'initCompleted':
        this.core.connect();
        this.core.poller.setPoller(5);
        break;
      case 'registerChannel': return this.onMessageRegisterChannel(event, clientList);
      case 'search': return this.core.searchManager.onMessageSearch(event, clientList);
      case 'unregisterChannel': return this.onMessageUnregisterChannel(event, clientList);
      case 'messageChannel': return this.onMessageChannel(event, clientList);
      case 'messageFromChannel': return this.onMessageFromChannel(event, clientList);
      case 'notification': return this.core.notificationHandler.onMessageNotification(event, clientList);
      case 'db': return this.core.dbCenter.handleMessage(event, clientList);
      case 'beforeRouting': return this.onMessageBeforeRouting(event, clientList);
      case 'routing': return this.onMessageRouting(event, clientList);
      case 'registerWindow': return this.core.windowManager.register(event, clientList);
      case 'unregisterWindow': return this.core.windowManager.unregister(event, clientList);
      case 'open-link': return this.onMessageOpenLink(event, clientList);
    }
  }

  onMessageOpenLink(event, clientList) {
    this.core.log('onMessageOpenLink');
    const data = event.data?.data || {};
    const windows = this.core.windowManager.windows;
    const corr = this.core.windowManager.idCorrespondence;
    if (data.url && data.windowId) {
      clientList.forEach(c => {
        if (corr[c.id] === data.windowId) {
          c.postMessage({
            type: 'open-link',
            data: {
              url: data.url
            }
          });
        }
      });
    }
  }

  onMessageBeforeRouting(event, clientList) {
    this.core.log("EVENT");
    this.core.log(event);
    if (event.data.data.url) {
      const url = event.data.data.url;
      let client;
      clientList.forEach(c => {
        if (c.id === event.source.id) {
          client = c;
        }
      });
      if (!client) {
        return;
      }
      this.core.log("Looking for url " + url + " in " + Object.keys(this.core.windowManager.windows).length + " windows");
      for (let windowId in this.core.windowManager.windows) {
        const corr = this.core.windowManager.idCorrespondence;
        if (corr[client.id] === windowId) {
          continue;
        }
        const row = bbn.fn.getRow(this.core.windowManager.windows[windowId].views || [], a => !a.current.indexOf(url));
        if (row) {
          this.core.log("Found url " + url + " in window " + windowId);
          client.postMessage({
            type: 'routing',
            data: {
              windowId,
              url
            }
          });
          return;
        }
      }

      this.core.log("Did not find url " + url);
      this.core.log(this.core.windowManager.windows);
      client.postMessage({
        type: 'routing',
        data: {
          ok: true,
          url
        }
      });
    }
  }

  onMessageRouting(event, clientList) {
    this.core.windowManager.update(event, clientList);
    this.core.log("Routing message from client " + event.source.id + " to main client " + this.core.windowManager.mainClient);
    this.core.log(event.data);
    if (event.source.id === this.core.windowManager.mainClient) {
      this.core.log("Routing to main client");
    }
    else {
      this.core.log("Routing to client " + event.source.id);
    }
  }

  onMessageFocus(event, clientList) {
    this.core.windowManager.update(event, clientList);
    this.core.log("Focus message from client " + event.source.id + " to main client " + this.core.windowManager.mainClient);
  }

  processClientMessage(event) {
    const senderID = event.source.id;
    const d = event.data;
    //this.core.windowManager.add(senderID);
    if (d.poll) {
      this.core.poller.poll();
    } else if (d.token && this.core.windows[senderID]) {
      if (!this.core.windows[senderID].token) {
        this.core.windows[senderID].token = d.token;
      }
      if (this.core.windows[senderID].token !== d.token) {
        throw Error("The token doesn't correspond");
      }
    }

    this.core.lastClientMessage = d;
    this.core.windows[senderID].data = d;
    //this.core.debug({ client: d });
    this.core.log("processClientMessage with keys " + Object.keys(d).join(', '));

    if (this.core.isRunning && this.core.aborter) {
      this.core.log("Aborting");
      this.core.aborter.abort();
    }
  }

  async processServerMessage(obj) {
    this.core.log("processServerMessage with keys " + Object.keys(obj).join(', '));
    //this.core.debug({ response: obj });
    return self.clients.matchAll().then(clientList => {
      this.core.isFocused = false;
      //this.core.windowManager.update(clientList);

      for (let clientId in obj) {
        if (obj[clientId].disconnected) {
          this.core.disconnect();
        }

        if (this.core.windows[clientId] && obj[clientId].plugins && Object.keys(obj[clientId].plugins).length) {
          for (let plugin in obj[clientId].plugins) {
            if ('serviceWorkers' in obj[clientId].plugins[plugin]) {
              if (!(plugin in this.core.windows[clientId].data)) {
                this.core.windows[clientId].data[plugin] = {};
              }
              Object.assign(this.core.windows[clientId].data[plugin], obj[clientId].plugins[plugin].serviceWorkers);
            }
          }
        }
      }

      if (!clientList.length) {
        this.core.log("There is no client, should I claim them?");
      }

      this.core.lastResponse = obj;

      clientList.forEach(client => {
        if (obj[client.id]) {
          client.postMessage({
            type: 'message',
            data: obj[client.id]
          });
        }
      });

      return true;
    });
  }

  async onMessageInit(event, clientList) {
    await this.core.dataManager.retrieveIndexCfg();
    clientList.forEach(client => {
      if (client.id === event.source.id) {
        client.postMessage({
          client: event.source.id,
          type: 'init',
          data: this.core.indexCfg
        });
      }
    });
  }

  async onMessageLogin(event, clientList) {
    await this.core.dataManager.retrieveLoginCfg();
    clientList.forEach(async client => {
      if (client.id === event.source.id) {
        client.postMessage({
          client: event.source.id,
          type: 'login',
          data: this.core.loginCfg
        });
      }
    });
  }

  async onMessageConnection(event, clientList) {
    await clientList.forEach(async client => {
      if (client.id === event.source.id) {
        await this.core.checkConnection();
        //bbn.fn.log("Sending connection status to client " + client.id + ": " + this.core.isConnected);
        client.postMessage({
          client: event.source.id,
          type: 'connection',
          data: {connected: this.core.isConnected}
        });
      }
    });
  }

  onMessageRegisterChannel(event, clientList) {
    if (event.data.channel && this.core.windows[event.source.id]) {
      if (!('channels' in this.core.windows[event.source.id])) {
        this.core.windows[event.source.id].channels = [];
      }

      if (!this.core.windows[event.source.id].channels.includes(event.data.channel)) {
        this.core.windows[event.source.id].channels.push(event.data.channel);
      }
    }
  }

  onMessageUnregisterChannel(event, clientList) {
    if (event.data.channel && this.core.windows[event.source.id] &&
        this.core.windows[event.source.id].channels &&
        this.core.windows[event.source.id].channels.includes(event.data.channel)) {

      this.core.windows[event.source.id].channels.splice(
        this.core.windows[event.source.id].channels.indexOf(event.data.channel),
        1
      );
    }
  }

  onMessageChannel(event, clientList) {
    if (event.data.channel && event.data.data) {
      clientList.forEach(client => {
        if ((client.id !== event.source.id) &&
            this.core.windows[client.id] &&
            this.core.windows[client.id].channels.includes(event.data.channel)) {

          client.postMessage({
            client: event.source.id,
            type: 'messageFromChannel',
            channel: event.data.channel,
            data: event.data.data
          });
        }
      });
    }
  }

  onMessageFromChannel(event, clientList) {
    this.core.log('messageFromChannel ' + JSON.stringify(event.data));
  }

  async onMessageTest(event, clientList) {
    this.core.log([
      "TEST MESSAGE RECEIVED",
      "DATA: ",
      event.data,
      "CLIENT LIST: ",
      clientList,
      "WINDOWS: ",
      this.core.windows
    ]);
  }

  async onMessageStart(event, clientList) {
    this.core.log("START MESSAGE RECEIVED v4");
    const d = await fetch(this.core.data.site_url + 'core/index', {
      method: 'POST',
      body: JSON.stringify({ test: 1 })
    });
    const json = await d.json();
    this.core.log("RESPONSE", json);
  }
}
