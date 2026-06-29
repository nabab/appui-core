export class Poller {
  constructor(core) {
    this.core = core;
    this.pollerUrl = core.data.plugins['appui-core'] + '/poller';
  }

  setPoller(duration) {
    this.core.log('setPoller to ' + duration);
    clearInterval(this.core.intervalObj);
    this.core.interval = duration;
    this.core.intervalObj = setInterval(() => this.launchPoller(), duration*1000);
  }

  launchPoller() {
    if (this.pollerUrl && !this.core.isRunning) {
      self.clients.matchAll({ includeUncontrolled: true }).then(clientList => {
        //this.core.windowManager.update(clientList);
        if (!clientList.length) {
          this.core.log("There is no client, user certainly disconnected (or not?). Interval is " + this.core.interval);
          if (this.core.interval !== 60) {
            this.setPoller(60);
          }
          return;
        }
        else if (!this.core.isConnected) {
          if (this.core.interval !== 60) {
            this.setPoller(60);
          }
          return;
        }
        else if (this.core.errorState) {
          this.core.log('The poller is in a state of error');
          this.core.log(this.core.errorState);
          if (this.core.interval !== 60) {
            this.setPoller(5);
            this.core.errorState = false;
            this.core.retries = 0;
          }
          return;
        } else if (this.core.interval === 60) {
          this.setPoller(1);
        }

        if (this.core.isConnected) {
          let now = (new Date()).getTime();
          if (this.core.windowManager.isFocused || (now - this.core.lastFocused < this.core.offlineTimeout)) {
            this.poll();
          }
        } else if (this.core.intervalObj) {
          clearInterval(this.core.intervalObj);
        }
      });
    }
  }

  async poll() {
    this.core.isRunning = true;
    this.core.errorState = false;
    this.core.noResp = false;

    if (this.core.isConnected) {
      const clientList = await self.clients.matchAll();
      let clientsObj = {};

      //this.core.windowManager.update(clientList);
      for (let id in this.core.windows) {
        clientsObj[id] = this.core.windows[id].data;
      }

      this.core.debug({ request: clientsObj });

      try {
        const response = await this.fetchWithTimeout(this.pollerUrl, 600000, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.keys(clientsObj).length ? { clients: clientsObj } : { test: 1 })
        });

        if (response.status !== 200) {
          this.core.log("Error: " + response.status);
          this.retryPoll();
        } else {
          try {
            const text = await response.text();
            let json;

            if ((typeof text === 'string') && (text.trim().substr(0, 1) === '{') && (text.trim().substr(-1) === '}')) {
              try {
                json = JSON.parse(text);
              } catch(e) {
                this.core.log("The response is no JSON");
                this.retryPoll(true);
                return;
              }

              if (Object.keys(json).length) {
                this.core.log("JSON RESULT with keys " + Object.keys(json).join(', '));
                await this.core.messageHandler.processServerMessage(json).then(res => {
                  this.core.isRunning = false;
                  if (res === false) {
                    this.retryPoll(false);
                  } else {
                    this.core.retries = 0;
                    this.poll();
                  }
                });
              } else {
                this.core.retries = 0;
                this.poll();
              }
            } else {
              this.core.log("The response is no JSON");
              this.retryPoll(true);
              return;
            }
          } catch(err) {
            this.core.isRunning = false;
            if (err.message !== 'The user aborted a request.') {
              this.core.log('fetch failed for ' + this.pollerUrl);
              this.core.log(err.message);
              this.core.errorState = true;
            }
          }
        }
      } catch(err) {
        this.core.isRunning = false;
        this.core.log('fetch failed for ' + this.pollerUrl);
        this.core.log(err.message);
        this.core.errorState = true;
      }
    } else {
      this.core.log("User is not connected, skipping poll");
    }
  }

  retryPoll(noResp = false) {
    this.core.log("RetryPoll");
    if (noResp) this.core.noResp = true;
    this.core.isRunning = false;
    this.core.retries++;

    if (this.core.retries <= 3) {
      this.poll();
    } else {
      this.core.errorState = true;
      this.core.log('Max retries done... Bye!');
    }
  }

  fetchWithTimeout(url, timeout, options) {
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => reject(new Error('Request timed out')), timeout);
      if (!options) options = {};
      this.core.aborter = new AbortController();
      options.signal = this.core.aborter.signal;

      fetch(url, options).then(
        response => resolve(response),
        err => this.core.log(err.message)
      ).finally(() => clearTimeout(timer));
    });
  }
}
