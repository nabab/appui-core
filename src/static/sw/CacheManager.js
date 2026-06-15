export class CacheManager {
  constructor(core) {
    this.core = core;
    this.CDN = core.data.shared_path.indexOf('/') === 0 ?
      core.data.site_url + core.data.shared_path.substr(1) : core.data.shared_path;
    this.STATIC = core.data.static_path.indexOf('/') === 0 ?
      core.data.site_url + core.data.static_path.substr(1) : core.data.static_path;
    this.COMPONENTS = core.data.site_url + 'components/';
    this.PATH = core.data.cur_path;
    this.precacheResources = [];
    this.isOldSafari = (() => {
      if (navigator && navigator.userAgent &&
          /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {

        let fullVersion = navigator.userAgent.substring(
          navigator.userAgent.indexOf("Version") + 8),
            versionIdx = fullVersion.indexOf(' '),
            version = versionIdx > 0 ? fullVersion.substring(0, versionIdx) : fullVersion;

        this.core.log('SAFARI ' + version);
        return parseFloat(version) < 15;
      }
      return false;
    })();
  }

  get CACHE_NAME() {
    return this.core.CACHE_NAME;
  }

  async onInstall(event) {
    this.core.log('Service worker install event for version ' + this.CACHE_NAME);
    event.waitUntil(
      self.skipWaiting().then(
        caches.open(this.CACHE_NAME).then(
          cache => cache.addAll(this.precacheResources)
        )
      )
    );
    await this.core.dataManager.setUpDb();
  }

  async onActivate(event) {
    this.core.log('Service worker activate event for version ' + this.CACHE_NAME);
    event.waitUntil(
      self.clients.claim().then(
        () => caches.keys().then(
          cacheNames => Promise.all(cacheNames
            .filter(cacheName => cacheName !== this.CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
          )
        )
      )
    );
  }

  async onFetch(event) {
    if (event.request.method === 'POST') {
      if (!event.request.url.indexOf(this.core.data.site_url)) {
        const newRequest = event.request.clone();
        event.respondWith(new Promise(async (resolve, reject) => {
          let body = '';
          const decoder = new TextDecoder();
          for await (const chunk of event.request.body) {
            body += decoder.decode(chunk);
          }

          const data = JSON.parse(body);
          delete data._bbn_token;
          delete data._bbn_key;
          const dataHash = await this.core.hash(JSON.stringify(data));

          const cachedResponse = await caches.match(event.request.url + ':' + dataHash);

          if (cachedResponse) {
            this.core.log("Returning cached POST response");
            resolve(cachedResponse);
            return;
          }

          return fetch(newRequest).then(async response => {
            if (response.ok) {
              const bbnCache = response.headers.get('bbn-cache');
              const isJson = !(response.headers.get('Content-Type') || '').indexOf('application/json');
              if (isJson) {
                const json = await response.clone().json();
                if (json?.disconnected && (Object.keys(json).length === 1)) {
                  self.clients.matchAll().then(clientList => {
                    clientList.forEach(client => client.postMessage({ type: 'DISCONNECTED' }));
                  });
                  resolve(response);
                  return;
                }
              }

              if (bbnCache) {
                this.core.log("Caching " + event.request.url);
                return caches.open(this.CACHE_NAME).then(cache => {
                  return cache.put(event.request.url + ':' + dataHash, response.clone()).then(() => {
                    resolve(response);
                    return;
                  });
                })
              }
            }

            resolve(response);
          }).catch(error => {
            console.error('Error on fetch -> ', error);
            return Response.error();
          });
        }));
      }
    }
    else {
      if (this.isOldSafari) {
        return;
      }

      if (event.request.mode === 'navigate') {
        event.respondWith(
          caches.open(this.CACHE_NAME).then((cache) => {
            return cache.match(this.PATH).then((cachedResponse) => {
              // Fallback to network if not cached (first visit)
              const fetchPromise = fetch(this.PATH).then((networkResponse) => {
                // Optional: update cache silently in background
                cache.put(this.PATH, networkResponse.clone());
                return networkResponse;
              }).catch(() => {
                // Network failed, serve cached shell
                return cachedResponse;
              });

              return fetchPromise;
            });
          })
        );
        return;
      }


      const isOkToCache = (event.request.url.indexOf(this.CDN) === 0)
        || (event.request.url.indexOf(this.STATIC) === 0)
        || (event.request.url.indexOf(this.COMPONENTS) === 0)
        || /^http(s?):\/\/fonts.googleapis.com/.test(event.request.url)
        || /^http(s?):\/\/fonts.gstatic.com/.test(event.request.url);

      if (isOkToCache || !event.request.url.indexOf(this.core.data.site_url)) {
        event.respondWith(caches.match(event.request.url).then(cachedResponse => {
          this.core.numberOfRequests++;
          this.core.allRequests.push(event.request.url);
          self.clients.get(event.clientId).then(client => {
            if (client) {
              client.postMessage({
                client: event.clientId,
                type: 'load',
                data: {
                  message: bbn._("Loading") + ' ' + (cachedResponse ? bbn._("from cache") : bbn._("from network")) + " " + event.request.url,
                  cached: cachedResponse ? 1 : 0,
                  url: event.request.url
                }
              });
            } else {
              this.core.log("Client not found for " + event.clientId);
            }
          })

          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request).then(response => {
            if (response.ok) {
              if (isOkToCache || response.headers.get('bbn-cache')) {
                return caches.open(this.CACHE_NAME).then(cache => {
                  return cache.put(event.request.url, response.clone()).then(() => {
                    return response;
                  });
                })
              }
            }

            return response;
          }).catch(error => {
            console.error('Error on fetch -> ', error);
            return Response.error();
          });
        }));
      }
    }
  }
}
