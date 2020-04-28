import Bot from '@typebot/core/lib/core/Bot';
import Terminal from './terminal';
import WebConnector from './WebConnector';

function addHandlers(type, bot) {
  switch (type) {
  case 'echobot':
    bot.use(({ session, message }) => {
      session.send(`You said: ${message.getText()}`);
    });
    break;
  case 'todo':
    bot.initialState = { todos: [] };

    bot.use('/list', ({ session }) => {
      const { todos } = session.state;
      const msg = todos.length > 0 ? todos.join('\n') : 'No todos!';

      session.send(msg);
    });
    bot.use('/clear', ({ session }) => {
      session.resetState();
      session.send('Successfully clear all todos!');
    });
    bot.use(/\/add (.+)/, ({ session, params }) => {
      const [newTodos] = params;
      const todos = session.state.todos || [];

      session.setState({ todos: [...todos, newTodos] });
      session.send(`Todo: ${newTodos} added!`);
    });
    bot.use(({ session }) => {
      session.send('Unknown command. Type /list, /clear or /add {todo}.');
    });
    break;
  default:
    return false;
  }
}

function createBot(el) {
  const terminal = new Terminal(el, { text: 'Say anything to bot' });
  const connector = new WebConnector();
  const bot = new Bot({ connector });

  connector.send = message => {
    terminal.addLine(`<span class="bot">Bot says</span>: ${message.getText()}`);
  };

  terminal.readLine = connector.receiveMessage.bind(connector);

  return bot;
}

export {
  createBot,
  addHandlers
};
