const CACHE_NAME = data.version;
const CDN = data.shared_path;
const libFile = data.cdn_lib;
// The files we want to 
const precacheResources = [
  data.script_src
];
let offlineTimeout = 3600000;
let isRunning = false;
let isFocused = false;
let lastFocused = 0;
let lastChat = 0;
let poller = 'core/poller';
let dataObj = {};
let observers = {};
let retries = 0;
let windows = [];
let aborter;
let isConnected = false;
let interval;

//window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
//let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
//let dbVersion = 1;

/* 
    Note: The recommended way to do this is assigning it to window.indexedDB,
    to avoid potential issues in the global scope when web browsers start 
    removing prefixes in their implementations.
    You can assign it to a varible, like var indexedDB… but then you have 
    to make sure that the code is contained within a function.
*/

// Create/open database
/*
let dbRequest = indexedDB.open("appui", dbVersion);

dbRequest.onsuccess = function (event) {
  console.log("Success creating/accessing IndexedDB database");
  let db = dbRequest.result;
  console.log(dbRequest.result, event);

  db.onerror = function (event) {
    console.log("Error creating/accessing IndexedDB database");
  };
  
  // Interim solution for Google Chrome to create an objectStore. Will be deprecated
  if (db.setVersion) {
    if (db.version != dbVersion) {
      var setVersion = db.setVersion(dbVersion);
      setVersion.onsuccess = function () {
        console.log("DB POINT 1");
        //db.createObjectStore(db);
        //getImageFile();
        // Create an objectStore
        console.log("Creating objectStore");
        db.createObjectStore("clipboard");
      };
    }
    else {
        console.log("DB POINT 2");
      //getImageFile();
    }
  }
  else {
        db.createObjectStore("clipboard");
        console.log("DB POINT 3");
    //getImageFile();
  }
};

// For future use. Currently only in latest Firefox versions
dbRequest.onupgradeneeded = function (event) {
        console.log("DB POINT 4");
    //createObjectStore(event.target.result);
};
*/

function launchPoller(){
  if ( poller && !isRunning ){
    self.clients.matchAll({
      includeUncontrolled: true
    }).then(function(clientList) {
      if (!clientList.length || !isConnected) {
        if (interval !== 60) {
          setPoller(60);
        }
        console.log("There is no client, user certainly disconnected (or not?)");
        console.log("#Clients: " + clientList.length + ' / ' + isConnected);
        return;
      }
      else if ( interval === 60 ){
        setPoller(1);
      }
      isFocused = false;
      windows = [];
      clientList.forEach(function(client) {
        windows.push(client.id);
        if ( client.focused ){
          lastFocused = (new Date()).getTime();
          isFocused = true;
        }
      });
      if ( isConnected ){
        let now = (new Date()).getTime();
        if ( isFocused || (now - lastFocused < offlineTimeout) ){
          poll();
        }
      }
      else{
        clearInterval(launchPoller);
      }
    });
  }
}

function setPoller(duration){
  clearInterval(launchPoller);
  interval = duration;
  setInterval(launchPoller, duration*1000);
}

function receive(event){
  let promise = self.clients.matchAll().then(function(clientList) {
    if ( event.data.type === 'init' ){
      initClient(event, clientList);
    }
    else{
      processClientMessage(event, clientList);
    }
  });
  if (event.waitUntil) {
    event.waitUntil(promise);
  }
}

function processClientMessage(event, clientList){
  let senderID = event.source.id;
  let d = event.data;
  let obsTodo = [];
  console.log(["processClientMessage", d]);
  if ( 'observers' in d ){
    observers[senderID] = d.observers;
  }
  windows.forEach((a) => {
    if ( observers[a] ){
      observers[a].forEach((b) => {
        obsTodo.push(b);
      });
    }
  });
  dataObj.observers = obsTodo;
  if ( 'chat' in d ){
    dataObj.chat = d.chat;
  }
  if ( 'lastChat' in d ){
    dataObj.lastChat = d.lastChat;
  }
  if ( 'usersHash' in d ){
    dataObj.usersHash = d.usersHash;
  }
  if ( 'message' in d ){
    dataObj.message = d.message;
  }
  if ( isRunning ){
    aborter.abort();
    console.log("ABORT AND RESTART");
  }
}

function processServerMessage(json){
  console.log(["processServerMessage", json]);
  return self.clients.matchAll().then(function(clientList) {
    retries = 0;
    isFocused = false;
    if ( 'message' in dataObj ){
      delete dataObj.message;
    }
    if ( json.disconnected ){
      isConnected = false;
    }
    if ( json.chat ){
      if ( json.chat.hash ){
        dataObj.usersHash = json.chat.hash;
      }
      if ( json.chat.last ){
        dataObj.lastChat = json.chat.last;
      }
    }
    if ( !clientList.length ){
      console.log("There is no client, should I claim them?");
    }
    clientList.forEach(function(client) {
      client.postMessage({
        type: 'message',
        data: json
      });
    });
  });
}

function initClient(event, clientList){
  console.log("initClient");
  let senderID = event.source.id;
  clientList.forEach(function(client) {
    if (client.id === senderID) {
      client.postMessage({
        client: senderID,
        type: 'init',
        data: data
      });
    }
  });
  isConnected = true;
}

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
    ]);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function fetchWithTimeout(url, timeout, options) {
  return new Promise( (resolve, reject) => {
      // Set timeout timer
      let timer = setTimeout(
          () => reject( new Error('Request timed out') ),
          timeout
      );
      if ( !options ){
        options  = {};
      }
      aborter = new AbortController();
      options.signal = aborter.signal;
      fetch(url, options).then(
          response => resolve( response ),
          err => reject( err )
      ).finally( () => clearTimeout(timer) );
  })
}

function poll(){
  isRunning = true;
  if (isConnected) {
    fetchWithTimeout(poller, 600000, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(Object.keys(dataObj).length ? dataObj : {test: 1})
    })
      .then(function(response) {
        // Clear the timeout as cleanup
        if ( response.status !== 200 ){
          console.log("Error: " + response.status);
          isRunning = false;
          retries++;
          if ( retries <= 3 ){
            poll();
          }
        }
        else{
          // What we do with the answer from poller 
          response.text().then((text) => {
            let json;
            try {
              json = JSON.parse(text);
            }
            catch(e){
              json = {message: "The response is no JSON", error: e.message};
            }
            //console.log(text);
            processServerMessage(json).then((res) => {
              isRunning = false;
              if (res === false) {
                retries++;
                if ( retries <= 3 ){
                  poll();
                }
              }
              else{
                poll();
              }
            });
          });
        }
      })
      .catch(function(err) {
        isRunning = false;
        console.log('fetch failed! ', err);
        retries++;
        if ( retries <= 3 ){
          poll();
        }
      });
  }
  //console.log("SENDING THIS TO SERVER: \n" + JSON.stringify(dataObj, null, 2));
}

// Install event
self.addEventListener('install', event => {
  console.log('Service worker install event for version ' + CACHE_NAME);
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

// Activate event
// Be sure to call self.clients.claim()
self.addEventListener('activate', function(event) {
  console.log('Service worker activate event for version ' + CACHE_NAME);
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

// Fetch event
self.addEventListener('fetch', event => {
  console.log('Service worker fetch event for version ' + CACHE_NAME);
  if ( event.request.credentials !== 'same-origin' ){
    event.respondWith(caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(function (response) {
          if (
            (event.request.url.indexOf(data.shared_path) === 0) ||
            (event.request.url.indexOf(data.site_url + 'components/') === 0)
          ){
            return caches.open(CACHE_NAME).then(cache => {
              return cache.put(event.request, response.clone()).then(function () {
                return response;
              });
            })
          }
          return response;
        });
      })
    );
  }
});

setPoller(1);

self.addEventListener('message', function(event) {
  receive(event);
});

          /*
        this.observersCopy = this.observers.slice();
        this.poller = bbn.fn.ajax(this.pollerPath, 'json', $.extend({observers: this.observers}, this.pollerObject), 'poller', (r) => {
          this.pollerObject.message = null;
          //bbn.fn.log("--------------OBS: Returning Data---------------");
          // put the data_from_file into #response
          if ( r.data ){
            bbn.fn.each(r.data, (d, i) => {
              if ( d.observers ){
                for ( let b of d.observers ){
                  let arr = bbn.fn.filter(this.observers, {id: b.id});
                  for ( let a of arr ){
                    if ( a.value !== b.result ){
                      this.$emit('bbnObs' + a.element + a.id, b.result);
                      a.value = b.result;
                    }
                  }
                }
              }
            });
            //appui.success("<div>ANSWER</div><code>" + JSON.stringify(r.data) + '</code>', 5);
          }
          if ( r.chat && this.getRef('chat') ){
            if ( r.chat.hash ){
              this.pollerObject.usersHash = r.chat.hash;
            }
            this.getRef('chat').receive(r.chat);
            if ( r.chat.chats ){
              this.pollerObject.lastChat = r.chat.last;
            }
          }

          // call the function again, this time with the timestamp we just got from server.php
          this.polling = false;
          this.poller = false;
        }, () => {
          this.polling = false;
          this.poller = false;
        });
        */
