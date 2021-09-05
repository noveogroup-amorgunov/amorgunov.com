/* eslint-disable no-underscore-dangle, class-methods-use-this, @typescript-eslint/ban-ts-comment */

import * as ee from 'event-emitter';
import {Message} from '@typebot/core/lib/core/Message';
import {IConnector} from '@typebot/core/lib/connectors/IConnector';
import {IMessage, MessageSender} from '@typebot/core/lib/core/IMessage';

export interface IWebConnector extends IConnector {
  send: (message: IMessage) => Promise<void>;
  receiveMessage: (text: string) => void;
}

// @ts-ignore
export class WebConnector implements IConnector {
  static _getUser() {
    return {id: 'user', name: 'Console User'};
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

  send(message: IMessage) {
    console.log(message.getText());

    return Promise.resolve();
  }

  receiveMessage(text: string) {
    if (!text) {
      return;
    }

    console.log();

    // @ts-ignore
    this.emit(
      'receiveMessage',
      new Message({
        rawData: {text},
        user: WebConnector._getUser(),
        sessionKey: 'web-console',
        // @ts-ignore
        sender: 'user',
      })
    );
  }
}

ee(WebConnector.prototype);
