import Bot from '@typebot/core/lib/core/Bot';
import {IBot, IBotContext} from '@typebot/core';
import {Terminal} from './terminal';
import {IWebConnector, WebConnector} from './WebConnector';

function addHandlers(type: string, bot: IBot) {
  switch (type) {
    case 'echobot':
      bot.use(({session, message}: IBotContext) => {
        session.send(`You said: ${message.getText()}`);
      });
      break;
    case 'todo':
      bot.initialState = {todos: []};

      bot.use('/list', ({session}: IBotContext) => {
        const {todos} = session.state;
        const msg = todos.length > 0 ? todos.join('\n') : 'No todos!';

        session.send(msg);
      });
      bot.use('/clear', ({session}: IBotContext) => {
        session.resetState();
        session.send('Successfully clear all todos!');
      });
      bot.use(/\/add (.+)/, ({session, params}: IBotContext) => {
        const [newTodo] = params as string[];
        const todos = session.state.todos || [];

        session.setState({todos: [...todos, newTodo]});
        session.send(`Todo: ${newTodo} added!`);
      });
      bot.use(({session}: IBotContext) => {
        session.send('Unknown command. Type /list, /clear or /add {todo}.');
      });
      break;
    default:
      return false;
  }
  return false;
}

function createBot(el: HTMLDivElement) {
  const terminal = new Terminal(el, {text: 'Say anything to bot'});
  const connector = new WebConnector() as unknown as IWebConnector;
  const bot = new Bot({connector});

  connector.send = message => {
    terminal.addLine(`<span class="bot">Bot says</span>: ${message.getText()}`);
    return Promise.resolve();
  };

  terminal.readLine = connector.receiveMessage.bind(connector) as () => boolean;

  return bot;
}

function registerTerminals($nodes: NodeListOf<HTMLDivElement>) {
  $nodes.forEach(el => {
    if (el.dataset.bot) {
      addHandlers(el.dataset.bot, createBot(el));
    }
  });
}

export {createBot, addHandlers, registerTerminals};
