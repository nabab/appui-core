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
(function(data) {

  /**
   * @const {String} CACHE_NAME The cache name
   * @example "v39"
   */
  const CACHE_NAME = 'v' + data.version;

  /**
   * @const {String} CDN The URL of the CDN
   * @example "https://cdn.bbn.io/"
   **/
  const CDN = data.shared_path;


  /** @const {Array} precacheResources Static js files to load */
  const precacheResources = [];

  /** @const {String} poller The poller URL */
  const poller = data.plugins['appui-core'] + '/poller';

  /** @var {Number} offlineTimeout One hour after which the user should be offline */
  let offlineTimeout = 3600000;
  /** @var {Boolean} isRunning True if is running */
  let isRunning = false;
  /** @var {Boolean} isFocused True if is focused */
  let isFocused = false;
  /** @var {Boolean} errorState True if the poller is in error state */
  let errorState = false;
  /** @var {Number} lastFocused A timestamp of the last time the window was focused */
  let lastFocused = (new Date()).getTime();
  /** @var {Number} retries The number of attempts done to connect */
  let retries = 0;
  /** @var {Array} windows The list of client windows with objects with id and token */
  let windows = {};
  /** @var {Number} aborter An object allowing to abort the current query */
  let aborter;
  /** @var {Boolean} isConnected True if is connected */
  let isConnected = false;
  /** @var {Number} interval The interval length for setInterval */
  let interval;
  /** @var {Object} intervalObj The interval object for launching the poller */
  let intervalObj;

  /** @var {Number} lastChat  A timestamp of the last time a chat has been received */
  let lastChat = 0;
  /** @var {Object} observers The observers list */
  let observers = {};
  /** @var {Boolean} noResp True if the server doesn't answer */
  let noResp = false;
  /** @var {Object} lastClientMessage The last client message processed */
  let lastClientMessage = {};
  /** @var {Object} lastResponse The last response processed */
  let lastResponse = {};

  /**
   * Logs in the console in a special format evidencing it comes from the service worker.
   */
  const log = (...args) => {
    //console.log("**** START LOG FROM SERVICE WORKER ****");
    let logs = [];
    for (let i = 0; i < args.length; i++) {
      self.clients.matchAll({
        includeUncontrolled: true
      }).then(clientList => {
        // Set the 'windows' property
        //data.windows = windows;
        // Try to send the 'log' message to the clients
        clientList.forEach(client => {
          if (windows[client.id]) {
            client.postMessage({
              client: client.id,
              type: 'log',
              data: args[i]
            });
          }
        })
      })
  
    }
    //debug({logs: logs});
    //console.log("**** END LOG FROM SERVICE WORKER ****");
  };

  /**
   * Send debug data to the windows.
   *
   * @param {Object} data
   */
  const debug = data => {
    // Get the current windows list
    self.clients.matchAll({
      includeUncontrolled: true
    }).then(clientList => {
      // Set the 'windows' property
      //data.windows = windows;
      // Try to send the 'log' message to the clients
      clientList.forEach(client => {
        if (windows[client.id]) {
          try {
            client.postMessage({
              client: client.id,
              type: 'log',
              data,
              windows
            });
          }
          catch (e) {

          }
        }
      })
    })
  };

  //log("This is the start...");

  /**
   * Update the variables windows, isFocused and lastFocused if focused.
   *
   * @param {Array} clientList
   */
  const updateWindows = clientList => {
    log("updateWindows");
    let oks = [],
        toFill = [];
    isFocused = false;
    // Analyze clients
    clientList.forEach(client => {
      // Create the client into windows list if not exists
      if (!windows[client.id]) {
        windows[client.id] = {
          id: client.id,
          token: null,
          data: {},
          channels: []
        };
        // Add the client to a temp array
        toFill.push(windows[client.id]);
      }
      oks.push(client.id);
      // Set lastFocused and isFocused variables if the client is focused
      if ( client.focused ){
        lastFocused = (new Date()).getTime();
        isFocused = true;
      }
    });
    // Analyze the clients inside the windows variable
    for (let n in windows) {
      // Check if the client is to be deleted from windows variable
      if (!oks.includes(n)) {
        // Copy the data property to the new clients created if exists
        if (windows[n].data) {
          for (let i = 0; i < toFill.length; i++) {
            if (!toFill[i].data) {
              toFill[i].data = windows[n].data;
            }
          }
        }
        // Delete client from windows variable
        delete windows[n];
      }
    }
  };

  /**
   * Called in the interval and will launch the poller only if not running
   */
  const launchPoller = () => {
    log("launchPoller");
    // Check if the poller is not running
    if (poller && !isRunning) {
      // Write log
      log('launching poller at ' + (new Date()).getTime(), poller, isRunning);
      // Get the current windows list
      self.clients.matchAll({
        includeUncontrolled: true
      }).then(clientList => {
        // Update the windows list
        updateWindows(clientList);
        // If there are no windows set the poller interval to 60 seconds and exit
        if (!clientList.length) {
          // Write log
          log("There is no client, user certainly disconnected (or not?). Interval is " + interval);
          if (interval !== 60) {
            // Set the poller interval to 60 seconds
            setPoller(60);
          }
          return;
        }
        // If the user is disconnected set the poller interval to 60 seconds and exit
        else if (!isConnected) {
          // Write log
          log("Disconnected....");
          if (interval !== 60) {
            // Set the poller interval to 60 seconds
            setPoller(60);
          }
          return;
        }
        // If the poller is in error state set the poller interval to 60 seconds and exit
        else if (errorState) {
          // Write log
          log('The poller is in a state of error');
          log(errorState);
          if (interval !== 60) {
            // Set the poller interval to 60 seconds
            setPoller(60);
            // Reset the error state variable
            errorState = false;
            // Reset retries variable
            retries = 0;
          }
          return;
        }
        // If the poller interval is equal to 60 seconds change it to 1 second
        else if (interval === 60) {
          // Write log
          log("Setting the poller");
          // Set the poller interval to 1 second
          setPoller(1);
        }
        // Check if the user is connected
        if (isConnected) {
          let now = (new Date()).getTime();
          // Check if is focused or if not in timeout
          if (isFocused || (now - lastFocused < offlineTimeout)) {
            // Write log
            log("POLLING");
            // Launch the poller
            poll();
            // Write log
            log("AFTER POLLING");
          }
        }
        // Stop the poller if the user is disconnected
        else if (intervalObj) {
          clearInterval(intervalObj);
        }
      });
    }
  };

  /**
   * Changes the interval for the poller (launcher).
   *
   * @param {Number} duration
   */
  const setPoller = duration => {
    // Write log
    log('setPoller to ' + duration);
    // Clear the current interval
    clearInterval(intervalObj);
    // Set the new interval
    interval = duration;
    intervalObj = setInterval(launchPoller, duration*1000);
  };

  /**
   * Processes a client message
   *
   * @param {Event} event
   */
  const processClientMessage = event => {
    log("processClientMessage");
        // The sender window's ID
    let senderID = event.source.id,
        // The message data
        d = event.data;

    // Call 'poll' function if the 'pool' property exists into data
    if (d.poll) {
      poll();
    }
    // Check if the 'token' property exists and if the sender window's ID exists into windows list
    else if (d.token && windows[senderID]) {
      // If the token has not been yet given to the window we do
      if (!windows[senderID].token) {
        windows[senderID].token = d.token;
      }
      // Error in case the token does not match the window token
      if (windows[senderID].token !== d.token) {
        throw Error("The token doesn't correspond");
      }
    }
    // Set the last client message
    lastClientMessage = d;
    // Set the window data into windows list
    windows[senderID].data = d;
    // Write logs
    debug({client: d});
    log("processClientMessage with keys " + Object.keys(d).join(', '));

    // Aborting the current polling will make a new one happen with the new dataObj
    if ( isRunning ){
      aborter.abort();
    }
  };

  /**
   * Processes a few specific server messages by updating dataObj and forwarding to each window
   *
   * @param {Object} obj
   * @return {Promise}
   */
  const processServerMessage = obj => {
    // Write logs
    log("processServerMessage with keys " + Object.keys(obj).join(', '));
    debug({response: obj});
    // Get the current windows list
    return self.clients.matchAll().then(clientList => {

      isFocused = false;
      // Update the windows list
      updateWindows(clientList);
      // Browse recipients windows
      for (let clientId in obj){
        // Set isConnect variable to false if the client is disconnected
        if (obj[clientId].disconnected) {
          isConnected = false;
        }
        // Check if the window exists into windows list
        if (windows[clientId]
          // Check if the 'plugins' property exists into recipient window of this message
          && obj[clientId].plugins
          // Check if the 'plugins' property of the recipient window of this message is not empty
          && Object.keys(obj[clientId].plugins).length
        ) {
          // Browse plugins
          for (let plugin in obj[clientId].plugins) {
            // Check if the 'serviceWorkers' property exists
            if ('serviceWorkers' in obj[clientId].plugins[plugin]) {
              // Create an empty object for this plugin on window data property if it not exists
              if (!(plugin in windows[clientId].data)) {
                windows[clientId].data[plugin] = {};
              }
              // Replace value of the plugin object into window data with the value from the message
              Object.assign(windows[clientId].data[plugin], obj[clientId].plugins[plugin].serviceWorkers);
            }
          }
        }
      }
      if (!clientList.length) {
        log("There is no client, should I claim them?");
      }
      // Set lastResponse
      lastResponse = obj;
      // Browse windows
      clientList.forEach(client => {
        // Check if the window is a recipient
        if (obj[client.id]) {
          // Send the message
          client.postMessage({
            type: 'message',
            data: obj[client.id]
          });
        }
      });
    });
  };

  /**
   * Fetch auto-aborting the request accordingly to timeout.
   *
   * @param {String} url
   * @param {Number} timeout
   * @param {Object} options
   * @returns {Promise}
   */
  const fetchWithTimeout = (url, timeout, options) => {
    log("Fetch with timeout");
    // Create and return a Promise
    return new Promise((resolve, reject) => {
      // Set timeout timer
      let timer = setTimeout(() => reject(new Error('Request timed out')), timeout);
      // Set the 'options' variable as an object if not exists
      if ( !options ){
        options  = {};
      }
      // Inizialize an AbortController object
      aborter = new AbortController();
      options.signal = aborter.signal;
      // Fetch
      fetch(url, options).then(
        response => resolve(response),
        err => reject(err)
      ).finally(() => clearTimeout(timer));
    })
  };

  /**
   * Polls the server and recalls itself when finished.
   */
  const poll = () => {
    log('Poll');
    isRunning = true;
    errorState = false;
    noResp = false;
    // Check if the user is connected
    if (isConnected) {
      // Get the current windows list
      self.clients.matchAll().then(clientList => {
        let clientsObj = {};
        // Update the windows list
        updateWindows(clientList);
        for (let id in windows){
          clientsObj[id] = windows[id].data;
        }
        debug({request: clientsObj});
        // Call 'fetchWithTimeout' function
        fetchWithTimeout(poller, 600000, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          headers: {
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
          },
          body: JSON.stringify(Object.keys(clientsObj).length ? {clients: clientsObj} : {test: 1})
        }).then(response => {
          if ( response.status !== 200 ){
            log("Error: " + response.status);
            // Retry poll
            retryPoll();
          }
          else{
            // What we do with the answer from poller
            response.text().then(text => {
              let json;
              if ((typeof text === 'string')
                  && (text.trim().substr(0, 1) === '{')
                  && (text.trim().substr(-1) === '}')
              ) {
                // Parse JSON
                try {
                  json = JSON.parse(text);
                }
                catch(e){
                  log("The response is no JSON");
                  // Retry poll
                  retryPoll(true);
                  return;
                }
                if (Object.keys(json).length) {
                  log("JSON RESULT with keys " + Object.keys(json).join(', '));
                  // Call 'processServerMessage' function
                  processServerMessage(json).then(res => {
                    isRunning = false;
                    if (res === false) {
                      // Retry poll
                      retryPoll(false);
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
                // Retry poll
                retryPoll(true);
                return;
              }
            });
          }
        }).catch(err => {
          isRunning = false;
          if (err.message !== 'The user aborted a request.') {
            log('fetch failed!');
            log(err.message);
            errorState = true;
          }
        });
      });
    }
  };

  /**
   * Incremets the retries number and retry to launch the poller
   * @param {Boolean} noResp if true, the noResp property will be set to true
   */
  const retryPoll = noResp => {
    log("RetryPoll");
    if (noResp) {
      noResp = true;
    }
    isRunning = false;
    retries++;
    if (retries <= 3) {
      poll();
    }
    else {
      errorState = true;
      log('Max retries done... Bye!');
    }
  };

  const onFetch = event => {
    // Check if the request method is different than POST
    if (event.request.method !== 'POST') {
      // Check if the browser is Safari
      if (navigator
        && navigator.userAgent
        && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      ) {
        // Get the browser version
        let fullVersion = navigator.userAgent.substring(navigator.userAgent.indexOf("Version") + 8),
            versionIdx = fullVersion.indexOf(' '),
            version = versionIdx > 0 ? fullVersion.substring(0, versionIdx) : fullVersion;
        console.log('SAFARI ' + version);
        // No cache if the Safari version is less than 15
        if (parseFloat(version) < 15) {
          return;
        }
      }
      // We will only cache requests to the CDN, local application components or Google fonts
      //log("Fetch event for " + event.request.url);
      //log("POSITION: " + event.request.url.indexOf(CDN));
      if ((event.request.url.indexOf(CDN) === 0)
        || (event.request.url.indexOf(data.site_url + 'components/') === 0)
        || /^http(s?):\/\/fonts.googleapis.com/.test(event.request.url)
      ){
        //log("Fetch event 2 for " + event.request.url);
        // Check if the request is present in the cache
        event.respondWith(caches.match(event.request.url).then(cachedResponse => {
          // If the request is already in the cache, let's return it
          if (cachedResponse) {
            log("Returning cached response");
            return cachedResponse;
          }
          // Otherwise we execute the request and cache the response if positive
          return fetch(event.request).then(response => {
            if (response.ok) {
              log("Caching " + event.request.url);
              // Open the cache by CACHE_NAME value
              return caches.open(CACHE_NAME).then(cache => {
                // Write the response into the cache and return the response
                return cache.put(event.request.url, response.clone()).then(() => {
                  return response;
                });
              })
            }
            return response;
          }).catch(error => {
            // Return a response error
            console.error('Error on fetch -> ', error);
            return Response.error();
          });
        }));
      }
    }
  };

  const onInstall = event => {
    // Write log
    log('Service worker install with CDN ' + CDN);
    log('Service worker install event for version ' + CACHE_NAME);

    event.waitUntil(
      // Open the cache by CACHE_NAME value
      caches.open(CACHE_NAME)
        .then(cache => {
          // Add resources to cache
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
  };

  const onActivate = () => {
    // Write log
    log('Service worker activate event for version ' + CACHE_NAME);
    log('Service worker activate with CDN ' + CDN);
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
  };

  const onMessage = async event => {
    // Write log
    log("Receiving a message of type " + event.data.type + " on channel " + event.data.channel);
    log(JSON.stringify(event.data));
    // Get the current windows list
    let promise = self.clients.matchAll().then(clientList => {
      // Update the windows list
      updateWindows(clientList);
      const data = event.data.data;
      // Analyze the message type
      switch (event.data.type) {

        // The message sent by appui-core after the DOM has been loaded
        // and the initial data was fetched (onDomLoaded function).
        // We'll send an init message to the relative window with the
        // fetched data to complete the initial loading process.
        case 'init':
          // Find the correct window
          clientList.forEach(client => {
            if (client.id === event.source.id) {
              // Send the init message with the fetched data
              client.postMessage({
                client: event.source.id,
                type: 'init',
                data
              });
            }
          })
          break;

        // The message sent by bbn-appui when it's ready to signal that the init phase has completed
        case 'initCompleted':
          // Write log
          log('init completed');
          // Set the user session as connected
          isConnected = true;
          // Set the poller interval to 5 seconds
          setPoller(5);
          break;

        // The message type used for register the window to a channel
        case 'registerChannel':
          // Check if the channel name is gived
          if (event.data.channel
            // Check if the window exists
            && windows[event.source.id]
          ){
            // Create 'channels' window property if not exists
            if (!('channels' in windows[event.source.id])) {
              windows[event.source.id].channels = [];
            }
            // Add the channel to the window channels list if it not already exists
            if (!windows[event.source.id].channels.includes(event.data.channel)) {
              windows[event.source.id].channels.push(event.data.channel);
            }
          }
          break;

        case 'search':
          const aborter = new AbortController();
          fetch('search/start', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *client
            signal: aborter.signal,
            body: JSON.stringify(data || {}) // body data type must match "Content-Type" header
          })
            .then(response => {
              bbn.fn.log("RESPONSE IN " + bbn.fn.stopChrono(chrono, true) + " SECS");
              if (response.body) {
                const reader = response.body.getReader();
                const isFn = isFunction(success);
                reader.read().then(function pump({ done, value }) {
                  if (done) {
                    // Do something with last chunk of data then exit reader
                    _deleteLoader(requestId, data);
                    if (json) {
                      treatJSON(json);
                    }
        
                    if (finished) {
                      finished();
                    }
        
                    return;
                  }
            
                  if (isFn) {
                    json += arrayBuffer2String(value).trim();
                    bbn.fn.log(["STREAM RESULT", json.length, json]);
                    if (json) {
                      try {
                        treatJSON(json);
                        json = '';
                      } catch (e) { }
                    }
                    else {
                      success();
                    }
                  }
                  else {
                    bbn.fn.log(["STREAM SUCCESS IS FN? " + isFn]);
                  }
        
                  // Read some more, and call this function again
                  return reader.read().then(pump);
                });
              }
            })
            .catch((err) => {
              let isAbort = axios.isCancel(err);
              _deleteLoader(requestId, data, isAbort);
              defaultEndLoadingFunction(url, tst, data, err);
              if (isAbort) {
                let ok = 1;
                if (isFunction(abort)) {
                  ok = abort(err.message, url);
                }
                if (ok) {
                  defaultAjaxAbortFunction(err.message, url);
                }
              } else {
                let ok = 1;
                if (isFunction(failure)) {
                  ok = failure(err.request, err);
                }
                if (ok) {
                  defaultAjaxErrorFunction(
                    err.request,
                    err.response ? err.response.data : "",
                    err.response ? err.response.status : err
                  );
                }
              }
            });
          break;
        case 'nabab':
          fetch('/core/service/data').then(d => {
            log("!!!!FROM ANOTHER WORLD!!!!");
            log(CDN);
            log(CACHE_NAME);
            try {
              if (d.ok) {
                log("RESPONSE OK");
                d.json().then(json => {
                  log("JSON RESPONSE");
                  log(json)
                });
              }
              else {
                log("Error: " + d.status);
              }
            }
            catch (e) {
              log("Error: " + e.message);
            }
          })
          break;

        // The message type used for unregister the window from a channel
        case 'unregisterChannel':
          // Check if the channel name is gived
          if (event.data.channel
            // Check if the window exists
            && windows[event.source.id]
            // Check if 'channels' window property exists
            && windows[event.source.id].channels
            // Check if the channel exists into the window channels list
            && windows[event.source.id].channels.includes(event.data.channel)
          ){
            // Remove the channel form the window channels list
            windows[event.source.id].channels.splice(
              windows[event.source.id].channels.indexOf(event.data.channel),
              1
            );
          }
          break;

        // The message type used for send a message to all windows registered to a specific channel
        case 'messageChannel':
          // Check if the channel name and the data to send are gived
          if (event.data.channel && event.data.data){
            // Browse all windows
            clientList.forEach(client => {
              // Check if the window id is different from the sender one
              if ((client.id !== event.source.id)
              // Check if the window exists into windows list
                && windows[client.id]
                // Check if the window is registered to gived channel
                && windows[client.id].channels.includes(event.data.channel)
              ) {
                // Send message to the window
                client.postMessage({
                  client: event.source.id,
                  type: 'messageFromChannel',
                  channel: event.data.channel,
                  data: event.data.data
                });
              }
            });
          }
          break;

        // The message type used when we receive a message from a channel
        case 'messageFromChannel':
          // Write log
          log('messageFromChannel ' + JSON.stringify(event.data));
          break;

        // The message type used to show a browser notification
        case 'notification':
          // Check if the same notification not already exists
          self.registration.getNotifications({tag: event.data.data.options.tag}).then(notifications => {
            if (!notifications.length) {
              // Show the notification
              self.registration.showNotification(event.data.data.title, event.data.data.options);
            }
          })
          break;

        // We call the processClientMessage function as default action
        default:
          processClientMessage(event);
          break;
      }
    });
    // Make the event wait until the promise is resolved
    if (event.waitUntil) {
      event.waitUntil(promise);
    }
  };

  const onnotificationclick = event => {
    // Get the current windows list
    self.clients.matchAll().then(clientList => {
      // Update windows list
      updateWindows(clientList);
      // Browse windows
      clientList.every(client => {
        // Check if the window exists
        if (client.id && windows[client.id]) {
          // Send notificationClick message
          client.postMessage({
            type: 'notificationClick',
            data: {tag: event.notification.tag}
          });
          return false;
        }
        return true;
      })
    });
  };

  // On install it adds to the cache precacheResources and activates
  self.addEventListener('install', onInstall);

  // On activate delete all the old cache
  self.addEventListener('activate', onActivate);

  // On fetch the cache is managed.
  self.addEventListener('fetch', onFetch);

  // Launches the 'onMessage' function for all communication from the window
  self.addEventListener('message', onMessage);

  // Notification click
  self.onnotificationclick = onnotificationclick;

  // Launches the poller after one second
  setPoller(1);

})(data);

/*
  *****INDEXEDDB TEST*****

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