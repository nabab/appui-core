export class NotificationHandler {
  constructor(core) {
    this.core = core;
  }

  async onMessageNotification(event, clientList) {
    self.registration.getNotifications({ tag: event.data.data.options.tag }).then(notifications => {
      if (!notifications.length) {
        self.registration.showNotification(event.data.data.title, event.data.data.options);
      }
    });
  }

  onnotificationclick(event) {
    self.clients.matchAll().then(clientList => {
      this.core.windowManager.updateWindows(clientList);
      clientList.every(client => {
        if (client.id && this.core.windows[client.id]) {
          client.postMessage({
            type: 'notificationClick',
            data: { tag: event.notification.tag }
          });
          return false;
        }
        return true;
      });
    });
  }
}
