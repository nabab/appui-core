export class WindowManager {
  constructor(core) {
    this.core = core;
    this.windows = {};
    this.isFocused = false;
    this.lastFocused = (new Date()).getTime();
    this.mainClient = null;
    this.idCorrespondence = {};
  }

  register(event, clientList) {
    let {windowId, url} = event.data.data;
    if (!windowId) {
      throw new Error("No windowId provided");
    }
    this.core.log("Registering window " + windowId + " with url " + url);
    const done = [];
    let client;
    let newId;
    clientList.forEach(c => {
      done.push(c.id);
      if (c.id === event.source.id) {
        client = c;
      }
      else if (this.idCorrespondence[c.id] === windowId) {
        windowId = crypto.randomUUID().replace(/-/g, '');
        this.core.log("Window " + windowId + " already registered, generating new id " + windowId);
      }
    });
    this.idCorrespondence[client.id] = windowId;
    this.windows[windowId] = {
      clientId: client.id,
      windowId,
      url,
      token: null,
      data: {},
      channels: []
    };
    if ((Object.keys(this.windows).length === 1) || !this.mainClient || !this.windows[this.mainClient]) {
      this.mainClient = windowId;
    }
    client.postMessage({
      type: 'appui-definition',
      data: {windowId, auxiliary: this.mainClient !== windowId, windows: this.windows}
    });
    this.core.log("Registering window " + windowId + " with url " + url + ' - Main client is ' + this.mainClient+ ' - IS ? ' + (windowId === this.mainClient));
    this.update(event, clientList);
  }

  unregister(event, clientList) {
    const data = event.data?.data || {};
    const windowId = data.windowId;
    if (this.windows[windowId]) {
      if (this.mainClient === windowId) {
        this.mainClient = null;
      }
      this.core.log("Unregistering window " + windowId);
      delete this.idCorrespondence[this.windows[windowId].clientId];
      delete this.windows[windowId];
      this.update(event, clientList);
    }
  }

  update(event, clientList) {
    this.core.log("Updating windows with clients:" + clientList.length + ' and main client ' + this.mainClient);
    this.core.log(event);
    this.isFocused = false;
    const keys = Object.keys(this.idCorrespondence);
    const lost = {};
    const done = [];
    const data = event.data.data;
    this.core.log(["WTF", data, clientList.length]);
    let client;
    clientList.forEach(c => {
      done.push(c.id);
      if (c.focused) {
        this.lastFocused = (new Date()).getTime();
        this.isFocused = true;
      }
      if (event.source.id === c.id) {
        client = c;
      }
    });
    for (let i = 0; i < keys.length; i++) {
      const n = keys[i];
      if (done.indexOf(n) === -1) {
        const windowId = this.idCorrespondence[n];
        if (this.windows[windowId]) {
          this.core.log("Removing window " + windowId);
          delete this.windows[windowId];
        }
        delete this.idCorrespondence[n];
      }
    }
    if (data.views) {
      if (!this.windows[data.windowId]) {
        this.windows[data.windowId] = {
          clientId: client.id,
          windowId: data.windowId,
          url: data.url,
          token: null,
          data: {},
          channels: []
        };
      }

      this.windows[data.windowId].views = data.views;
      this.windows[data.windowId].url = data.url;
    }
    clientList.forEach(c => {
      c.postMessage({
        type: 'update-windows',
        data: {windows: this.windows}
      })
    });
  }
}
