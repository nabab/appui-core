export class NotificationHandler {
  constructor(core) {
    this.core = core;
  }

  /**
   * A SharedWorker cannot display a notification itself.
   *
   * The request is therefore forwarded to one of the connected windows,
   * which will use the Notification API.
   *
   * Expected message:
   * {
   *   type: 'showNotification',
   *   title: '...',
   *   options: {...}
   * }
   *
   * @param {MessagePort|null} sourcePort
   * @param {Object} data
   * @returns {Boolean}
   */
  showNotification(sourcePort, data) {
    if (!data?.title) {
      return false;
    }

    /*
     * Prefer the requesting window because it is the most logical window
     * to display the notification.
     *
     * If it isn't available, use any connected port.
     */
    const port = sourcePort || this.core.ports.values().next().value;

    if (!port) {
      this.core.log?.('No connected window available to display notification');
      return false;
    }

    try {
      port.postMessage({
        type: 'showNotification',
        data: {
          title: data.title,
          options: data.options || {}
        }
      });

      return true;
    }
    catch (e) {
      this.core.log?.('Unable to request notification');
      this.core.log?.(e);
    }

    return false;
  }


  /**
   * Called when the window which displayed the notification reports
   * that the notification has been clicked.
   *
   * Expected message:
   * {
   *   type: 'notificationClick',
   *   data: {
   *     tag: '...',
   *     ...
   *   }
   * }
   *
   * @param {MessagePort} sourcePort
   * @param {Object} data
   */
  notificationClick(sourcePort, data) {
    if (!data) {
      return false;
    }

    this.core.broadcast({
      type: 'notificationClick',
      data
    });

    return true;
  }


  /**
   * Dispatch notification-related messages coming from a window.
   *
   * @param {MessagePort} port
   * @param {MessageEvent} event
   * @returns {Boolean} True when the message has been handled
   */
  handleMessage(port, event) {
    const message = event.data;

    if (!message?.type) {
      return false;
    }

    switch (message.type) {
      case 'showNotification':
        return this.showNotification(
          port,
          message.data || message
        );

      case 'notificationClick':
        return this.notificationClick(
          port,
          message.data || message
        );
    }

    return false;
  }
}