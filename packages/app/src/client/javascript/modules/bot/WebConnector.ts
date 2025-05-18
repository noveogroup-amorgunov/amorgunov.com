import type { IConnector } from '@typebot/core/lib/connectors/IConnector'
import type { IMessage } from '@typebot/core/lib/core/IMessage'
import { Message } from '@typebot/core/lib/core/Message'
import * as EE from 'event-emitter'

export interface IWebConnector extends IConnector {
  send: (message: IMessage) => Promise<void>
  receiveMessage: (text: string) => void
}

// @ts-expect-error FIXME fix type error
export class WebConnector implements IConnector {
  static _getUser() {
    return { id: 'user', name: 'Console User' }
  }

  getConnectorName() {
    return 'console'
  }

  getUniqueSessionKey() {
    return this.getConnectorName()
  }

  getUser() {
    return Promise.resolve(WebConnector._getUser())
  }

  send(message: IMessage) {
    // eslint-disable-next-line no-console
    console.log(message.getText())

    return Promise.resolve()
  }

  receiveMessage(text: string) {
    if (!text) {
      return
    }

    // @ts-expect-error FIXME fix type error
    this.emit(
      'receiveMessage',
      new Message({
        rawData: { text },
        user: WebConnector._getUser(),
        sessionKey: 'web-console',
        // @ts-expect-error FIXME fix type error
        sender: 'user',
      }),
    )
  }
}

// @ts-expect-error FIXME fix type error
EE(WebConnector.prototype)
