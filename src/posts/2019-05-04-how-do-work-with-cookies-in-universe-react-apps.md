---
title: "Работа с cookies в универсальных приложениях на react"
date: 2019-05-04
time: 9
description: "Принцип работы с cookies (куками) в универсальных приложениях на react"
tags:
  - react
  - server side rendering
  - cookies
  - hooks
  - tutorial
layout: layouts/post.njk
likes: 40
---

Сейчас идет эра клиентских веб-приложений. React, Vue, Angular и другие подобные фреймворки захватили веб. Очень многие проекты, где есть логика на стороне клиента, а она есть чуть ли не на каждом сайте, начинают писаться именно с использованием данных решений.

И тут появляются проблемы: у таких проектов все плохо с SEO/шарингами и показателями скорости загрузки (например, *First meaningful paint*). Но... но есть серебряная пуля - использовать универсальные приложения, которые используют одну кодовую базу и могут рендерится на сервере (для роботов всегда, для пользователей при полном обновлении страницы) и на клиенте (для пользователей при навигации). Но как мы знаем, серебряной пули нет - «No Silver Bullet», такие приложения усложняют кодовую базу и добавляют свои проблемы и ограничения. Об одной из них мы сегодня и поговорим, а именно о реализации кода, который не может выполняться на сервере и клиенте одновременно.

> **Универсальные приложения** (еще их называют изоморфными) - это приложения, которые могут выполняться как на сервере, так и на клиенте.

*React* - это библиотека для построения UI, все мы это знаем. Он написан на Javascript + jsx (который тоже транспилируется в Javascript). Код, написанный на нем, можно запускать везде, где есть Javascript. Следовательно, с помощью React-а можно делать универсальные приложения.

На клиенте используется библиотека `react-dom`, которая строит DOM-дерево из React компонентов с помощью методов `render()` и `hydrate()`. А на сервере (в Nodejs) - `react-dom/server` и метод `renderToString()` (есть и другие, но в рамках этой статьи мы их рассматривать не будем), который из React компонентов формирует HTML-строку.

```js
import { renderToString } from 'react-dom/server';
import App from './components/App';

renderToString(<App />);
```

При интеграции **рендеринга приложения на стороне сервера** (*server side rendering* или *SSR*) возникает проблема «не универсального» кода. На сервере можно выполнить не весь код, который выполняется на клиенте. На сервере нет объектов `window` и `document`, нет `localstorage`. Если в приложении что-то хранится в `localstorage`, то эти данные будут не доступны на сервере. Где же теперь хранить данные, которые должны быть доступны как в браузере, так и в nodejs?

> Отмечу, что при работе с SSR у нас есть две разные точки входа в приложение, одна из которых запускается на сервере, другая - на клиенте.

Думаю по заголовку вы уже догадались где - эти данные нужно хранить в куках, которые доступны и в браузере, и на сервере. На сервере куки можно достать из заголовков (или использовать `cookie-parser` и доставать объект из `req.cookies`), на клиенте куки доступны в `document.cookie`. Главный вопрос - как правильно организовать работу с ними.

---

Прежде чем перейти к реализации, давайте посмотрим, как нам нужно работать с роутером. Почему с ним? Потому что он тоже имеет «не универсальную» составляющую.

На клиенте у роутера есть состояние, мы всегда можем вернуться, нажав на стрелку «Назад» или перейти вперед. Под капотом роутер использует [history api](https://developer.mozilla.org/en-US/docs/Web/API/History_API). Все довольно просто:

```js
// src/entry-client.jsx

import { BrowserRouter as RouterProvider } from 'react-router-dom';

ReactDOM.hydrate(
  <RouterProvider>
    <App />
  </RouterProvider>,
  document.getElementById('mount')
);
```

На сервере же роутер stateless (без состояния). Основная идея заключается в том, что мы оборачиваем приложение в `<StaticRouter>`, у которого нет состояния, вместо `<BrowserRouter>`. <span class="highlight">Мы явно передаем в роутер-провайдер URL-адрес страницы, чтобы приложение определило, какую страницу необходимо отрендерить</span>:

```js
// src/entry-server.jsx

renderToString(
  <StaticRouter location={req.url} context={context}>
    <App />
  </StaticRouter>
);
```

Роутер хранит текущий путь в контексте. Если в коде нам нужно получить текущий location, мы можем использовать HOC `withRouter`, который извлечет из контекста нужные данные, и не важно где будет выполняться приложение:

```js
function Header(props) {
  return (
    <div>
      Current location: {props.location}
    </div>
  );
}

export default withRouter(Header);
```

Если вы не разу не работали с контекстом, советую почитать [официальную документацию](https://ru.reactjs.org/docs/context.html), в которой довольно хорошо описано, как его использовать. Тем более в React 16 появился новый приятный интерфейс для работы с ним. В двух словах, оборачиваем приложение в провайдер, хранящий в памяти какие-то данные, а с помощью HOC компонент `withX` достаем эти данные и прокидываем пропсами в обернутый компонент.

Так же работают и другие библиотеки, которые имеют «не универсальные» зависимости. Логика выносится в провайдеры, каждый из которых может подготавливать данные в своей среде с одинаковым абстрактным интерфейсом.

## Реализация провайдера для работы с куками на клиенте


Если хотите воспроизвести все шаги, описанные далее, то склонируйте репозиторий (ветка *tutorial*) и установите зависимости:

```bash
git clone -b tutorial git@github.com:noveogroup-amorgunov/react-ssr-use-cookie.git
cd react-ssr-use-cookie
npm i
```

При запуске приложения `npm run dev` по адресу [http://localhost:9001](http://localhost:9001) вы увидите заголовок «Hello world».

Готовое приложение вы можете посмотреть на гитхабе: [noveogroup-amorgunov/react-ssr-use-cookie](https://github.com/noveogroup-amorgunov/react-ssr-use-cookie), а ниже мы рассмотрим основные моменты реализации. Сначала сделаем работу с куками на стороне клиента, потом - на стороне сервера.

Начнем с написания сервиса (далее я буду называть его менеджером) для работы с куками без привязки к реакту. Куки хранятся в виде строки, разделенной точкой c запятой. Куки можно посмотреть в devtools на вкладке application:

<img
  class="lazyload"
  alt="Куки на домене amorgunov.com"
  src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/1.min.png"
  data-src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/1.png"
/>

Полную реализацию методов можно посмотреть на [гитхабе](https://github.com/noveogroup-amorgunov/react-ssr-use-cookie/blob/master/src/services/cookie/ClientManager.js), сейчас просто важно описать интерфейс, который будет использоваться (все методы взаимодействуют с `document.cookie`).

```js
// src/services/cookie/ClientManager.js

export default class ClientManager {
    get(name) {}
    getAll() {}
    set(name, value = '', days = 30) {}
}
```

Все довольно просто, есть методы для получения куки по имени, всех кук и добавления новой куки.

Далее создадим контекст. В него мы поместим Manager для работы с куками (на клиенте, реализованный выше, на сервере - который реализуем ниже). Используя context, мы сможем получать значения кук в любом компоненте:

```js
// src/services/cookie/Context.js

import React from 'react';

const CookiesContext = React.createContext('cookies');

export default CookiesContext;
```

Теперь создадим Provider, в который обернем наше приложение:

```js
// src/services/cookie/CookiesProvider.js

import React, { Component } from 'react';
import { Provider } from './Context';
import ClientManager from './ClientManager';

export default class CookiesProvider extends Component {
    static defaultProps = {
        manager: new ClientManager()
    };

    render() {
        const { manager, children } = this.props;

        return (
            <Provider value={manager}>
                {children}
            </Provider>
        );
    }
}
```

Как я и говорил ранее, тут мы оборачиваем дочерний компонент в контекст, хранящий manager по работе с куками. По умолчанию это будет экземпляр класса, написанного нами выше.

Осталось совсем немного, а именно написать HOC `withCookies`, который будет предоставлять компоненту объект с куками и метод для установки значения:

```js
// src/services/cookie/withCookies.js

import React, { Component } from 'react';
import CookiesContext from './Context';

export default function withCookies(ComposedComponent) {
    const name = ComposedComponent.displayName || ComposedComponent.name;

    return class extends Component {
        static displayName = `withCookies(${name})`;

        render() {
            return (
                <CookiesContext.Consumer>
                    {manager => (
                        <ComposedComponent
                            cookies={manager.getAll()}
                            setCookie={manager.set.bind(manager)}
                            {...this.props} />
                    )}
                </CookiesContext.Consumer>
            );
        }
    };
}
```

Из интересного тут передача в компонент пропсов `cookies` и `setCookie`, все остальное - типичный пример работы с high order components. Свойство `displayName` мы задаем для красивого отображения названия компонента в react devtools:

<img
  class="lazyload"
  alt="Дерево компонентов в react devtools"
  src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/2.min.png"
  data-src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/2.png"
/>

Как видно по изображению, в компоненте, обернутом в `withCookies` у нас доступны ожидаемые пропсы, и HOC враппер имеет нужное имя.

Осталось только все экспортировать:

```js
// src/services/cookie/index.js

import CookiesProvider from './CookiesProvider';
import ServerCookiesManager from './ServerManager';
import withCookies from './withCookies';

export {
    CookiesProvider,
    ServerCookiesManager,
    withCookies
};
```

## Пример использования

Самый типичный пример, что можно хранить в куках, это соглашение об использовании кук :) Думаю вы постоянно встречаете подобный на многих сайтах. Обернем наше приложение в CookiesProvider:

```diff
// src/entry-client.jsx

+ import { CookiesProvider } from './services/cookies';

ReactDOM.hydrate(
+  <CookiesProvider>
    <App />
+  </CookiesProvider>,
  document.getElementById('mount')
);
```

И создадим компонент с кнопкой, при нажатии на которую пользовать согласен на использование кук:

```js
import React from 'react';
import { withCookies } from '../services/cookie';

const COOKIE_KEY = 'notification';

function CookiesNotification(props) {
    // Пропсы из withCookies
    const { cookies, setCookie } = props;

    // если кука есть, то просто не рендерим кнопку
    if (cookies[COOKIE_KEY]) {
        return null;
    }

    return	(
        <button	onClick={() => setCookie(COOKIE_KEY, true)}>
            Accept use cookie
        </button>
    );
}

export default withCookies(CookiesNotification);
```

При нажатии на кнопку мы сетим куку:

<img
  class="lazyload"
  alt="Куки notification нет, кнопка отображается"
  src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/4.min.png"
  data-src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/4.png"
/>
<div class="image-text">Куки notification нет, кнопка отображается</div>

Если пользователь уже нажимал кнопку ранее (кука есть), то не показываем кнопку вообще:

<img
  class="lazyload"
  alt="Кука notification есть, кнопка не отрендерена"
  src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/5.min.png"
  data-src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/5.png"
/>
<div class="image-text">Кука notification есть, кнопка не отрендерена</div>

## Серверная часть

Если мы будет использовать такой модуль при работе с SSR, то получим ошибку:

<img
  class="lazyload"
  alt="Ошибка в nodejs что document is not defined"
  src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/3.min.png"
  data-src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/3.png"
/>

На самом деле все верно, на сервере нет глобального объекта `document`. Нам нужен свой менеджер, который будет работать с куками на сервере. Для начала необходимо подключить `cookie-parser`, который позволяет более удобно работать с куками (не с строкой из заголовков, а с js-объектом):

```js
// src/entry-server.jsx

app
    .use(cookieParser())
    .use(render);

function render(req, res) {
    // Передаем req и res в менеджер для работы с куками на сервере
    const cookieManager = new ServerCookiesManager(req, res);

    const jsx = (
        <CookiesProvider manager={cookieManager}>
            <App />
        </CookiesProvider>
    );

    // ...
}
```

Теперь напишем сам менеджер:

```js
// src/services/cookie/ServerManager.js

export default class ServerManager {
    constructor(req, res) {
        this._req = req;
        this._res = res;
    }

    get(name) {
        return this._req.cookies[name];
    }

    getAll() {
        return this._req.cookies;
    }

    set(name, value, days = 30) {
        const maxAge = days*24*60*60*1000;

        this._res.cookie(name, value, { maxAge });
    }
}
```

Теперь когда пользователь будет делать запрос, приложение на сервере будет использовать `ServerManager`, а потом на клиенте уже `ClientManager`.

## Пишем свой hook

Хайп, все дела, написать какой-то модуль для работы в реакте, но не написать свой хук, выглядит странно. Подробнее про хуки опять же можно найти [в документации](https://reactjs.org/docs/hooks-intro.html). Хук useCookies очень похож на хук useState - есть некое значение и метод для его установки, только тут мы работает не с внутренним стейтом компонента.

Сам hook будет выглядеть очень простым:

```js
// src/services/cookie/useCookies.js

import { useContext } from 'react';
import CookiesContext from './Context';

export default function useCookies(name)	{
    // С помощью хука useContext вытаскиваем менеджер из контекста
    const manager = useContext(CookiesContext);

    // Если менеджера нет, то кидаем исключение
    if (!manager) {
        throw new Error('Missing <CookiesProvider>');
    }

    // Если в аргументах передали название куки, то возвращаем ее значение
    // И метод для установки значения для куки с переданным названием
    if (name) {
        return [manager.get(name), manager.set.bind(manager, name)];
    }

    // Иначе возвращаем объект со всеми куками
    return [manager.getAll(), manager.set.bind(manager)];
}
```

И пример использования:

```js
export default function CookiesNotification() {
    const [cookie, setCookie] = useCookies('notification');

    if (cookie) {
        return null;
    }

    return	(
        <button	onClick={() => setCookie(true)}>
            Accept use cookie
        </button>
    );
}
```

В итоге у нас получится целый модуль для работы с куками в реакте:

<img
  class="lazyload"
  alt="Структура файлов модуля для работы с куками"
  src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/6.min.png"
  data-src="/assets/images/2019-05-04-how-do-work-with-cookies-in-universe-react-apps/6.png"
/>

На самом деле его можно улучшать и улучшать, например добавить возможность подписываться на изменения значений кук или покрыть код тестами. И подобная логика уже есть в библиотеке [react-cookie](https://github.com/reactivestack/cookies/tree/master/packages/react-cookie), которая по реализации очень похожа на нашу. Поэтому в продакшен проектах рекомендую именно ее.

Не смотря на название статьи, целью этой статьи было показать реальный процесс работы с «не универсальным» кодом, а куки - просто хороший пример. Основная идея - написать провайдер (абстракцию) так, что бы само приложение оставалось изоморфным, и не городить кучу if-ов с условиями `isServer` и `isClient`.

Надеюсь, было интересно, до скорого!
