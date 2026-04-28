export class WindowManager {
  constructor() {
    this.windows = {};
    this.isFocused = false;
    this.lastFocused = (new Date()).getTime();
  }

  add(clientId) {
    if (!this.windows[clientId]) {
      this.windows[clientId] = {
        id: clientId,
        token: null,
        data: {},
        channels: []
      };
    }
  }

  updateWindows(clientList) {
    let oks = [], toFill = [];
    this.isFocused = false;

    clientList.forEach(client => {
      if (!this.windows[client.id]) {
        this.add(client.id);
        toFill.push(this.windows[client.id]);
      }
      oks.push(client.id);

      if (client.focused) {
        this.lastFocused = (new Date()).getTime();
        this.isFocused = true;
      }
    });

    for (let n in this.windows) {
      if (!oks.includes(n)) {
        if (this.windows[n].data) {
          for (let i = 0; i < toFill.length; i++) {
            if (!toFill[i].data) {
              toFill[i].data = this.windows[n].data;
            }
          }
        }
        delete this.windows[n];
      }
    }
  }
}
