import ee from 'event-emitter';
import { Message } from '@typebot/core/lib/core/Message';

class WebConnector {
  static _getUser() {
    return { id: 'user', name: 'Console User' };
  }

  getConnectorName() {
    return 'console';
  }

  getUniqueSessionKey() {
    return this.getConnectorName();
  }

  getUser() {
    return Promise.resolve(WebConnector._getUser());
  }

  send(message) {
    console.log(message.getText());

    return Promise.resolve();
  }

  receiveMessage(text) {
    if (!text) {
      return;
    }

    this.emit('receiveMessage', new Message({
      rawData: { text },
      user: WebConnector._getUser(),
      sessionKey: 'web-console',
      sender: 'user'
    }));
  }
}

ee(WebConnector.prototype);

export default WebConnector;
