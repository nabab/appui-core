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
import ServiceWorkerAdmin from "/static/lib/appui-core/sw/ServiceWorkerAdmin.js";
(async function(data) {
  new ServiceWorkerAdmin(data);
})(data);
