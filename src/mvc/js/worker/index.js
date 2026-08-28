import AppuiWorkerService from "/static/lib/appui-core/AppuiWorkerService.js";
const url = new URL(data.site_url);
url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
url.pathname = '/socket';
//console.log("Worker URL: ", url.toString());
const worker = new AppuiWorkerService(self, url.toString(), data);
await worker.start();
