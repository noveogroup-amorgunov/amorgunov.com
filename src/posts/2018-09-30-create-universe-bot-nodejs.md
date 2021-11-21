---
title: "Как сделать универсальный фреймворк для ботов на Nodejs"
description:
date: 2018-09-30
time: 13
color: "#d8ecf3"
tags:
  - nodejs
  - bots
  - typescript
  - tutorial
layout: layouts/post.njk
likes: 8
---
Пик популярности ботов уже прошел, но они продолжают быть довольно полезными, и все больше пользователей начинает использовать ботов для самых различных целей, начиная от простых, которые выдают смешную гифку по запросу пользователя, и заканчивая ботами, которые могут выключить свет в квартире после вашей голосовой команды.

Данный материал будет разделен на несколько статей, в которых мы зададим общую структуру, реализуем несколько каналов (connectors, для каждого мессенджера нужно реализовывать свой канал) для получения и отправки сообщений (например, TelegramConnector), настроим систему диалогов и переход между ними, подключим распознавание текста и, конечно же, сделаем пару крутых ботов.

Сегодня мы зададим общую структуру, которую в дальшейнем будем расширять и реализуем "консольный канал", т.е. общаться с ботом будем через консоль. В дальшейшем, по аналогии не составит труда написать другой канал. А так же создадим тестовых ботов.

<img src="/assets/images/2018-09-30-create-universe-bot-nodejs/1.jpg" />

Весь код доступен на [noveogroup-amorgunov/typebot](https://github.com/noveogroup-amorgunov/typebot/tree/tutorial). Если интересно посмотреть примеры работы, можно сразу перейти к [пятой части](#часть-5.-примеры-работы).

Содержание:

- [Часть 1. Настройка окружения](#часть-1.-настройка-окружения)
- [Часть 2. Принцип работы бота](#часть-2.-суть-работы-бота)
- [Часть 3. Проектирование интерфейсов](#часть-3.-проектирование-интерфейсов)
- [Часть 4. Реализация](#часть-4.-реализация)
- [Часть 5. Примеры](#часть-5.-примеры-работы)

## Часть 1. Настройка окружения

Для работы понадобится свежая версия *Nodejs* (>8.1).
Для построения библиотеки мы будем использовать [typescript](#https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) - язык программирования, являющийся надмножеством javascript, которых добавляет в язык типизацию вашего кода и внешних библиотек, траспайлер (как Babel) и дополнительные правила валидации.
Если вы незнакомы с тайпскриптом, ничего страшного, из него мы будет использовать только типы и интерфейсы. Почитать о них можно, например, в официальной документации тайпскрипта. Вообще, я не очень люблю использовать тайпскрипт для фронтэнда или для express-серверов, потому что пока он доставляет больше проблем, чем позитивных моментов, но об этом в другой раз. Но в случае, когда нужно сначала спроектировать систему, тайпскрипт отлично подходит для этих целей.

Создадим каталог для проекта и иницилизируем npm:

```bash
mkdir universebot
cd universebot
npm init --yes
```

Установим необходимые зависимости:

```bash
npm i --save colors koa-compose axios readline
npm i --save-dev nodemon ts-node typescript

# Так же нужно установить тайпинги
npm i --save-dev @types/colors @types/koa-compose @types/node @types/axios
```

- colors - библиотека позволяет в консоле менять цвет символов, удобно для тестирования консольного бота
- koa-compose - библиотека для композиции обработчиков (middlewares)
- axios - HTTP-клиент для запросов (используется в примерах)
- readline - зависимость для удобной работы с консолью
- nodemon - Позволит после каждого изменения перезагружать бота
- ts-node, typescript - для работы с typescript-ом
- @types/* - тайпинги установленных библиотек (необходимы для typescript-а)

Откроем `package.json` и добавим следующие скрипты

```json
  "scripts": {
    "dev": "NODE_PATH=. nodemon --watch 'src/**/*.ts' --exec 'ts-node' ./src/test.ts",
    "build": "tsc"
  }
```

- Командой `npm run build` можно будет транспалировать typescript код в js.
- Команда `npm run dev` будет пересобирать проект после каждого изменения исходников


Создадим `tsconfig.json` файл минимальной конфигурации, в котором находится конфиг для тайпскрипта:

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "outDir": "./lib",
    "rootDir": "./src",
    "baseUrl": "./"
  },
  "include": ["./src/**/*"]
}
```

В этом файле мы указываем, что будут использоваться `commonjs` модули (imports будут скомпилированы в require).
Опция `rootDir` отвечает за директорию с исходниками на typescript, а `outDir` - дикертория, куда будут складываться скомпилированные файлы javascript.

А вот на опцию `noImplicitAny` стоит обратить внимание. Одна из фишек TypeScript — это точечная типизация и использование внутреннего типа данных `any`. Мы не обязаны везде объявлять типы данных, делать это только в тех местах, где это нужно. Но там, где мы не указали тип, компилятор typescript будет пытаться этот тип вывести.
Если typescript не может сделать это явно и `noImplicitAny` выставлена в `false` (по умолчанию) неявно, будет назначен тип `any`, иначе каждый раз при компиляции будет производиться проверка на указание типа данных `any`, и если он не указан явно, то получим ошибку компиляции.
Благодаря этому уже из коробки поддерживает линтинг кода. Кроме того, существует отдельная библиотека — [tslint], которая позволяет довольно гибко настроить стиль написания кода и различного рода проверки как в процессе компиляции, так и на лету.

Для тестирования можно создать файл `src/test.ts` (Да, еще сменится расширения файлов с js -> ts), написать там любой код и выполнить `npm run build`. В директории `lib` появится файл `test.js`.

Настройка проекта на этом завершена, можно приступать к написанию библиотеки для работы с ботами.

## Часть 2. Суть работы бота

Как работают типичные боты? Получают сообщения от пользователей, обработывают их (записывает в базу данных, подгружают необходимые данные, формирует ответ и т.д.) и отправляют пользователю ответ. Вам это ничего не напоминает? Это очень похоже на работу веб-серверов: получает запрос, обработывают его и отправляют ответ клиенту.

Сообщение (Message) может быть получено из какого-либо мессенджера, консоли, поэтому нужно создать универсальный интерфейс (Connector), что бы можно было реализовать получение (и отправку) сообщений из любого сервиса.

Если человек начинает общаться с ботом, создается сессия (Session), в которой хранится состояние пользователя (SessionState, подобно стэйту в реакте, представляет собой key-value хранилище) и данные о пользователе, доступные боту (например, имя или данные полученные в ходе переписки). Сессию можно хранить во временнем кеше, в базе данных и т.д. Сегодня мы напишем общий интерфейс для хранения сессий и реализуем очень простой класс MemorySessionStore.

Обработчики сообщений (Handlers) поочередно будут обрабатывать сообщение (обычные функции, которые на вход принимают Context - объект, содержащий сессию и сообщение) и отправлять ответ пользователю (одно или несколько сообщений), а возможен вариант без ответа пользователю. Обработчики работают подобно middleware-ам в express-е. Так же каждый обработчик принимает вторым параметром функцию `next`, после вызова который начнет свое выполнение следующий обработчик. Если next не вызвать (подобно разрыву связанной цепочки), то выполнение обработчиков прекращается.

<img
  class="lazyload"
  data-src="/assets/images/2018-09-30-create-universe-bot-nodejs/2.png"
  src="/assets/images/2018-09-30-create-universe-bot-nodejs/2-preview.jpg">

Пример использования echo-бота, которого мы будем реализовывать, будет выглядить следующим образом:

```js
const connector = new ConsoleConnector().listen(); /* Создаем "консольный" канал */
const bot = new Bot({ connector }); /* Создаем бота */

/* Обработчик для обработки всех сообщений */
bot.use(async ({ session, message }, next) => {
    const text = message.getText(); /* Получаем сообщение пользователя */

    await session.send(`You said: ${text}`); /* Отсылаем его обратно */

    next();
});
```

Попробуйте сами, напишите что-нибудь боту и он ответит тем-же:

<div class="terminal" data-bot="echobot"></div>

Схематично работу бота можно представить следующим образом:

<img
  class="lazyload"
  data-src="/assets/images/2018-09-30-create-universe-bot-nodejs/3.png"
  src="/assets/images/2018-09-30-create-universe-bot-nodejs/3-preview.jpg">

В текущей реализации можно выделить три сущности: `Bot`, `Message`, `Session`, реализацией которых мы и займемся. Так же напишем два интерейса `ConsoleConnector` для получения и отправки сообщений в консоль, как смешно бы это не звучало, и `MemorySessionStore` для хранения сессий пользователей в памяти.
В конце у нас будет вот такая структура проекта:

```treeview
.
├── examples (Примеры работы)
├── lib (Скомпилированные исходники в javascript)
└── src (Исходный код)
    ├── connectors (Каналы (коннекторы))
    ├── core (Ядро бота (Bot, Message и Session))
    ├── stores (Хранилища сессий)
    └── index.js (Импорт и экспорт всех компонент)
```
## Часть 3. Проектирование интерфейсов

Начнем мы с не написания кода, а с реализации интерфейсов и типов. Опишем все сущности, их поля и методы без их реализации (Реализуем с следующем пункте).

#### Интерфейс пользователя

Первым делом создадим файл `core/IUser.ts` (Самый простой и используемый интерфейс). В тайпскрипте есть практика, все интерфейсы называть с символом "I" вначале, что бы сразу было ясно в коде, что это интерфейс, и не путать, например, с классами.

```ts
export interface IUser {
    id: string | number;
    name: string;
}
```

На данный момент у каждого пользователя должны быть указаны ID (В зависимости от коннектора может быть как числом, так и строкой) и имя. Как вы могли заметить, в typescript реализованы модули es6, поэтому можем без проблем их использовать вместо CommonJs модулей.

#### Интерфейс сообщения

Далее реализуем интерфейс `core/IMessage.ts`:

```ts
import { IUser } from './IUser';

export enum MessageSender { bot, user }

export interface IMessageProps {
    rawData: any;
    user: IUser;
    sessionKey: string;
    sender: MessageSender;
}

export interface IMessage {
    data: IMessageProps;

    getText(): string;
}
```

Вначале мы создадим перечисление MessageSender, в котором содержится тип отправителя: сообщения отправил бот или человек.

В IMessageProps опишем данные о сообщении: достаточно хранить сырые данные (rawData), которые пришли из коннектора, данные о пользователе и sessionKey для поиска сессии человека в хранилище сессий. Сообщение будет создаваться в канале (connector) и передаваться боту для обработки. По sessionKey и будет произведен поиск сессии. Например ключем может быть "Telegram-{userId}" или "Messenger-{userId}".
В классе Message так же нужно будет реализовать метод `getText`, в котором из rawData будет извлекаться текст сообщения.


#### Интерфейс коннектора

Теперь реализуем интерфейс для коннектора (`connectors/IConnector.ts`).

Каждый канал должен содержать статический метод `getConnectorName()`, который будет возращать название канала (Например, "Console" или "Telegram"), и будет использоваться в методе `getUniqueSessionKey()`, который возращает уникальный идентификатор сессии в зависимости от канала и данных пользователя.
`getUser()` будет возращать пользователя. Т.к. пользователя возможно придется загружать по апи канала, этот метод возращает Promise. Метод `send()` отвечает за отправку сообщения пользователю, `listen()` для получения сообщений от пользователя. Методы `on` и `emit` нужны для поддержки событейной модели: когда приходит новое сообщение, коннектор создает ссобытие, а Bot будет его слушать (для этого мы просто унаследуемся от класса EventEmitter).

<img class="lazyload" data-src="/assets/images/2018-09-30-create-universe-bot-nodejs/4.png" src="/assets/images/2018-09-30-create-universe-bot-nodejs/4-preview.png">

```ts
import { IUser } from '../core/IUser';
import { IMessage } from '../core/IMessage';

export enum ConnectorEvent {
    receiveMessage = 'receiveMessage'
}

export interface IConnector {
    getConnectorName(): string;
    getUniqueSessionKey(rawData?: {}): string;
    getUser(): Promise<IUser>;
    send(message: IMessage, user: IUser, options: any): Promise<void>;
    listen(): any;
    on(event: ConnectorEvent, handler: () => any): void;
    emit(event: ConnectorEvent, data: any): void;
}
```

Как вы можете заменить, комментировать парамерты методов нет смысла, так как у всех параметров указаны типы, и сразу становится ясно, что требуется передать на вход.
Это довольно крутая фича по сравнению с обычным js, где все типы приходится описывать в jsdocs.

#### Интерфейсы сессии и состояния сессии

Теперь перейдем к сессиям, и начнем с состояния (`core/ISessionState`). Состояние это простой key-value хранилище, в котором можно хранить любые данные, связанные с конкретным пользователем.
Например о том, когда пользователь первый написал боту, или какой-нибудь ответ на вопрос в ходе переписки, или, например, если мы реализуем todo-list, то список текущих задач.

```ts
export interface ISessionState {
    [key: string]: any;
}
```

Теперь перейдем к описанию `core/ISession.ts` - каждого объекта Session, к которому у нас есть доступ в каждом обработчике.

```ts
import { IBot } from './IBot';
import { ISessionState } from './ISessionState';

export interface ISession {

    /* Cсылка на бота нужна, чтобы отправлять сообщение пользователю
       из обработчиков: session.send(msg) */
    bot: IBot;

    /* Cостояние сессии (пользователя) */
    state: ISessionState;

    /* Начальное состояние пользователя (Например, если мы делаем список задач,
       то `initialState` может выглядеть как `{ todos: [] }`) */
    initialState: ISessionState;

    /* Если сессия не найдена в хранилище, то она будет создана и
       параметр isNew изначально будет равен `true`.
       Как только бот ответит пользователю, `isNew` меняет значение на `false`.
       Удобно использовать для приветсвенных сообщений для новых юзеров. */
    isNew: boolean;

    /* Метод вернет имя пользователя */
    getUsername(): string;

    /* Отправка пользователю сообщения */
    send(message: any, options?: any): Promise<any>;

    /* Сброс состояния на начальное */
    resetState(): void;

    /* Установка нового состояния */
    setState(state: ISessionState): void;
}
```
Как вы можете заменить, мы импортируем еще не реализованный интерфейс IBot, который мы опишем совсем скоро.
Это минимум, которым должна обладать сессия, который мы и реализуем сегодня.

#### Интерфейс хранилища сессий

У нас должна быть возможность указывать различные хранилища для сессий, поэтому создадим интерфейс `stores/ISessionStore.ts`.

```ts
import { ISession } from '../core/ISession';

export interface ISessionStore {
    find(key: string): Promise<ISession | null>;
    add(key: string, data: ISession): Promise<ISession>;
    destroy(key: string): Promise<any>;
}
```

Тут все довольно просто, у каждого `SessionStore` должна быть возможность поиска сессии по ключу, создание новой сессии и уничтожение существующей по ключу.
Здесь идет работа с асинхронными действиями (сохранение в файл, в кеш, в бд), поэтому все действия возращают Promise.

#### Интерфейс бота

И финальный компонент, который нам описать, основная часть нашего приложения, который объединяет все остальные, интерфейс `core/IBot.ts`.

Так же в файле опишем контекст и тип BotHandler, который должны имплементировать все обработчик.
Символ вопроса после названия переменной говорит о том (в контексте тайпскрипта), что переменная не обязательна.

```ts
import { IConnector } from '../connectors/IConnector';
import { ISessionStore } from '../stores/ISessionStore';
import { IMessage } from './IMessage';
import { ISession } from './ISession';
import { ISessionState } from './ISessionState';

export interface IBotContext {
    session: ISession;
    message: IMessage;

    /* Это переменная хранит в себе результат метода match с регулярным сообщением
       Указанном при инициализации обработчика, в примере todo-list станет более понятно */
    params?: object;
}

export type BotHandler = (context: IBotContext, next?: () => void) => void;

export interface IBot {

    /* Начальное состояние каждой сессии пользователя */
    initialState: ISessionState;

    /* Массив с обработчиками */
    handlers: BotHandler[];

    /* Хранилище сессией (В нашем случае в памяти) */
    sessionStore: ISessionStore;

    /* Канал или коннектор */
    connector: IConnector;

    /* Метод для получения или создания новой сессии */
    getSession(message: IMessage): Promise<ISession>;

    /* Обработка нового сообщения от пользователя и запуск обработчиков */
    processMessage(message: IMessage): void;

    /* Запуск обработчиков */
    processHandlers(handlers: BotHandler[], context: IBotContext): any;

    /* Добавление нового обработчика */
    use(patternOrHandler: BotHandler | RegExp | string, handler?: BotHandler): any;
}
```

Фух, мы проделали большую работы, и можно переходить к реализации всех наших интерфейсов.

## Часть 4. Реализация

Пойдем примерно в таком же порядке, как и при описании интерфейсов.

#### Message

Класс `Message` довольно простой, в конструкторе сохраняет в this.data данные о сообщении и предоставляем пользоватлю несколько геттеров.

```typescript
/* core/Message.ts */

import { IMessage, IMessageProps } from './IMessage';
import { IUser } from './IUser';

export class Message implements IMessage {
    data: IMessageProps;

    constructor(data: IMessageProps) {
        this.data = data;

        return this;
    }

    getText(): string {
        return this.data.rawData.text;
    }

    getUser(): IUser {
        return this.data.user;
    }

    getSessionKey(): string {
        return this.data.sessionKey;
    }
}
```

#### Connector

Для работы с консолью будем использовать библиотеку `readline`. Так как в консоле может быть только один пользователь то метод `getUser()` всегда будет возвращать одного юзера, а методу `getUniqueSessionKey()` достаточно возвращать "Console".
Метод `send()` просто выводит текст из переданного в аргументах сообщения в консоль.

А вот метод `listen()` немного поинтереснее. В нем мы слушаем `process.stdin` поток, и на каждое сообщение создаем объект `Message` и вызываем событие `ConnectorEvent.receiveMessage`.
`Bot` подписывается на это событие. Если пользователь вводит `quit`, то завершаем выполнение скрипта.

```typescript
/* connectors/ConsoleConnector.ts */

import 'colors';
import { EventEmitter } from 'events';
import * as readline from 'readline';
import { Message } from '../core/Message';
import { IConnector, ConnectorEvent } from './IConnector';
import { IUser } from '../core/IUser';
import { IMessage, MessageSender } from '../core/IMessage';

export default class ConsoleConnector extends EventEmitter implements IConnector {
    static _getUser(): IUser {
        return {id: 'user', name: 'Console User'};
    }

    getConnectorName(): string {
        return 'console';
    }

    getUniqueSessionKey() {
        return this.getConnectorName();
    }

    async getUser(): Promise<IUser> {
        return Promise.resolve(ConsoleConnector._getUser());
    }

    /* Отправляем сообщение пользователю в консоль зеленым цветом */
    async send(message: IMessage) {
        console.log(message.getText().green);

        return Promise.resolve();
    }

    listen() {
        /* Создаем интерфейс для чтения stdin потока */
        const rl = readline.createInterface(process.stdin, process.stdout);

        rl.on('line', (line: string = '') => {
            /* Если пользователь ввел quit, завершаем работу бота */
            if (line.toLowerCase() === 'quit') {
                rl.close();
                process.exit();
            }

            const msg = new Message({
                rawData: { text: line },
                user: ConsoleConnector._getUser(),
                sessionKey: this.getUniqueSessionKey(),
                sender: MessageSender.user
            });

            /* Эммитим созданное сообщение (Bot случает событие receiveMessage,
               поэтому сразу после вызыва начинает обрабатывать сообщение */
            this.emit(ConnectorEvent.receiveMessage, msg);
        });

        return this;
    }
}
```

#### Session

Класс `Session` довольно простой, в нем мы реализуем все методы и поля, которые мы рассматривали ранее.
При создании инстанса мы устанавливаем начальное состояние (initialState), сохраняем ссылку на бота.
В методе `send()` (который вызывается из обработчиков уже в пользовательском коде) мы просто вызываем `connector.send()`.

```typescript
/* core/Session.ts */

import { Message } from './Message';
import { IBot } from './IBot';
import { IUser } from './IUser';
import { MessageSender } from './IMessage';
import { ISessionState } from './ISessionState';
import { ISession } from './ISession';

interface ISessionConstructorProps {
    user: IUser;
    bot: IBot;
    initialState?: ISessionState;
}

export class Session implements ISession {
    bot: IBot;
    state: ISessionState;
    initialState: ISessionState = {};
    isNew: boolean = true;
    user: IUser;

    constructor({ user, bot, initialState }: ISessionConstructorProps) {
        this.bot = bot;
        this.initialState = initialState || {};
        this.state = { ...initialState };
        this.user = user;
    }

    getUsername(): string {
        return this.user.name;
    }

    send(text: string, options: any) {
        this.isNew = false;

        const message = new Message({
            rawData: { text },
            user: this.user,
            sessionKey: this.bot.connector.getUniqueSessionKey(),
            sender: MessageSender.bot
        });

        return this.bot.connector.send(message, this.user, options);
    }

    resetState(): void {
        this.state = { ...this.initialState };
    }

    setState(state: ISessionState): void {
        Object.keys(state).forEach((key) => {
            this.state[key] = state[key];
        });
    }
}
```

Перед классом мы задаем еще локальный интерфейс для параметров конструктора `ISessionConstructorProps`.
Если бы конструктор принимал строку или число, нет смысла выносить описание в отдельный интерфейс, но более сложные
структуры очень удобно выносить.

#### SessionStore

Реализуем `MemorySessionStore` для хранения сессий в памяти.
В классе реализованы все методы, которые мы описали выше, а в поле `_store` будут храниться все сессии, соответствующие текущему боту.
Пока процесс node запущен, он будет хранить все данные.

```typescript
/* stores/MemorySessionStore.ts */

import { ISessionStore } from './ISessionStore';
import { Session } from '../Session';

export default class MemorySessionStore implements ISessionStore {
    private store: { [key: string]: Session } = {};

    async find(key: string) {
        return Promise.resolve(this.store[key]);
    }

    async add(key: string, data: Session) {
        this.store[key] = data;

        return Promise.resolve(data);
    }

    async destroy(key: string) {
        delete this.store[key];
        return Promise.resolve();
    }
}
```

#### Bot

Вот мы и подошли к самому последнему и важному классу - Bot.
В конструкторе получаем объект `IConnector`, создаем инстанс `MemorySessionStore` и подписываемся на получение новых сообщений из коннектора.

```js
/* core/Bot.ts */

import * as compose from 'koa-compose';
import MemorySessionStore from '../stores/MemorySessionStore';
import { ISessionStore } from '../stores/ISessionStore';
import { IConnector, ConnectorEvent } from '../connectors/IConnector';
import { Session } from './Session';
import { Message } from './Message';
import { BotHandler, IBot, IBotContext } from './IBot';
import { ISessionState } from './ISessionState';
import { ISession } from './ISession';

interface IBotConstructorProps {
    connector: IConnector;
}

export default class Bot implements IBot {
    initialState: ISessionState = {};
    handlers: BotHandler[] = [];
    sessionStore: ISessionStore = new MemorySessionStore();
    connector: IConnector;

    constructor({ connector }: IBotConstructorProps) {
        if (!connector) {
            throw new Error('Connector argument is required');
        }

        this.connector = connector;
        this.connector.on(ConnectorEvent.receiveMessage, this.processMessage.bind(this));

        return this;
    }

    async processHandlers(handlers: BotHandler[], context: IBotContext) {
        /* Используем библиотеку compose, которая поможет из массива обработчиков
           вызывать их друг за другом */
        return compose(handlers)(context);
    }

    async getSession(message): Promise<ISession> {
        const key = message.getSessionKey();
        let session = await this.sessionStore.find(key);

        /* Если сессия найдена, возращаем ее, иначе создаем новую */
        if (session) {
            return session;
        }

        session = new Session({
            user: message.getUser(),
            bot: this,
            initialState: Object.assign({}, this.initialState)
        });

        return await this.sessionStore.add(key, session);
    }

    /* Обрабатываем все поступившие сообщения */
    async processMessage(message: Message) {
        const session = await this.getSession(message);
        const context: IBotContext = { session, message };

        this
            .processHandlers(this.handlers, context)
            .catch((error) => {
                console.error(error);
            });
    }

    use() {
        /* ... */
    }
}
```

Теперь реализуем метод `use()`. Сделаем возможность запускать миддлевары, если сообщение соответствует шаблону (строке или регулярному выражению),
или должно выполняться всегда, если первым параметров передана функция-обработчик.

```js
/* Будет срабатывать, только если сообщение начинается с "/yo ..." */
bot.use(/\/yo (.+)/, async ({ session, message }) => {
    await session.send(`hey ${message.params[0]}`);
});
```

Если нам не понадобились бы обработчики, которые запускались, если сообщение соответсвует регулярному выражению или строке, то достаточно было в массив с обработчиками добавить новый.
Но, в нашем случае мы в зависимости от типа первого аргумента оборачиваем обработчик в функцию, в которой проверям соответствие. Если проверка пройдена, запускаем обработчик, если нет, то просто вызываем `next()` для перехода к следующему обработчику.

Так же, если используется регулярное выражение, то все найденные "части" будут добавлены в `ctx.params`. Например в примере выше:

```bash
> /yo bro
ctx.message.params = ['bro']
```

Обновим метод `use()`:

```js
use(patternOrHandler: BotHandler | RegExp | string, maybeHandler?: BotHandler) {
    const handler = maybeHandler || patternOrHandler as BotHandler;
    const pattern = patternOrHandler;

    if (typeof handler !== 'function') {
        throw new Error('BotHandler should be function');
    }

    if (pattern instanceof RegExp) {
        this.handlers.push((ctx, next) => {
            const text = ctx.message.getText();
            const match = text.match(pattern);

            if (match) {
                ctx.params = match.length > 1 ? match.slice(1) : null;
                return handler(ctx, next);
            }

            return next();
        });
    } else if (typeof pattern === 'string') {
        this.handlers.push((ctx, next) => {
            const text = ctx.message.getText();

            if (text === pattern) {
                return handler(ctx, next);
            }

            return next();
        });
    } else {
        this.handlers.push(handler);
    }
}
```

Можно его разбить на методы для каждого случая, но в рамках этого материала мы этого делать не будем.

#### Экспорт всех модулей

И последним действием нужно экспортировать все компоненты, для этого создадим файл `index.ts` со следующим содержимым:

```js
import Bot from './core/Bot';
import { Session } from './core/Session';
import { Message } from './core/Message';
import ConsoleConnector from './connectors/ConsoleConnector';
import MemorySessionStore from './stores/MemorySessionStore';

import { IConnector, ConnectorEvent } from './connectors/IConnector';
import { IBot, IBotContext, BotHandler } from './core/IBot';
import { IUser } from './core/IUser';
import { IMessage, IMessageProps, MessageSender } from './core/IMessage';
import { ISession } from './core/ISession';
import { ISessionState } from './core/ISessionState';
import { ISessionStore } from './stores/ISessionStore';

export {
    Bot,
    Session,
    Message,

    ConsoleConnector,
    MemorySessionStore,

    BotHandler,
    ConnectorEvent,
    MessageSender,

    IBot,
    IBotContext,
    ISession,
    ISessionState,
    IMessage,
    IUser,
    IConnector,
    ISessionStore,
    IMessageProps
};
```

Мои поздравления! Мы реализовали простейшего расширяемого бота! Что ж, настала пора испробовать, на что он способен.

## Часть 5. Примеры работы

Приступим к самому интересному, к примерам! Все примеры можно найти на [noveogroup-amorgunov/typebot/examples](https://github.com/noveogroup-amorgunov/typebot/tree/tutorial/examples).

Для начала соберем typescript в js, выполнив `npm run build`.
Для создания всех ботов будет использована конструкция (которая уже встречалась в самом начале статьи):

Если вы сразу перешли к этой части и хотите потестировать примеры, то замените `require('../lib')` на `require('universebot')`, предварительно установив его (`npm install universebot`).
А если вы прошли все шаги сначала, то создайте в папке examples файл, в которым мы будем тестировать бота.

Здесь уже будем писать примеры на javascript, но при всем желании вы можете продолжить писать и на typescript:

```js
/* examples/test.js */

const { ConsoleConnector, Bot } = require('../lib');

const connector = new ConsoleConnector().listen(); /* Создаем "консольный" канал */
const bot = new Bot({ connector }); /* Создаем бота */
```

### echo-bot

Самый простой пример, это *echo-bot*, который отвечает пользователю точно таким же сообщением, которое получил.

```js
bot.use(async (ctx, next) => {
    ctx.session.send(`> You said: ${ctx.message.getText()}`);
    next();
});
```

Для тестирования бота нужно запустить скрипт и написать текст в консоль:

```bash
hello bot
> You said: hello bot
yo
> You said: you
```

### async-middleware

Следующий пример позволяет вывести затраченное время обработки сообщения от пользователя.
В первом обработчике сохраняем время начала обработки с помощью `Date.now()` и вызываем `await next()` для выполнения всех последющих обработчиков. Пример очень напоминает фреймворк Koa, использую всю мощь async/await. После выполнения всех обработчиков подсчитываем сколько времени в секундах занял запрос.

Во втором middleware мы ждем от 0 до 9 секунд и отправляем пользователю это число.

```js
/* "Резолвим" промис через timeout (задержка выполения кода на timeout мс) */
const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

/* Обработчик ничего не отправляет пользователю,
   а просто замеряет время обработки запроса */
bot.use(async (ctx, next) => {
    const start = Date.now();

    await next();

    const end = Math.round((Date.now() - start) / 1000);

    console.log(`Request is handled for about ${end}sec`);
});

/* Имитируем какую-нибудь сложную работу, занимающую несколько секунд */
bot.use(async (ctx) => {
    /* Генерируем таймаут случайным образом */
    const timeout = Math.round(Math.random() * 10) * 1000;

    await sleep(timeout);

    ctx.session.send(`timeout ${timeout}ms`);
});
```

```bash
> hello # 3 секунды ничего не происходит
timeout 3000ms
Request is handled for about 3sec

> hello again # в этот раз 1 секунду
timeout 1000ms
Request is handled for about 1sec
```

### todos

Сейчас фреймворк или библиотека без списка задач (todolist), это не фреймворк, даже если это чатбот :).
В этом примере задействуем реализованный нами state (состояние) пользователя (`setInitialState()`, `resetState()`, `setState()`), в котором будем хранить задачи, а также запуск обработчиков по соответствию с заданной командой.

```js
/* Задаем начальное состояние: пустой массив задач */
bot.initialState = { todos: [] };

/* Вывод списка задач пользователю */
bot.use('/list', async ({session}) => {
    const { todos } = session.state;
    const msg = todos.length > 0 ? todos.join('\n') : 'No todos!';

    await session.send(msg);
});

/* Отчищаем список задач с помощью resetState */
bot.use('/clear', async ({session}) => {
    session.resetState();
    await session.send('Successfully clear all todos!');
});

/* Добавляем новую задачу в список задач */
bot.use(/\/add (.+)/, async ({session, message}) => {
    const [newTodo] = message.params;

    session.setState({ todos: [...session.state.todos, newTodo] });
    await session.send(`Todo: ${newTodo} added!`);
});

/* Так как мы не вызывали next в предыдущих обработчиках, то если любой из них
   выполнился, последующие обработчики не будут вызваны.
   Данный обработчик выполнится, сообщив юзеру, что введенная команда не найдена. */
bot.use(async ({session}) => {
    await session.send('Unknown command. Type /list, /clear or /add {todo}.');
});
```

Пример использования:

```bash
> /list
No todos!
> reg
Unknown command. Type /list, /clear or /add {todo}.
> /add learn flowtype
Todo: learn flowtype added!
> /add go shopping
Todo: go shopping added!
> /list
learn flowtype
go shopping
> /clear
Successfully clear all todos!
> /list
No todos!
```

Можете испробовать todo-бота прямо тут:

<div class="terminal" data-bot="todo"></div>

### giphy-bot

Самый интересный бот из представленных, который возвращает гифку по ключевому слову. Для поиска гифок будем использовать сервис https://developers.giphy.com/, в котором нужно зарегистрироваться для получения токена.

Первым делом напишим функцию для загрузки и извлечении ссылки на изображение:

```js
const axios = require('axios');

const API_KEY = process.env.GIPHY_API_KEY;

function getApiEndpoind(q) {
    return `http://api.giphy.com/v1/gifs/search?q=${q}&api_key=${API_KEY}&limit=1`;
}

async function getGifUrlByKeywords(keywords) {
    const response = await axios.get(getApiEndpoind(keywords));

    return response.data.data[0].images.fixed_height.url;
}

module.exports = { getGifUrlByKeywords };
```

Далее команду для запроса гифки:

```js
const { ConsoleConnector, Bot } = require('../../lib');
const giphyService = require('./giphyService');

const connector = new ConsoleConnector().listen();
const bot = new Bot({connector});

bot.use(/\/gif (.+)/, async (ctx, next) => {
    const keywords = ctx.message.params[0];
    const gifUrl = await giphyService.getGifUrlByKeywords(keywords);

    ctx.session.send(`Goto ${gifUrl} to see ${keywords}`);
});

bot.use(async (ctx, next) => {
    ctx.session.send('Unknown command, try type /gif {any-words}, like /gif funny cat');
    next();
});

```

Пример использования (запускать нужно `GIPHY_API_KEY={ваш-токен} nodejs index.js`):

```bash
> erger
Unknown command, try type /gif {any-words}, like /gif funny cat
> /gif china
Goto https://media0.giphy.com/media/OurQj48GqeCPu/200.gif to see china
> /gif funny china
Goto https://media3.giphy.com/media/DwXOS8RqHocEM/200.gif to see funny china
> /gif panda
Goto https://media0.giphy.com/media/26tneSGWphvmFlUju/200.gif to see panda
> /gif javascript
Goto https://media2.giphy.com/media/SMNlGwuft9RVS/200.gif to see javascript
```

## Заключение

На самом деле это только начало. Написав коннектор для своего любимого мессенджера и хранилище для монги, можно реализовать бота на любой вкус.

Если будет время, обязательно напишу про опыт написания реальных ботов на заказ, системе диалогов и чудесном сервисе api.ai, который парсит сообщения пользователя и вытаскивает из них "намерение" пользователя.

До связи!
