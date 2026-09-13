// Import bbn and export it directly
import bbn, {Temporal} from "/static/lib/bbn-js/v2/dist/bbn.sw.js";
export { bbn };

// Export all the classes needed for ServiceWorkerAdmin
export {
  default as AppuiWorker
} from './AppuiWorker.js';
