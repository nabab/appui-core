/**
 * Service worker
 *
 * - Intercept requests and manage cache
 * - Polls the server for new information and dispatch it to the clients
 * - Reacts to messages from the client Windows
 */

/**
 * @var {String} CACHE_NAME The name of the version
 * @example 242
 **/
(function(data){
  const CACHE_NAME = 'v' + data.version,
        /**
         * @var {String} CDN The URL of the CDN
         * @example "https://cdn.bbn.io/"
         **/
        CDN = data.shared_path,
        /**
         * @var {String} libFile A coma separated list of libraries for the CDN
         * @example "bbn-css|latest|dark,bbn-vue,font-mfizz,devicon,webmin-font,jsPDF"
         */
        libFile = data.cdn_lib,
        /**
         * @var {Array} precacheResources Static js files to load
         * @example
         **/
        precacheResources = [
          data.script_src
        ],
        /** @var {String} poller The poller URL */
        poller = data.plugins['appui-core'] + '/poller';

  /** @var {Number} offlineTimeout One hour after which the user should be offline */
  let offlineTimeout = 3600000,
      /** @var {Boolean} isRunning True if is running */
      isRunning = false,
      /** @var {Boolean} isFocused True if is focused */
      isFocused = false,
      /** @var {Boolean} errorState True if the poller is in error state */
      errorState = false,
      /** @var {Number} lastFocused A timestamp of the last time the window was focused */
      lastFocused = (new Date()).getTime(),
      /** @var {Number} lastChat  A timestamp of the last time a chat has been received */
      lastChat = 0,
      /** @var {Object} observers The observers list */
      observers = {},
      /** @var {Number} retries The number of attempts done to connect */
      retries = 0,
      /** @var {Array} windows The list of client windows with objects with id and token */
      windows = {},
      /** @var {Number} aborter An object allowing to abort the current query */
      aborter,
      /** @var {Boolean} isConnected True if is connected */
      isConnected = false,
      /** @var {Number} interval The interval length for setInterval */
      interval,
      /** @var {Object} intervalObj The interval object for launching the poller */
      intervalObj,
      /** @var {Boolean} noResp True if the server doesn't answer */
      noResp = false,
      /** @var {Object} observers The observers list */
      lastClientMessage = {},
      /** @var {Object} observers The observers list */
      lastResponse = {};

  /*
  //window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
  //let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
  //let dbVersion = 1;

      Note: The recommended way to do this is assigning it to window.indexedDB,
      to avoid potential issues in the global scope when web browsers start
      removing prefixes in their implementations.
      You can assign it to a varible, like var indexedDB… but then you have
      to make sure that the code is contained within a function.

  // Create/open database
  let dbRequest = indexedDB.open("appui", dbVersion);

  dbRequest.onsuccess = function (event) {
    log("Success creating/accessing IndexedDB database");
    let db = dbRequest.result;
    log(dbRequest.result, event);

    db.onerror = function (event) {
      log("Error creating/accessing IndexedDB database");
    };

    // Interim solution for Google Chrome to create an objectStore. Will be deprecated
    if (db.setVersion) {
      if (db.version != dbVersion) {
        var setVersion = db.setVersion(dbVersion);
        setVersion.onsuccess = function () {
          log("DB POINT 1");
          //db.createObjectStore(db);
          //getImageFile();
          // Create an objectStore
          log("Creating objectStore");
          db.createObjectStore("clipboard");
        };
      }
      else {
          log("DB POINT 2");
        //getImageFile();
      }
    }
    else {
          db.createObjectStore("clipboard");
          log("DB POINT 3");
      //getImageFile();
    }
  };

  // For future use. Currently only in latest Firefox versions
  dbRequest.onupgradeneeded = function (event) {
          log("DB POINT 4");
      //createObjectStore(event.target.result);
  };
  */

  /**
   * Logs in the console in a special format evidencing it comes from the service worker.
   */
  function log() {
    //console.log("**** START LOG FROM SERVICE WORKER ****");
    let logs = [];
    for (let i = 0; i < arguments.length; i++) {
      //console.log(arguments[i]);
      logs.push(arguments[i] && (typeof arguments[i] === 'object') ? JSON.parse(JSON.stringify(arguments[i])) : arguments[i]);
    }
    debug({logs: logs});
    //console.log("**** END LOG FROM SERVICE WORKER ****");
  }

  /**
   * Send debug data to the windows.
   *
   * @param {Object} data
   */
  function debug(data) {
    self.clients.matchAll({
      includeUncontrolled: true
    }).then(clientList => {
      data.windows = windows;
      clientList.forEach(client => {
        if (windows[client.id]) {
          try {
            client.postMessage({
              client: client.id,
              type: 'log',
              data: data
            });
          }
          catch (e) {
            console.log("Can't post message to client id " + client.id);
            console.log(e)
          }
        }
      })
    })
  }

  //log("This is the start...");

  /**
   * Update the variables windows, isFocused and lastFocused if focused.
   *
   * @param {Array} clientList
   */
  function updateWindows(clientList){
    let oks = [],
        toFill = [];
    isFocused = false;
    clientList.forEach(client => {
      if (!windows[client.id]) {
        windows[client.id] = {
          id: client.id,
          token: null,
          data: {},
          channels: []
        };
        toFill.push(windows[client.id]);
      }
      oks.push(client.id);
      if ( client.focused ){
        lastFocused = (new Date()).getTime();
        isFocused = true;
      }
    });
    for (let n in windows) {
      if (!oks.includes(n)) {
        if (windows[n].data) {
          for (let i = 0; i < toFill.length; i++) {
            if (!toFill[i].data) {
              toFill[i].data = windows[n].data;
            }
          }
        }
        delete windows[n];
      }
    }
  }

  /**
   * Called in the interval and will launch the poller only if not running
   */
  function launchPoller() {
    // Poller URL and is not running
    if (poller && !isRunning) {
      log('launching poller at ' + (new Date()).getTime(), poller, isRunning);
      self.clients.matchAll({
        includeUncontrolled: true
      }).then(clientList => {
        updateWindows(clientList);
        if ( !clientList.length ){
          log("There is no client, user certainly disconnected (or not?). Interval is " + interval);
          if (interval !== 60) {
            setPoller(60);
          }
          return;
        }
        else if( !isConnected ){
          log("Disconnected....");
          if (interval !== 60) {
            setPoller(60);
          }
          return;
        }
        else if (errorState) {
          log('The poller is in a state of error');
          if (interval !== 60) {
            setPoller(60);
            errorState = false;
            retries = 0;
          }
          return;
        }
        else if ( interval === 60 ){
          log("Setting the poller");
          setPoller(1);
        }
        if ( isConnected ){
          let now = (new Date()).getTime();
          if (isFocused || (now - lastFocused < offlineTimeout) ){
            log("POLLING");
            poll();
            log("AFTER POLLING");
          }
        }
        else if (intervalObj) {
          clearInterval(intervalObj);
        }
      });
    }
  }

  /**
   * Changes the interval for the poller (launcher).
   *
   * @param {Number} duration
   */
  function setPoller(duration){
    log('Setting the poller');
    clearInterval(intervalObj);
    interval = duration;
    intervalObj = setInterval(launchPoller, duration*1000);
  }

  /**
   * Reacts to a message received from the client.
   *
   * @param {Event} event
   */
  function receive(event){
    log('Receiving an event with keys ' + Object.keys(event.data).join(', '));
    let promise = self.clients.matchAll().then(clientList => {
      updateWindows(clientList);
      switch (event.data.type) {
        case 'init':
          clientList.forEach(client => {
            if (client.id === event.source.id) {
              client.postMessage({
                client: event.source.id,
                type: 'init',
                data: event.data.data
              });
              //isConnected = true;
            }
          })
          break;

        case 'initCompleted':
          log('init completed');
          isConnected = true;
          setPoller(5);
          break;

        case 'registerChannel':
          if (windows[event.source.id]
            && windows[event.source.id].channels
            && event.data.channel
            && !windows[event.source.id].channels.includes(event.data.channel)
          ){
            windows[event.source.id].channels.push(event.data.channel);
          }
          break;

        case 'unregisterChannel':
          if (windows[event.source.id]
            && windows[event.source.id].channels
            && event.data.channel
            && windows[event.source.id].channels.includes(event.data.channel)
          ){
            windows[event.source.id].channels.splice(windows[event.source.id].channels.indexOf(event.data.channel), 1);
          }
          break;

        case 'messageChannel':
          if (event.data.channel && event.data.data){
            clientList.forEach(client => {
              if ((client.id !== event.source.id)
                && windows[client.id]
                && windows[client.id].channels.includes(event.data.channel)
              ) {
                client.postMessage({
                  client: event.source.id,
                  type: 'messageFromChannel',
                  channel: event.data.channel,
                  data: event.data.data
                });
              }
            })
          }
          break;

        case 'messageFromChannel':
          log('messageFromChannel ' + JSON.stringify(event.data))
          break;

        case 'notification':
          self.registration.getNotifications({tag: event.data.data.options.tag}).then(notifications => {
            if (!notifications.length) {
              self.registration.showNotification(event.data.data.title, event.data.data.options);
            }
          })
          break;

        default:
          processClientMessage(event, clientList);
          break;
      }
    });
    if (event.waitUntil) {
      event.waitUntil(promise);
    }
  }

  /**
   *
   *
   * @param {Event} event
   * @param {Array} clientList
   */
  function processClientMessage(event, clientList) {
    // The sender window's ID
    let senderID = event.source.id,
        d = event.data;
    if (d.poll) {
      poll();
    }
    // If the token has not been yet given to the window we do
    else if (d.token && windows[senderID]) {
      if (!windows[senderID].token) {
        windows[senderID].token = d.token;
      }
      if (windows[senderID].token !== d.token) {
        throw new Error("The token doesn't correspond");
      }
    }
    lastClientMessage = d;
    debug({client: d});
    log("processClientMessage with keys " + Object.keys(d).join(', '));
    windows[senderID].data = d;

    // Aborting the current polling will make a new one happen with the new dataObj
    if ( isRunning ){
      aborter.abort();
    }
  }

  /**
   * Processes a few specific server messages by updating dataObj and forwarding to each window
   *
   * @param {Object} obj
   * @return {*}
   */
  function processServerMessage(obj) {
    debug({response: obj});
    log("processServerMessage with keys " + Object.keys(obj).join(', '));
    return self.clients.matchAll().then(clientList => {
      isFocused = false;
      updateWindows(clientList);
      for (let clientId in obj){
        if (obj[clientId].disconnected) {
          isConnected = false;
        }
        if (windows[clientId] && obj[clientId].plugins && Object.keys(obj[clientId].plugins).length) {
          for (let plugin in obj[clientId].plugins) {
            if ('serviceWorkers' in obj[clientId].plugins[plugin]) {
              if (!(plugin in windows[clientId].data)) {
                windows[clientId].data[plugin] = {};
              }
              Object.assign(windows[clientId].data[plugin], obj[clientId].plugins[plugin].serviceWorkers);
            }
          }
        }
      }
      if (!clientList.length) {
        log("There is no client, should I claim them?");
      }
      clientList.forEach(client => {
        if (obj[client.id]) {
          client.postMessage({
            type: 'message',
            data: obj[client.id]
          });
        }
      });
    });
  }

  /**
   * Fetch auto-aborting the request accordingly to timeout.
   *
   * @param {String} url
   * @param {Number} timeout
   * @param {Object} options
   */
  function fetchWithTimeout(url, timeout, options) {
    return new Promise((resolve, reject) => {
      // Set timeout timer
      let timer = setTimeout(() => reject(new Error('Request timed out')), timeout);
      if ( !options ){
        options  = {};
      }
      aborter = new AbortController();
      options.signal = aborter.signal;
      fetch(url, options).then(
        response => resolve(response),
        err => reject(err)
      ).finally(() => clearTimeout(timer));
    })
  }

  /**
   * Polls the server and recalls itself when finished.
   */
  function poll(){
    log('Polling');
    isRunning = true;
    errorState = false;
    noResp = false;
    if (isConnected) {
      self.clients.matchAll().then(clientList => {
        let clientsObj = {};
        updateWindows(clientList);
        for (let id in windows){
          clientsObj[id] = windows[id].data;
        }
        debug({request: clientsObj});
        fetchWithTimeout(poller, 600000, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          headers: {
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
          },
          body: JSON.stringify(Object.keys(clientsObj).length ? {clients: clientsObj} : {test: 1})
        }).then(response => {
          // Clear the timeout as cleanup
          if ( response.status !== 200 ){
            log("Error: " + response.status);
            isRunning = false;
            retries++;
            if (retries <= 3) {
              poll();
            }
            else {
              errorState = true;
              log('Max retries done... Bye!');
            }
          }
          else{
            // What we do with the answer from poller
            response.text().then(text => {
              let json;
              if ((typeof text === 'string')
                  && (text.trim().substr(0, 1) === '{')
                  && (text.trim().substr(-1) === '}')
              ) {
                try {
                  json = JSON.parse(text);
                }
                catch(e){
                  log("The response is no JSON");
                  noResp = true;
                  isRunning = false;
                  retries++;
                  if (retries <= 3) {
                    poll();
                  }
                  else {
                    errorState = true;
                    log('Max retries done...');
                  }
                  return;
                }
                if (Object.keys(json).length) {
                  log("JSON RESULT with keys " + Object.keys(json).join(', '));
                  processServerMessage(json).then(res => {
                    isRunning = false;
                    if (res === false) {
                      retries++;
                      if (retries <= 3) {
                        poll();
                      }
                      else {
                        errorState = true;
                        log('Max retries done...');
                      }
                    }
                    else {
                      retries = 0;
                      poll();
                    }
                  });
                }
                else {
                  log('Empty answer from poller');
                  retries = 0;
                  poll();
                }
              }
              else {
                log("The response is no JSON");
                noResp = true;
                isRunning = false;
                retries++;
                if (retries <= 3) {
                  poll();
                }
                else {
                  errorState = true;
                  log('Max retries done...');
                }
                return;
              }
            });
          }
        }).catch(err => {
          isRunning = false;
          if (err.message !== 'The user aborted a request.') {
            log('fetch failed!', err.message);
            errorState = true;
          }
        });
      });
    }
  }

  // On install it adds to the cache precacheResources and activates
  self.addEventListener('install', event => {
    log('Service worker install event for version ' + CACHE_NAME);
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return cache.addAll(precacheResources);
        })
        .then(function() {
          // `skipWaiting()` forces the waiting ServiceWorker to become the
          // active ServiceWorker, triggering the `onactivate` event.
          // Together with `Clients.claim()` this allows a worker to take effect
          // immediately in the client(s).
          return self.skipWaiting();
        })
    );
  });

  // On activate delete all the old cache
  self.addEventListener('activate', () => {
    log('Service worker activate event for version ' + CACHE_NAME);
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      // `claim()` sets this worker as the active worker for all clients that
      // match the workers scope and triggers an `oncontrollerchange` event for
      // the clients.
      ).then(() => self.clients.claim());
    })
  });

  // On fetch the cache is managed.
  self.addEventListener('fetch', event => {
    if (event.request.method !== 'POST') {
      if (navigator
        && navigator.userAgent
        && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      ) {
        let fullVersion = navigator.userAgent.substring(navigator.userAgent.indexOf("Version") + 8),
            versionIdx = fullVersion.indexOf(' '),
            version = versionIdx > 0 ? fullVersion.substring(0, versionIdx) : fullVersion;
        console.log('SAFARI ' + version);
        if (parseFloat(version) < 15) {
          return;
        }
      }
      if ((event.request.url.indexOf(data.shared_path) === 0)
        || (event.request.url.indexOf(data.site_url + 'components/') === 0)
        || /^http(s?):\/\/fonts.googleapis.com/.test(event.request.url)
      ){
        event.respondWith(caches.match(event.request.url).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then(response => {
            if (response.ok) {
              return caches.open(CACHE_NAME).then(cache => {
                return cache.put(event.request.url, response.clone()).then(() => {
                  return response;
                });
              })
            }
            return response;
          }).catch(error => {
            console.error('Error on fetch -> ', error);
            return Response.error();
          });
        }));
      }
    }
  });

  // Launches the function receive for all communication from the window
  self.addEventListener('message', event => receive(event));

  // Notification click
  self.onnotificationclick = (event) => {
    self.clients.matchAll().then(clientList => {
      updateWindows(clientList);
      clientList.every(client => {
        if (client.id && windows[client.id]) {
          client.postMessage({
            type: 'notificationClick',
            data: {tag: event.notification.tag}
          });
          return false;
        }
        return true;
      })
    });
  }

  // Launches the poller after one second
  setPoller(1);

})(data);
