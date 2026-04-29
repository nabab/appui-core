class AppuiInstaller
{
  #isInit = false;
  #itv = false;
  #bound = false;
  #connected = false;

  get isInit() {
    return this.#isInit;
  }

  set isInit(value) {
    if (!this.#isInit && value) {
      this.#isInit = true;
    }
  }

  log(...args) {
    for (let i = 0; i < args.length; i++) {
      console.log(args[i]);
    }
  }

  async load(url, module = false) {
    return new Promise((resolve, reject) => {
      let script = document.querySelector(`script[src="${url}"]`);
      if (!script) {
        script = document.createElement("script");
        if (module) {
          script.type = "module";
        }
        script.onload = () => {
          resolve();
        };
        script.onerror = () => {
          reject(new Error("Failed to load script: " + url));
        };
        script.src = url;
        document.head.appendChild(script);
      }
      else {
        resolve();
      }
    });
  }

  loadMessage(msg) {
    document.getElementById('loading_message').innerHTML = msg;
  }

  errorMessage(msg) {
    document.getElementById('error_message').innerHTML = msg;
  }

  buildContainer() {
    let container = document.body.querySelector(".appui-container");
    if (!container) {
      container = document.createElement('div');
      container.className = 'appui-container';
      container.style.opacity = '0';
      container.style.transition = 'opacity 0.5s';
      const appui = document.createElement('div');
      appui.className = 'appui';
      container.appendChild(appui);
      document.body.appendChild(container);
    }
  }

  get bound() {
    if (!this.#bound) {
      this.#bound = this.onMessage.bind(this);
    }

    return this.#bound;
  }

  async onMessage(event) {
    if (this.isInit) {
      return;
    }

    if (event.data?.type === 'connection') {
      const data = event.data?.data;
      this.log("Checking connection: " + (data.connected ? "Connected" : "Not connected"));
      if (data?.connected) {
        this.#connected = true;
        navigator.serviceWorker.controller.postMessage({data: {giveMeTheData: true}, type: 'init'});
      }
      else {
        let go = this.#connected;
        this.#connected = false;
        if (go) {
          window.location.reload();
        }
        else {
          navigator.serviceWorker.controller.postMessage({data: {giveMeTheData: true}, type: 'login'});
        }
      }
    }
    else if (event.data?.type === 'login') {
      this.#isInit = true;
      const data = event.data?.data;
      this.log(event.data);
      if (data?.script_src) {
        if (data.script_src && !Array.isArray(data.script_src)) {
          data.script_src = [data.script_src];
        }

        for (let i = 0; i < data.script_src.length; i++) {
          await this.load(data.script_src[i], data.script_src[i].indexOf('index.js') > -1);
        }

        if (window.bbn) {
          this.buildContainer();
          //this.log("Initializing Appui and removing eventListener to index");
          //navigator.serviceWorker.removeEventListener("message", this.bound);
          const fn = eval(data.script);
          if (typeof fn === 'function') {
            await fn(data);
          }
          else {
            this.log("Script evaluated, but it did not return a function", fn, event.data);
          }
        }
        else {
          this.log("DATA TEMPLATE RECEIVED, BUT BBN NOT LOADED");
        }
        this.loadMessage("Initialization complete.");
        //navigator.serviceWorker.removeEventListener("message", this.bound);
      }
    }
    else if (event.data?.type === 'init') {
      this.#isInit = true;
      const data = event.data?.data;
      if (data?.slots) {
        this.buildContainer();
        if (data.script_src && !Array.isArray(data.script_src)) {
          data.script_src = [data.script_src];
        }

        for (let i = 0; i < data.script_src.length; i++) {
          await this.load(data.script_src[i], data.script_src[i].indexOf('index.js') > -1);
        }

        if (window.bbn) {
          //this.log("Initializing Appui and removing eventListener to index");
          //navigator.serviceWorker.removeEventListener("message", this.bound);
          const fn = eval(data.script);
          if (typeof fn === 'function') {
            await fn(data);
            this.log("Function executed");
          }
          else {
            this.log("Script evaluated, but it did not return a function", fn);
          }
        }
        else {
          this.log("DATA TEMPLATE RECEIVED, BUT BBN NOT LOADED");
        }
        this.loadMessage("Initialization complete.");
      }
      //navigator.serviceWorker.removeEventListener("message", this.bound);
    }
    else if (event.data?.type === 'load') {
      if (event.data?.data?.message) {
        this.loadMessage(event.data.data.message);
      }
    }
    else if (event.data?.type === 'DISCONNECTED') {
      this.log("Service worker disconnected");
      window.location.reload();
    }
  }

  init() {
    if (!this.isInit && navigator?.serviceWorker?.controller) {
      navigator.serviceWorker.addEventListener("message", this.bound);
      navigator.serviceWorker.controller.postMessage({type: 'connection'});
    }
  }

  setChecker() {
    if (!this.#itv) {
      this.#itv = setInterval(() => {
        if (navigator.serviceWorker.controller) {
          clearInterval(this.#itv);
          this.#itv = false;
          console.warn('Service worker is ready AND controlling this page.');
          this.init();
        }
      }, 1000);
    }
  }

  async setUp() {
    try {
      const registration = await navigator.serviceWorker.register('/sw', {type: 'module', scope: '/'});
      // This promise resolves when the active SW is controlling the page
      this.loadMessage("Registering service worker...");
      await navigator.serviceWorker.ready;
      this.loadMessage("Service worker ready...");

      // Optional: you can check if we’re actually controlled
      if (navigator.serviceWorker.controller) {
        this.init();
      }
      else {
        this.setChecker();
      }
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (['activated', 'installed'].includes(installingWorker.state)) {
            console.warn('New service worker with state: ' + installingWorker.state);
            if (installingWorker.state === 'activated') {
              this.setChecker();
            }
          }
        };
      };
    } catch (err) {
      throw new Error('Service worker registration failed: ' + err);
    }

  }
}

export default AppuiInstaller;
