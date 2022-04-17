---
title: "Server side rendering в React"
date: 2020-12-08
time: 30
description: "Перепишем клиенсткое React приложение на изоморфное с Server Side Rendering"
featuredImageThumbnail: "/assets/images/2020-12-08-server-side-rendering-in-react/preview.jpg"
tags:
  - react
  - typescript
  - ssr
  - tutorial
layout: layouts/post.njk
likes: 75
---

## Tl;dr

В существующее приложение на React поэтапно будем внедрять SSR, разбирая все до мелочей. Материл большой (пройдемся подробно по всем основным шагам) и для знакомства может быть избыточным, поэтому если вы раньше не слышали про SSR, то рекомендую начать со следующих туториалов:

- [Server side rendering your react app in three simple steps](https://www.freecodecamp.org/news/server-side-rendering-your-react-app-in-three-simple-steps-7a82b95db82e/)
- [How to Enable Server-Side Rendering for a React App](https://www.digitalocean.com/community/tutorials/react-server-side-rendering)

## Вступление

Доброго времени суток, уважаемый читатель. Сегодня мы с нуля добавим в React приложение поддержку *Server side rendering* (SSR), сделав приложение изоморфным (работающим на стороне сервера и клиента).

SSR - это популярная техника для отрисовки приложений (в нашем случае это *client-side* одностраничные приложения) на стороне сервера и последующей отправкой полностью отрендереной страницы клиенту. Подход полезен для SEO (поисковые боты до сих пор не умеет правильно обрабатывать JavaScript), UX (пользователи сразу получают отрендеренные страницы) и лучших показателей метрик производительности.

Уже существует немало решений с поддержкой SSR из коробки (тот же [Next.js](https://nextjs.org/)), но понимание, как все работает изнутри и тонкая настройка порой просто необходимы при разработке.

Это второй выпуск по SSR в React-е:

<div class="post-series">
    <h4>Серия статей:</h4>
    <ol>
        <li><a href="/posts/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/">Работа с cookies в универсальных приложениях на React</a></li>
        <li>Server side rendering в React <em>(Этот пост)</em></li>
    </ol>
</div>

Работать будем над самым типичным приложением для React-экосистемы. Но искусственные проекты без темы - скучные, поэтому сегодня будем готовить каталог кроссовок с главной страницей, каталогом и карточкой товара.

<img
  style="width: 100px"
  class="lazyload"
  alt=" Иконка сайта"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/0.min.png"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/0.png"
/>

Для достижения цели потребуется поработать над многими частями проекта: начнем с вебпак конфига для сервера, запустим сервер на NodeJS, подготовим роутинг, настроим подгрузку данных для Redux и сделаем многое другое. Изначальный и финальный варианты приложения выложены на Github ([без SSR](https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/client-side-version), [с SSR](https://github.com/noveogroup-amorgunov/react-ssr-tutorial)), а само приложение развернуто на Heroku и доступно по ссылке [https://react-ssr-tutorial.herokuapp.com/](https://react-ssr-tutorial.herokuapp.com/).

> Приложение написано на TypeScript (но вы можете повторить все шаги и на обычном JS, переименовав файлы с расширением .tsx на jsx и удалив TS типы):

Быстрые переходы по частям:

- [Структура React приложения](#структура-react-приложения)
- [Шаг 1. Первые шаги SSR](#шаг-1.-первые-шаги-ssr)
- [Шаг 2. Router и Redux](#шаг-2.-настраиваем-router-и-redux)
- [Шаг 3. Meta теги](#шаг-3.-meta-теги)
- [Шаг 4. Saga/Thunk и асинхронная подгрузка данных](#шаг-4.-saga%2Fthunk-и-асинхронная-подгрузка-данных)
- [Шаг 5. Code spitting + Prefetch](#шаг-5.-code-splitting-и-prefetch)
- [Заключение](#заключение)

## Структура React приложения

Еще раз скину [ссылку на ветку в github](https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/client-side-version), в которой мы внедрим SSR. Вы можете склонировать проект и пошагово внедрять изменения. Проект использует базовый стек технологий: Webpack/React/Redux/Redux-saga:

```treeview
├─ src
  ├─ components
  ├─ pages
  ├─ store
  ├─ styles
  ├─ types
  ├─ client.tsx
  └─ index.html
├─ static/images
└─ webpack
```

Компонент `components/App` используется как layout и подключает все роуты, которые в свою очередь рендерят страницы из папки `pages`. Страницы - это обычные верхнеуровневые компоненты, которые забирают данные из редакса и рендерят контент.

В директории `store/ducks` лежат модули для работы с redux стором (подробнее про даки можно почитать [на медиуме](https://medium.freecodecamp.org/scaling-your-redux-app-with-ducks-6115955638be)). Если работали с vue, то по организации очень похоже на модули во vuex:

```
├─ components
├─ store
  └─ ducks
      └─ homepage
          ├─ actions.ts
          ├─ reducer.ts
          ├─ saga.ts
          ├─ selectors.ts
          ├─ service.ts
          └─ types.ts
├─ pages
├─ ...
```

Вы могли заметить, что нет директории `containers`. Приложение небольшое, логика для связи редакса и реактовских компонентов помещена в сами компоненты. Например, вот так выглядит компонент главной страницы (`Home.tsx`) - берем экшен, данные из селекторов и пробрасываем в компонент:

```js
// src/pages/Home/Home.tsx

// Реализация компонента ...

const mapStateToProps = (state: State) => ({
    data: getHomepage(state),
    isLoading: isLoading(state),
});
const mapDispatchToProps = { fetchHomepage };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home);
```

> Недавно я писал статью об использовании хуков с редаксом, в которой остановился на варианте с использованием connect: https://amorgunov.com/posts/2020-04-12-use-redux-with-react-hooks/

На самом деле в моих последних рабочих проектах подход разделения на контейнеры не использовался и никаких проблем не возникало, поэтому жизнь без контейнеров возможна и в больших приложениях.

В проекте не используются реальные API и все данные заранее подготовлены. Но при их получении используется задержка в 500мс для эмуляции реальной загрузки с внешнего ресурса:

```js
import mockData from './mock.json';

export const fetchCatalog = () =>
    timeout(500)
        .then(() => mockData)
        .then(data => data.items.map(shoesSerializer));
```

Конфиг вебпака вынесен в отдельную директорию и разбит на файлы (все лоадеры разнесены по отдельным файлам) для более удобного конфигурирования:

```
├─ src
├─ static/images
└─ webpack
  ├─ loaders
    ├─ css.ts
    ├─ file.ts
    └─ js.ts
  ├─ env.ts
  └─ client.config.ts
```

##  Шаг 1. Первые шаги SSR

Ветка в *Github* по результатам этой части: https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/01-prepare-webpack-and-express-server

### Схема запуска

Сначала нужно определиться, как будет запускаться приложение. Текущая схема довольна проста: запускается *webpack-dev-server* (который внутри себя поднимает сервер).

<img
  class="lazyload"
  alt="Текущая схема запуска проекта"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/1.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/1.jpg"
/>

С SSR запуск немного усложняется. Хоть приложение и универсальное, теперь понадобятся две точки входа в приложение - серверная и клиентская. Серверный бандл будет отрабатывать на сервере и нужен для формирования html-страницы, клиентский - обычный js/css файлы, которые скачиваются и запускаются в браузере. Серверный бандл не нужно разбивать на чанки, не нужно минимизировать и вообще можно обойти большинство обработок (не собирать css, не собирать модули из node_modules), которые нужны для клиентского бандла. А это значит, что нужно запускать *Webpack* для сборки под каждую среду (конфиг рассмотрим далее).

Запускать сервер нужно самим, как и перезапускать при изменении бандла для режима разработки. Посмотрим на схему запуска проекта с SSR:

<img
  class="lazyload"
  alt="Схема запуска проекта с SSR"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/2.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/2.jpg"
/>

Перезапускать сервер будет Nodemon, а собирать бандлы - Webpack.

Установим необходимые зависимости:

```bash
npm i --save express compression
npm i --save-dev nodemon null-loader webpack-node-externals npm-run-all @types/express @types/webpack-node-externals
```

- `express` - Веб-сервер
- `compression` - Для сжатия статики
- `nodemon` - CLI для перезапуска веб-сервера
- `null-loader` - Loader для серверного конфига вебпака
- `webpack-node-externals` - Плагин для серверной сборки
- `@types/*` - TS-тайпинги

И обновим секцию со скриптами в *package.json*:

<div class="code-path">package.json</div>

```diff
- "start": "NODE_ENV=development webpack serve --hot --mode development --config webpack/client.config.ts",
+ "start:webpack": "webpack --mode=development --watch",
+ "start:server": "nodemon index.js --watch dist/server.js",
+ "start": "NODE_ENV=development npm-run-all --print-label --parallel start:*"
```

> Webpack будет собирать код параллельно для двух сред, еще и Nodemon будет перезапускать сервер, поэтому для понимания, что сейчас собирается, очень помогает опция `--print-label` для `npm-run-all`, которая будет выводить лейбл выполняющегося процесса перед каждой строкой лога в терминале:

<img
  class="lazyload"
  alt="Вывод лейбла в термине"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/3.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/3.jpg"
/>


### Сервер на express

На клиенте метод `ReactDOM.render` заменим на `ReactDOM.hydrate`. Он строит приложение не с нуля, а на основе html-разметки, которая сгенерирована на сервере, что работает в разы быстрее, так как не требуется заново генерировать DOM:

<div class="code-path">src/client.tsx</div>

```diff
- ReactDOM.render(
+ ReactDOM.hydrate(
    <ReduxProvider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ReduxProvider>,
    document.getElementById('mount'),
);
```

Далее нам понадобится веб-сервер, в котором на все запросы с помощью метода `renderToString()` сгенерируем из приложения html-строку (пока без HOC-ов для *Redux* и *ReactRouter*). Сразу вынесем рендеринг приложения в отдельный файл (миддлевару), а запуск сервера в `index.js` файл.

> В реальных приложениях в файле `app.js|ts` принято экспортировать сервер, а запускать его отдельно. Это удобно как для интеграционных тестов (чтобы не запускать реальный сервер), так и для эксплуатации (например, возможность запускаться через pm2).

<br>

В отдельном файле запускаем сервер на порту 9001 из собранного файла `./dist/server.js`. Заметьте, это JavaScript файл, который можно запускать из NodeJS без трансформаций и компиляций.

<div class="code-path">index.js</div>

```javascript
const { app } = require('./dist/server.js');

const port = process.env.PORT || 9001;

app.listen(port, () => {
    console.log('Application is started on localhost:', port);
});
```

В файле `server.ts` создаем express-приложение с одной миддлеварой на все принимаемые запросы:

<div class="code-path">src/server.ts</div>

```typescript
import path from 'path';
import express from 'express';
import compression from 'compression';
import 'babel-polyfill';
import serverRenderMiddleware from './server-render-middleware';

const app = express();

// Рекомендую использовать только для разработки
// А в production раздавать статику через Nginx или CDN
app.use(compression())
    .use(express.static(path.resolve(__dirname, '../dist')))
    .use(express.static(path.resolve(__dirname, '../static')));

app.get('/*', serverRenderMiddleware);

export { app };
```

А в файле `server-render-middleware.tsx` отрендерим *JSX* в html:

<div class="code-path">src/server-render-middleware.tsx</div>

```typescript
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Request, Response } from 'express';
import { App } from './components/App/App';

export default (req: Request, res: Response) => {
    const jsx = (<App />);
    const reactHtml = renderToString(jsx);

    res.send(getHtml(reactHtml));
};

// function getHtml(reactHtml: string) {}
```

Далее полученную строку вставляем в заготовленную html-обертку, которую и отдаем клиенту:

<div class="code-path">src/server-render-middleware.tsx</div>

```ts
function getHtml(reactHtml: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="shortcut icon" type="image/png" href="/images/favicon.jpg">
        <title>Sneakers shop</title>
        <link href="/main.css" rel="stylesheet">
    </head>
    <body>
        <div id="mount">${reactHtml}</div>
        <script src="/main.js"></script>
    </body>
    </html>
    `;
}
```

Так как веб-сервер раздает директорию `dist`, то стили и JS можно подключить напрямую. Шаблон html-страницы `src/index.html` больше не понадобится и его можно удалить.

### Обновление webpack конфига

Чтобы *NodeJS* могла работать с *JSX* (да и *TypeScript*-ом), нужно собирать серверный код через *Webpack*, но не так, как для клиента. Для этого нужно создать отдельный конфиг для сборки серверного бандла. В этом конфиге нужно сделать две вещи:

- Не собирать в бандл код из стандартных библиотек типа `path`, `fs` и из *node_modules* библиотек с помощью плагина `webpack-node-externals`:

<div class="code-path">webpack/server.config.ts</div>

```typescript
{
    target: 'node',
    externals: [
        nodeExternals({ allowlist: [/\.(?!(?:tsx?|json)$).{1,5}$/i] })
    ],
}
```

Помимо этого нужно поправить поле *output*, чтобы собрать все в один файл. Полный конфиг можете [взять в репозитории](https://github.com/noveogroup-amorgunov/react-ssr-tutorial/blob/01-prepare-webpack-and-express-server/webpack/server.config.ts).

- Не нужно собирать *CSS* и картинки на сервере. Это можно сделать c помощью `NullLoader`.

> Замечу, что это может не сработать для CSS-Modules или Styled-Components, только для обычного CSS.

<br/>
<div class="code-path">webpack/loaders/css.ts</div>

```diff
export default {
    client: {
        test: /\.css$/,
        use: [...loaders]
    },
+   server: {
+       test: /\.css$/,
+       loader: 'null-loader',
+   },
};
```

Так же нужно добавить лоадеры для JS и файлов (посмотреть можно [тут](https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/01-prepare-webpack-and-express-server/webpack/loaders)). На вход *Webpack* можно подать массив из двух конфигов, и он соберет бандлы для каждого:

<div class="code-path">./webpack.config.ts</div>

```diff
import clientConfig from './webpack/client.config';
+ import serverConfig from './webpack/server.config';

module.exports = [
    clientConfig,
+   serverConfig
];
```

На этом с подготовкой все, но при запуске и переходе на *localhost:9001* получим ошибку *Error: Invariant failed: You should not use <NavLink> outside a <Router>*. Но она ожидаема, так как мы не оборачивали наше приложение в RouterProvider, что сделаем следующим шагом.

## Шаг 2. Настраиваем Router и Redux

Ветка в *Github* по результатам этой части: https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/02-add-redux-and-react-router

### Роутер

На сервере нет доступа к *location* и *history* объектам, из-за чего нет возможности использовать компонент *Router*. Но можно использовать *StaticRouter*, в который мы можем явно передать текущий url из запроса.

<div class="code-path">./src/server-render-middleware.tsx</div>

```diff
+ import { StaticRouter } from 'react-router-dom';
+ import { StaticRouterContext } from 'react-router';

export default (req: Request, res: Response) => {
+   const location = req.url;
+   const context: StaticRouterContext = {};

    const jsx = (
+        <StaticRouter context={context} location={location}>
            <App />
+        </StaticRouter>
    );
    const reactHtml = renderToString(jsx);

    // ...
};
```

Вы можете заметить еще одно свойство - `context`. В него роутер записывает информацию об изменении локейшена при рендеринге приложения. Например, если внутри реактовского приложения произошел редирект (`<Redirect to={to} />`), то нужно выполнить этот редирект сразу на сервере. Для этого достаточно проверить, что в *context* есть свойство `url`.

```typescript
export default (req: Request, res: Response) => {
    // ...

    if (context.url) {
        res.redirect(context.url);
        return;
    }

    // ...
};
```

И наконец в *context* можно записать *statusCode* прямо внутри приложения и вернуть страницу браузеру с нужным статусом.

```typescript
export default (req: Request, res: Response) => {
    // ...

    res
        .status(context.statusCode || 200)
        .send(getHtml(reactHtml));
};
```

Как установить статус, можете посмотреть в компоненте Status в [src/pages/404/404.tsx](https://github.com/noveogroup-amorgunov/react-ssr-tutorial/blob/master/src/pages/404/404.tsx#L12).

## Redux

C Redux все проще. Нужно формировать стейт на сервере и передавать его в сериализованном виде на клиент. А на клиенте использовать этот стейт в качестве начального состояния. Также при необходимости можно задиспатчить инициализирующиеся экшены.

Немного освежим файл `src/store/rootStore.ts`, в котором инициализируется *Redux store*. Создадим хелпер `isServer`:

<div class="code-path">./src/store/rootStore.ts</div>

```typescript
export const isServer = !(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);
```

Этот хелпер можно вынести в общие утилиты и использовать везде, где необходима различная логика работы на сервере и клиенте. Изначально я его считал костылем, который лучше не использовать, но на всех проектах с SSR встречал его в каком-либо виде.

Сразу используем его в 3 местах: не будем на сервере подключать *DevTools* плагин для *Redux*, не будем запускать *Saga* и для *connected-react-router* (используется для хранения состояния роутера в *Redux*) объект history будем брать из *createMemoryHistory* (который используется как раз для серверного рендеринга):

<div class="code-path">./src/store/rootStore.ts</div>

```diff
function getComposeEnhancers() {
-    if (process.env.NODE_ENV !== 'production') {
+    if (process.env.NODE_ENV !== 'production' && !isServer) {
        return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    }

    return compose;
}

// ...

export function configureStore(initialState: State, url = '/') {
+    const history = isServer
+        ? createMemoryHistory({ initialEntries: [url] })
+        : createBrowserHistory();

    // ...

+    if (!isServer) {
            sagaMiddleware.run(rootSaga);
+    }
```

Далее обернем приложение на сервере в провайдер:

<div class="code-path">./src/server-render-middleware.tsx</div>

```diff
+ import { Provider as ReduxProvider } from 'react-redux';
+ import { configureStore } from './store/rootStore';
+ import { getInitialState } from './store/getInitialState';

export default (req: Request, res: Response) => {
    // ...
+   const { store } = configureStore(getInitialState(), location);

    const jsx = (
+        <ReduxProvider store={store}>
            <StaticRouter context={context} location={location}>
                <App />
            </StaticRouter>
+        </ReduxProvider>
    );
    const reactHtml = renderToString(jsx);

    // ...
};
```

При необходимости можно сразу задиспатчить желаемый экшен, но у нас в проекте таких нет:

```typescript
const { store } = configureStore(getInitialState(), location);
store.dispatch(initializeSession());
```

Получаем сформированный стейт и добавим его в нашу html-обертку...

<div class="code-path">./src/server-render-middleware.tsx</div>

```diff
export default (req: Request, res: Response) => {
    const reactHtml = renderToString(jsx);
+   const reduxState = store.getState();

+   res.send(getHtml(reactHtml, reduxState));
};
```

В *getHtml* добавим переменную `window.__INITIAL_STATE__`, в которую положим `reduxState`, чтобы он был доступен на клиенте:

<div class="code-path">./src/server-render-middleware.tsx</div>

```html
<div id="mount">${reactDom}</div>
<script>
  window.__INITIAL_STATE__ = ${JSON.stringify(reduxState)}
</script>
<script src="/main.js"></script>
```

> Если данные в стейте могут задавать пользователи (*UGC*) или они формируется из внешних API, то возможна XSS уязвимость. В таких случаях данные нужно проверять и как минимум экранизировать.

В браузере в исходном коде страницы мы можем увидеть эту переменную со сформированным на сервере стейтом:

<img
  class="lazyload"
  alt="Redux-стейт сформированный на сервере"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/4.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/4.jpg"
/>

На клиенте ее считываем и прокидываем при создании стора в качестве *preloadedState*.

<div class="code-path">./src/client.tsx</div>

```typescript
const initialState = window.__INITIAL_STATE__;
const { store, history } = configureStore(initialState);
```

На этом моменте проснется *TypeScript*, и скажет, что в *window* нет такой переменной. Для этого можно доопределить глобальный интерфейс:

<div class="code-path">./src/client.tsx</div>

```typescript
import { State } from 'types';

declare global {
    interface Window {
        __INITIAL_STATE__: State;
    }
}
```

Кстати да, запустив приложение, оно будет работать, на клиент будет приезжать html, но пока без подгруженных данных:

<img
  class="lazyload"
  alt="Работа приложения"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/5.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/5.gif"
/>

## Шаг 3. Meta-теги

Ветка в *Github* по результатам этой части: https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/03-add-react-helmet

*Helmet* - это библиотека, с помощью которой можно внутри React задавать тайтл страницы и мета-теги прямо из компонент. Обычно helmet используется в компонентах-страницах:

```jsx
<Helmet>
    <title>Home page</title>
    <meta
        name="description"
        content="Buy awesome snickers" />
</Helmet>
```

В проекте для удобства создан компонент враппер [PageMeta](https://github.com/noveogroup-amorgunov/react-ssr-tutorial/blob/master/src/components/PageMeta/PageMeta.tsx), в котором создаются как стандартные теги, так и для социальных сетей.

Процесс подключения на стороне сервера [описан в документации](https://github.com/nfl/react-helmet#server-usage) и он довольно простой. После добавления мета-тегов на компоненты-страницы, на сервере нужно воспользоваться методом `Helmet.renderStatic()`, который вернет все метатеги и вставить их в html-заготовку:

<div class="code-path">./src/server-render-middleware.tsx</div>

```diff
+ import Helmet, { HelmetData } from 'react-helmet';
// ...
const reactHtml = renderToString(jsx);
const reduxState = store.getState();
+ const helmetData = Helmet.renderStatic();

- res.send(getHtml(reactHtml, reduxState));
+ res.send(getHtml(reactHtml, reduxState, helmetData));

// ...

- function getHtml(reactHtml: string, reduxState = {}, helmetData: HelmetData) {
+ function getHtml(reactHtml: string, reduxState = {}, helmetData: HelmetData) {
    // ...
-   <title>Sneakers shop</title>
    <link href="/main.css" rel="stylesheet">
+   ${helmetData.title.toString()}
+   ${helmetData.meta.toString()}
```

Теперь страницы будут понятны поисковикам и ботам для шаринга в социальных сетях:

<img
  class="lazyload"
  alt="Мета теги в разметке"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/6.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/6.jpg"
/>

Далее мы настроим подгрузку данных на сервере и вот так страница будет отображаться в превью телеграма:

<img
  class="lazyload"
  alt="Превью проекта в телеграме"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/7.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/7.jpg"
/>

## Шаг 4. Saga/Thunk и асинхронная подгрузка данных

Ветка в *Github* по результатам этой части: https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/04-add-redux-saga-and-async-data

### Redux-saga

Вы можете пропустить этот раздел, если используете что-то другое. Саги, построенные на генераторах, нужны для работы с асинхронными вещами, с которыми обычный редакс не работает. Одни из самых частых асинхронных операций в приложении - это отправка запросов в API за данными - как раз наш случай.

На клиенте сага запускается в фоновом режиме и "бесконечно крутится", слушая события из редакса (живет своей жизнью, отдельной от реакт приложения). На сервере же у нас нет такой возможности, нам нужно загрузить данные и поскорее отправить ответ клиенту.

Для остановки саги есть специальный экшен `END`. Самое классное, что сага сперва обработает все запущенные операции, и только после закончит выполнение. Процесс работы выглядит следующим образом: запускаем сагу на сервере, скармливаем ей экшены, после диспатчим `END` и ждем, пока сага завершит выполнение. Посмотрим, как будет выглядеть в коде.

Добавим тип `AppStore`, в котором опишем два метода (для запуска и остановки саги):

<div class="code-path">./src/types/redux.ts</div>

```ts
import { Store } from 'redux';
import { SagaMiddleware } from '@redux-saga/core';

export type AppStore = Store & {
    runSaga: SagaMiddleware['run'];
    close: () => void;
};
```

И добавим методы в объект стора:

<div class="code-path">./src/store/rootStore.ts</div>

```diff
+ import createSagaMiddleware, { END, SagaMiddleware } from 'redux-saga';

const store = createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
- );
+ ) as AppStore;

+ // Методы для использования на сервере
+ store.runSaga = sagaMiddleware.run;
+ store.close = () => store.dispatch(END);
```

Запустим сагу на сервере. Все, что было в миддлеваре для рендеринга перенесем в метод `renderApp`, который будем вызывать после того, как отработает сага.

<div class="code-path">./src/server-render-middleware.tsx</div>

```diff
+ import rootSaga from './store/rootSaga';

export default (req: Request, res: Response) => {
    const location = req.url;
    const context: StaticRouterContext = {};
    const { store } = configureStore(getInitialState(location), location);

+    function renderApp() {
+       // (5)
        const jsx = (
            <ReduxProvider store={store}>
                <StaticRouter context={context} location={location}>
                    <App />
                </StaticRouter>
            </ReduxProvider>
        );
        const reactHtml = renderToString(jsx);
        const reduxState = store.getState();
        const helmetData = Helmet.renderStatic();
    
        if (context.url) {
            res.redirect(context.url);
            return;
        }
    
        res.status(context.statusCode || 200).send(
            getHtml(reactHtml, reduxState, helmetData)
        );
+    }

+    // (1)
+    store 
+        .runSaga(rootSaga)
+        .toPromise()
+        // (4)
+        .then(() => renderApp())
+        .catch(err => { throw err; });

+    // (2)
+    // TODO: Добавить все асинхронные вещи в массив dataRequirements
+    const dataRequirements: (Promise<void> | void)[] = [];

+    // Когда все асинхронные экшены будут закончены
+    // вызываем экшен для закрытия саги

+    // (3)
+    return Promise.all(dataRequirements)
+        .then(() => store.close())
+        .catch(err => { throw err; });
};
```

Разберем все по шагам:

1. Запускаем сагу с помощью `store.runSaga(rootSaga).toPromise()`. Промис зарезолвится тогда, когда сага получит экшен END и обработает все текущие запущенные генераторы.

2. Собираем в массив функции, которые выполняют какую-то асинхронную работу (далее мы в этом месте будем подгружать данные с API для конкретной страницы).

3. Ждем пока зарезолвятся все промисы из массива выше. Это действие не нужно для саги (он нужен для _redux-thunk_), так как для нее достаточно просто задиспатчить синхронный экнеш. После диспачим экшен `END`.

4. Вызываем функцию `renderApp`. На данном этапе стор уже заполнен данными, осталось отрендерить приложение.

### Асинхронная подгрузка данных

Сага настроена, теперь самый интересный шаг. Для каждой (почти) страницы необходимо подгружать данные. Другими словами в зависимости от текущего роута делать запрос в API энпоинты, чтобы заполнить стор. Соберем все требования в пункты:

- Нужно перед рендером заполнить стор данными;
- Данные зависят от текущей страницы;
- Данные загружаются с помощью redux-saga/thunk;
- На клиенте не загружать данные повторно.

Вынесем роуты в отдельный файл. Сравнивая path с текущим адресом страницы мы сможем определить нужный компонент, который необходимо отрендерить:

<div class="code-path">./src/routes.ts</div>

```ts
import { fetchCatalog } from 'store/ducks/catalog/actions';
import { fetchHomepage } from 'store/ducks/homepage/actions';
import { fetchShoes } from 'store/ducks/shoes/actions';
import { AppRouterProps } from 'types';

import CatalogPage from 'pages/Catalog/Catalog';
import UpcomingPage from 'pages/Upcoming/Upcoming';
import SneakersPage from 'pages/Sneakers/Sneakers';
import HomePage from 'pages/Home/Home';
import NotFoundPage from 'pages/404/404';

export default [
    {
        path: '/',
        component: HomePage,
        exact: true,
    },
    {
        path: '/catalog',
        component: CatalogPage,
        exact: true,
    },
    {
        path: '/sneakers/:slug',
        component: SneakersPage,
        exact: true,
    },
    {
        path: '/upcoming',
        component: UpcomingPage,
        exact: true,
    },
    {
        path: '*',
        component: NotFoundPage,
        exact: true,
    },
];
```

Добавим в каждый роут, которому нужны данные с сервера, метод `fetchData` (название можно выбрать любое), в котором, в случае саги достаточно просто диспатчить необходимые экшены, в случае с _redux-thunk_ - возвращать промисы:

<div class="code-path">./src/routes.ts</div>

```diff
export default [
    {
        path: '/',
        component: HomePage,
        exact: true,
+       fetchData({ dispatch }: RouterFetchDataArgs) {
+         dispatch(fetchHomepage());
+       },
    },
    {
        path: '/catalog',
        component: CatalogPage,
        exact: true,
+       fetchData({ dispatch }: RouterFetchDataArgs) {
+           dispatch(fetchCatalog());
+       },
    },
    {
        path: '/sneakers/:slug',
        component: SneakersPage,
        exact: true,
+       fetchData({ dispatch, match }: RouterFetchDataArgs) {
+           dispatch(fetchShoes(match.params.slug));
+           dispatch(fetchHomepage());
+       },
    },
    {
        path: '/upcoming',
        component: UpcomingPage,
        exact: true,
    },
    {
        path: '*',
        component: NotFoundPage,
        exact: true,
    },
];
```

Помимо `dispatch`, метод `fetchData` так же принимает объект роута `match`, так как информация из него тоже необходима, чтобы понимать, что загружать (например, `match.params.slug` используется для получения slug-a из url). Опишем тип `RouterFetchDataArgs` - аргументы этого метода:

<div class="code-path">./src/types/index.ts</div>

```ts
export type RouterFetchDataArgs = {
    dispatch: Dispatch<ReduxAction>;
    match: match<{ slug: string }>;
};
```

И исправим рендеринг роутов в `App.tsx`:

<div class="code-path">./src/routes.ts</div>

```diff
function App() {
    return (
        <div className="app">
            <Header />
            <Switch>
-                <Route path="/" component={HomePage} exact />
-                <Route path="/catalog" component={CatalogPage} exact />
-                <Route path="/sneakers/:slug" component={SneakersPage} exact />
-                <Route path="/upcoming" component={UpcomingPage} exact />
-                <Route path="*" component={NotFoundPage} exact />
+                {routes.map(({ fetchData, ...routeProps }) => (
+                    <Route key={routeProps.path} {...routeProps} />
+                ))}
            </Switch>
            <Footer />
        </div>
    );
}
```

Дело осталось за малым - вызывать этот метод соответствующего роута перед рендером приложения. На самом деле это тот момент, который открыл мне глаза, как вообще работает Server-side-rendering и если бы объем статьи нужно было уменьшить до минимума, этот фрагмент кода там точно был бы:

<div class="code-path">./src/server-render-middleware.tsx</div>

```ts
const dataRequirements: (Promise<void> | void)[] = [];

routes.some(route => {
    const { fetchData: fetchMethod } = route;
    const match = matchPath<{ slug: string }>(
        url.parse(location).pathname,
        route
    );

    if (match && fetchMethod) {
        dataRequirements.push(
            fetchMethod({
                dispatch: store.dispatch,
                match,
            })
        );
    }

    return Boolean(match);
});
```

Что происходит? Обходим все роуты из массива и с помощью `matchPath` из `react-router` определяем, соответствует ли они текущему адресу страницы. Если роут соответствует текущему пути и метод `fetchData` присутствует, складываем в массив `dataRequirements` вызов метода, а в качестве параметров передаем `dispatch` и `match`.

И если нужный роут найден, то выходим из цикла (имитируем работу _react-router-a_). Далее уже все написано - ждем, пока вся асинхронщина из `dataRequirements` выполнится и запускаем рендеринг приложения.

На сервере не отрабатывает многие методы жизненного цикла компонента, потому что реального монтирование в dom дерево не происходит. 
На клиенте мы можем этим воспользоваться и проверять, если у нас список с данными не пуст, значит он уже загружен и нет смысла фетчить еще раз:


```ts
// На сервере не вызывается
componentDidMount() {
    const { data, fetchHomepage } = this.props;

    if (!data.popular.length) {
        fetchHomepage();
    }
}
```

или в случае с функциональными компонентами:

```ts
// На сервере не вызывается
React.useEffect(() => {
    if (!data.popular.length) {
        fetchHomepage();
    }
}, []);
```

Посмотрим, как это работает:

<img
  class="lazyload"
  alt="Работа приложения в режиме SSR"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/12.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/12.gif"
/>

Если вам кажется, что ничего не происходит, то присмотритесь - я обновляю страницу в левом верхнем углу. После обновления страницы на клиенте уже отрендеренная версия страницы (поэтому кажется, что ничего не меняется), после перехода на другую страницу она начинает загружаться на клиенте. Если посмотреть на процесс загрузки, то после того, как сервер отдал html, то пользователь сразу увидит весь контент:

<img
  class="lazyload"
  alt="Процесс загрузки приложения в режиме SSR"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/10.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/10.jpg"
/>

Без SSR следующая картина: пользователь получает быстрее html (но пустую), потом инициализируется реакт и пользователь видит заглушки (какой-нибудь лоадер в общем случае), и только после получения данных получает страницу с контентом:

<img
  class="lazyload"
  alt="Процесс загрузки приложения без SSR"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/8.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/8.jpg"
/>

И давайте еще посмотрим на метрику _Performance_ в Lighthouse:

#### До SSR

<img
  class="lazyload"
  alt="Метрика Performance без SSR"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/13.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/13.jpg"
/>

#### C SSR

<img
  class="lazyload"
  alt="Метрика Performance с SSR"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/14.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/14.jpg"
/>

Метрика поднялась с 87 баллов до 96 баллов, а это очень хороший результат для приложения (хоть и такого маленького) на реакте.

Мы проделали большую работу, но это еще не все. Есть еще один интересный момент, который нельзя обойти стороной - _Code splitting_.

## Шаг 5. Code splitting и Prefetch

Ветка в *Github* по результатам этой части: https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/05-add-code-splitting

Даже у такого небольшого приложения продакшен бандл будет иметь внушительный объем - 1.32 МБ не в сжатом виде (155 КБ в Gzipped):

<img
  class="lazyload"
  alt="Из чего состоит бандл"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/15.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/15.jpg"
/>

Для ее решения нужно разбить бандл на несколько небольших. _Code splitting_ (дословно, _разделение кода_) как раз про это. Когда пользователь запрашивает страницу, браузер будет загружать только нужные части, а остальные подгружать по необходимости, тем самым можно очень сильно уменьшить первоначальный размер загружаемых ресурсов.

В _React 16_ появился [механизм Lazy и Suspense](https://ru.reactjs.org/docs/code-splitting.html#reactlazy), который позволяет делать ленивые компоненты, но только на клиенте. На сервере не все так просто: необходимо отрендерить все компоненты, даже которые будут ленивыми, и составить список ресурсов, которые нужно предзагрузить клиенту; и это нужно сделать до гидрации приложения (так как если нужные части не будут подгружены, то нечего будет показывать).

Механизм доступен в вебпак из коробки (отдельные бандлы называются чанками), а с помощью плагина [plugin-syntax-dynamic-import](https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import) можно делать асинхронные чанки, которые подгружаются по мере необходимости. Например, для json-моков в текущем проекте были добавлены динамические импорты, и их код автоматически будет вынесен в отдельные бандлы:

```diff
- import mock from './mock.json';

// Emulate api request
export const fetchCatalog = () =>
    timeout(500)
-        .then(() => mock)
+        .then(() => import('./mock.json'));
```

### DLL Plugin

На одном из рабочих проектов мы решили не внедрять _Code splitting_, но использовали [DLL плагин](https://webpack.js.org/plugins/dll-plugin/), который позволяет вынести внешние зависимости (типа, _React_, список нужно указать самому) в отдельный бандл. Почти бесплатно получаем профит:

- **Ускорение сборки**, которое достигается за счет того, что внешние зависимости можно собрать один раз перед сборкой;
- **Ускорение загрузки страниц**, так как в процессе разработки собирается только ваш код, а бандл с внешними зависимостями лежит в кеше браузера пользователя (обновляется только при обновлении самих зависимостей).

На рабочем проекте получилось два бандла (vendor бандл и с кодом проекта), которые выглядят следующим образом:

<img
  class="lazyload"
  alt="Бандлы с DLL плагином"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/16.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/16.jpg"
/>

Но в наше приложение с кроссовками я не мог не попробовать внедрить честный _Code splitting_, что мы и сделаем далее.

### Loadable components

Есть _React_ есть два популярных решения, _react-loadable_ и [_loadable-components_](https://loadable-components.com/), но первое из них - уже пару лет не поддерживается, поэтому его использовать я не советую. Да и в официальной документации реакта советуют использовать именно вторую библиотеку (ее мы и интегрируем). Шагов будет много, но все они довольно просты.

Установим зависимости:

```bash
npm i --save @loadable/component @loadable/server
npm i --save-dev @loadable/babel-plugin @loadable/webpack-plugin @types/loadable__component @types/loadable__server @types/loadable__webpack-plugin
```

Подключим библиотеку в `.babelrc` и `webpack/client.config.ts`

<div class="code-path">./babelrc</div>

```diff
{
    "presets": [],
    "plugins": [
        "react-hot-loader/babel",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-syntax-dynamic-import",
+        "@loadable/babel-plugin"
    ]
}
```

<div class="code-path">./webpack/client.config.ts</div>

```diff
+ import LoadablePlugin from '@loadable/webpack-plugin';

plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    !IS_DEV && new CompressionPlugin(),
+   new LoadablePlugin(),
].filter(Boolean) as Plugin[],
```

Обернем все импорты компонент-страниц в `loadable` (на самом деле можно оборачивать импорты любых компонентов):

<div class="code-path">./src/routes.ts</div>

```diff
+ import loadable from '@loadable/component';

- import CatalogPage from 'pages/Catalog/Catalog';
- import UpcomingPage from 'pages/Upcoming/Upcoming';
- import SneakersPage from 'pages/Sneakers/Sneakers';
- import HomePage from 'pages/Home/Home';
- import NotFoundPage from 'pages/404/404';
+ const CatalogPage = loadable(() => import('./pages/Catalog/Catalog'));
+ const UpcomingPage = loadable(() => import('./pages/Upcoming/Upcoming'));
+ const SneakersPage = loadable(() => import('./pages/Sneakers/Sneakers'));
+ const HomePage = loadable(() => import('./pages/Home/Home'));
+ const NotFoundPage = loadable(() => import('./pages/404/404'));
```

На клиенте перед рендером необходимо подождать, пока загрузятся все чанки и это можно сделать с помощью функции `loadableReady`:

<div class="code-path">./src/client.tsx</div>

```diff
+ import { loadableReady } from '@loadable/component';

+ loadableReady(() => {
    hydrate(
        <ReduxProvider store={store}>
            <ConnectedRouter history={history}>
                <App />
            </ConnectedRouter>
        </ReduxProvider>,
        document.getElementById('mount')
    );
+ });
```

Как же функция понимает, какие именно бандлы необходимо подгружать? На сервере рендерится полное приложение без лайзи модулей, и `loadable-components` собирает информацию, какие компоненты были отрендерены. Далее с помощью файла `loadable-stats.json` (который генерируется при сборке), хранящем в себе дерево зависимостей компонентов и чанков, определяется, какие бандлы будут добавлены в html-страницу, отдаваемую клиенту. Опишем это в коде:

<div class="code-path">./src/server-render-middleware.tsx</div>

```diff
+ import path from 'path';
+ import { ChunkExtractor } from '@loadable/server';

// ...

function renderApp() {
+    const statsFile = path.resolve('./dist/loadable-stats.json');
+    const chunkExtractor = new ChunkExtractor({ statsFile });

-    const jsx = (
+    const jsx = chunkExtractor.collectChunks(
        <ReduxProvider store={store}>
            <StaticRouter context={context} location={location}>
                <App />

// ...

res.status(context.statusCode || 200).send(
-    getHtml(reactHtml, reduxState, helmetData)
+    getHtml(reactHtml, reduxState, helmetData, chunkExtractor)
```

`chunkExtractor` будет содержать всю информацию о js и ccs-файлах, которые необходимо подключить. Поэтому вместо явного указания файлов, используем информацию из этой переменной:

<div class="code-path">./src/server-render-middleware.tsx</div>

```diff
function getHtml(
    reactHtml: string,
    reduxState = {},
    helmetData: HelmetData,
+    chunkExtractor: ChunkExtractor
) {
+    const scriptTags = chunkExtractor.getScriptTags();
+    const linkTags = chunkExtractor.getLinkTags();
+    const styleTags = chunkExtractor.getStyleTags();

// ...

-   <link href="/main.css" rel="stylesheet">
    ${helmetData.title.toString()}
    ${helmetData.meta.toString()}
+   ${linkTags}
+   ${styleTags}

// ...

-    <script src="/main.js"></script>
+    ${scriptTags}
```

Посмотрим, что выдаст `webpack-bundle-analyzer`:

<img
  class="lazyload"
  alt="Из чего состоит разделенный бандл"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/17.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/17.jpg"
/>

Сейчас у нас приложение разбито на чанки, главный чанк, два чанка с замоканными данными и небольшие бандлы с компоненты для каждой из страниц. Мы получили то, что и хотели изначально. Стоит заметить, что если один код используется на разных страницах, то он будет вынесен в общий дополнительный бандл.

Библиотека предоставляет возможность предзагружать бандлы с помощью метода `preload`. Например, при наведении мышкой на ссылку загружать нужный компонент. Давайте сделаем это:

```diff
+ import loadable from '@loadable/component';

+ const menu = [
+    { to: '/', exact: true, page: PageName.Home },
+    { to: '/catalog', exact: true, page: PageName.Catalog },
+    { to: '/upcoming', exact: true, page: PageName.Upcoming },
+ ];

+ const preloadPage = (pageName: string) =>
+     loadable(() => import(`../../pages/${pageName}/${pageName}`));

export function Header() {
    // ...
    <NavLink
        activeClassName="header__nav-item_active"
        to={data.to}
        className={b('nav-item')}
+        onMouseMove={() => preloadPage(data.page).preload()}
    >
        {data.page}
    </NavLink>
```

Результат:

<img
  class="lazyload"
  alt="Подгрузка бандлов"
  src="/assets/images/2020-12-08-server-side-rendering-in-react/18.min.jpg"
  data-src="/assets/images/2020-12-08-server-side-rendering-in-react/18.gif"
/>

Как вы можете видеть, при наведении на ссылки в шапке сайта автоматически подгружаются бандлы для этих страниц. Можно пойти дальше и интегрировать библиотеку https://guess-js.github.io/, которая на основе машинного обучения и собранной аналитики google определяет, куда сейчас будет переходить пользователь и сама подгружает нужные бандлы.

Финальный результат можно посмотреть здесь: [https://react-ssr-tutorial.herokuapp.com/](https://react-ssr-tutorial.herokuapp.com/).

## Заключение

Вот и подошла к концу сегодняшняя история, мы собрали полностью работающие приложение на React с интегрированным Server side рендерингом. Мне в свое время потребовалось перечитать огромное количество источников, чтобы разобраться в теме. Поэтому надеюсь, что после прочтения материала у вас не только появилось общее представление, но и понимания конкретных шагов по интеграции.

У приложений c SSR есть как очевидные преимущества (SEO, sharing, лучшие метрики по перфомансу и UX), так и недостатки (обслуживание сервера, усложнение логики приложения и сборки, проблемы на сервере при повышенной нагрузке, не изоморфный код и т.д.), но попробовать его определенно стоит.

На самом деле есть еще много всего интересного, что мы не успели рассмотреть: настройка hot-reload, оптимизация производительности, проблемы при больших нагрузках и потоковый стриминг, css-modules и многое другое осталось за скопом этого поста. Но если вы хотите продолжения, то дайте знать (написав под постом в телеграмме, или просто оставив реакцию чуть ниже).
