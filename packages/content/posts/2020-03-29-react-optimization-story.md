---
title: "История одной оптимизации React приложения"
date: 2020-03-29
time: 7
featuredImageThumbnail: "/assets/images/2020-03-29-react-optimization-story/preview.jpg"
description: "Рассмотрим как оптимизировать React приложения на реальном примере"
tags:
  - react
  - javascript
  - devtools
  - optimization
layout: layouts/post.hbs
likes: 16
---
В настоящий момент я работаю над внутренним проектом для создания промо-страниц, который активно развивается и растет. Огромное количество собранных промо-страниц и целых сайтов, куча сэкономленных человеко-часов на разработку промок, которые собираются с помощью нашего конструктора, и огромная кодовая база. Несмотря на высокий уровень и профессиональный подход разработчиков, код ревью и современные технологии, в быстрорастущих проектах возникают проблемы из-за не всегда оптимальных архитектурных подходов, а порой из-за небольших локальных решений, которые изначально кажутся вполне логичными.

Недавно в работу мне попала несложная на первый взгляд задача: нужно было сделать поисковый инпут с возможностью фильтрации элементов без сложной логики, запросов к API - в общем ничего не предвещало беды. На реализацию фичи у меня ушло не больше одного дня и вот что получилось:

<img
    class="lazyload"
    alt="Результат работы поискового инпута"
    src="/assets/images/2020-03-29-react-optimization-story/0.min.png"
    data-src="/assets/images/2020-03-29-react-optimization-story/0.gif">

И нет, анимация не тормозит, как могло показаться изначально - после ввода символа в инпуте все зависало на несколько секунд, включая сам инпут и вообще весь интерфейс. Это точно не обрадует наших пользователей, нужно исправлять. Поехали.

## Get started

Начать хочу со статьи из официальной документации React, в которой собраны [полезные базовые советы по оптимизации приложений](https://ru.reactjs.org/docs/optimizing-performance.html) (в конце материла вы найдете еще парочку полезных ссылок по теме).

Основной инструмент, который мы сегодня будем использовать для анализа производительности, это вкладка «Performance» в DevTools браузера Chrome. В режиме разработки он позволяет отслеживать, как компоненты монтируются и обновляются, используя *flame graphs*. *Flame graphs* - это такой способ визуализации процессорного времени, потраченного на выполнение функций.

Чтобы воспользоваться инструментом, достаточно сделать пару действий:

- Удостоверится, что приложение запускается в режиме разработки;
- Открыть в инструментах разработчика вкладку «Performance» и кликнуть по первой иконке (Record);
- Произвести на странице необходимые действия для анализа;
- Остановить запись;
- События реакта будут доступны в группе: *Timings*.

<img
    class="lazyload"
    alt="Вкладка Performance"
    src="/assets/images/2020-03-29-react-optimization-story/1-1.min.png"
    data-src="/assets/images/2020-03-29-react-optimization-story/1-1.gif">
<div class="image-text">Работа на вкладке Performance</div>

Так же полезная группа для анализа JavaScript - это группа *Main* (работа главного потока JavaScript страницы), ее можно использовать совместно с группой *Timings* и сравнивать рендеры компонент с реально выполняемым кодом. Это очень мощная тулза:

<img
    class="lazyload"
    alt="Результаты анализа приложения"
    src="/assets/images/2020-03-29-react-optimization-story/2.min.png"
    data-src="/assets/images/2020-03-29-react-optimization-story/2.png">

Очень рекомендую к прочтению [статью Бена Шварца](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad), в которой он показывает по шагам, как анализировать компоненты, что в частности я и буду делать далее.

## Redux и performance.mark

В состоянии редакса моего проекта хранится все выгруженное дерево промо-страниц и при поиске фильтруется часть нод (не DOM-нод). Первая же мысль у меня была следующая: операция обновления нод дорогая и из-за этого происходит такой лаг.

Заглянув во вкладку *Performance*, в группе *Timings* я увидел данные только по React компонентам, а в группе *Main* примерно следующее:

<img
    class="lazyload"
    alt="Непонятные вызовы функций в группе Main"
    src="/assets/images/2020-03-29-react-optimization-story/3.min.png"
    data-src="/assets/images/2020-03-29-react-optimization-story/3.png">

Некоторые методы (*dispatch*, *onStateChange* или *performWorkOnRoot*) вызываются внутри React и для обычных пользователей не несут никакой объективной информации.

Возникает вопрос, а как React вообще строит красивые метки по компонентам? Как оказалось, в среде разработки React использует [User timing API](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API), который позволяет создавать временные метки, являющиеся частью временной шкалы производительности браузера. И с помощью этого API, мы можем создавать метки сами для Redux экшенов. Для этого достаточно написать middleware для редакса ([gist с кодом](https://gist.github.com/clarkbw/966732806e7a38f5b49fd770c62a6099)):

```js
export const userTimingMiddleware = () => next => action => {
  performance.mark(`${action.type}_start`);
  const result = next(action);

  performance.mark(`${action.type}_end`);
  performance.measure(
    `${action.type}`,
    `${action.type}_start`,
    `${action.type}_end`,
  );

  return result;
};
```

Так как это обычная миддлевара, то достаточно добавить ее при создании стора вместе с остальными:

```js
applyMiddleware(/* thunkMiddleware */, userTimingMiddleware)
```

И во вкладке Timing появятся метки по редакс-экшенам!

<img
    class="lazyload"
    alt="Как выгдялит redux-action на вкладке Timings"
    src="/assets/images/2020-03-29-react-optimization-story/4.min.png"
    data-src="/assets/images/2020-03-29-react-optimization-story/4.png">

Что касается моего кейса, то redux-экшен выполнялся какие-то доли миллисекунд, редакс в этой проблеме не причем, но теперь я четко мог понимать, после выполнения экшена какие именно компоненты перерисовываются, и какой код выполняется.

## Избегайте формирование данных в render

Далее я просто начал смотреть результаты анализа после ввода символа в инпут и увидел следующую картину:

<img
  class="lazyload image_size_xl"
  alt="Результат профилирования React приложения"
  src="/assets/images/2020-03-29-react-optimization-story/1.min.png"
  data-src="/assets/images/2020-03-29-react-optimization-story/1.png"
/>

Меня заинтересовало достаточно долгое обновление *PagePreview* (600ms), который не должен изменяться после ввода символов вообще. Я начал анализировать проблему, а алгоритм профилирования сводится к следующему:

- Листаю до *Main* группы и смотрю, что выполняется в период обновления компонента;
- Если нахожу долгие выполнения, кликаю по методу (в данном случае это оказался метод *render*) и метод, вызываемый внутри - *_getLatestUpdatedNode*);

<img
    class="lazyload"
    alt="Вкладка Performance"
    src="/assets/images/2020-03-29-react-optimization-story/5-1.min.png"
    data-src="/assets/images/2020-03-29-react-optimization-story/5-1.gif">
<div class="image-text">Процесс поиска проблемного места</div>

- Перехожу в «Bottom-Up» вкладку, где можно увидеть коллстек вызовов. Там есть два параметра: «Self time» и «Total time». Первый отвечает за время выполнения функции на текущем уровне дерева вызовов (время выполнения кода в самой функции, но не в функциях, которые вызываются внутри). «Total-Time» - это «self-time» + количество времени, которое потребовалось для выполнения кода во всех вызываемых внутри функций. В данном случае я ориентировался на «Total Time» - нахожу «Activity» с большим временем выполнения;
- Нажимаю на файл и попадаю на исходники с временными метками.

<img
    class="lazyload"
    alt="Вкладка Performance"
    src="/assets/images/2020-03-29-react-optimization-story/5-2.min.png"
    data-src="/assets/images/2020-03-29-react-optimization-story/5-2.gif">
<div class="image-text">Процесс поиска проблемного места</div>

*_getLatestUpdatedNode* оказался рекурсивным методом, который проходит всех потомков текущей ноды и ищет последнюю обновленную. И хоть один вызов и занимаем 3ms (из-за любимого нами moment, внутри метода происходило сравнение дат), то после сравнения сотни нод и выходило общее время в 600-800ms.

```js
render() {
    const { selectedNode } = this.props
    const node = this._getLatestUpdatedNode(selectedNode);
    // ...
}
```

Этот метод постоянно отрабатывал напрасно. Он не должен был находиться в render-е компонента и после оптимизации был перенесен в redux. После устранения проблемного места обновление компонента стало занимать 22 миллисекунды:

<img
  class="lazyload"
  alt="Результат оптимизации"
  src="/assets/images/2020-03-29-react-optimization-story/6.min.png"
  data-src="/assets/images/2020-03-29-react-optimization-story/6.png"
/>
<div class="image-text">Сэкономили пол секунды зависания</div>

Эта была маленькая (на самом деле большая) победа, но оптимизации на этом не закончены.

Помимо этой оптимизации в коде были почищены другие фрагменты с преобразованием в рендере. Но как и где делать такие преобразования, когда при изменении свойства нужно обновлять другую переменную и по различным причинам в Redux это не убрать?

### Используйте мемоизацию

> Хочу сразу отметить, что в правильных PureComponent-ах или в компонентах с shouldComponentUpdate метод рендер не будет вызываться без изменения пропсов, и в таком случае допустимо оставлять вычисляемую логику в самом методе render.

Рассмотрим пример из нашего кода:

```js
class Component extends React.Component {
    render() {
        const { highlightedNodes } = this.props;
        const highlightedIds = highlightedNodes.map(node => node.id);

        return (<div>...</div>);
    }
}
```

В рендере на каждую перерисовку формируется новый массив с идентификаторами объектов пропа highlightedNodes.

Первое, что приходит в голову, использовать внутренний стейт компонента и метод жизненного цикла: *getDerivedStateFromProps*. Код будет выглядеть как-то так:

```js
class Component extends React.Component {
    state = {
        highlightedIds: this.props.highlightedNodes.map(node => node.id)
    };

    static getDerivedStateFromProps(props, state) {
        const highlightedIds = props.highlightedNodes.map(node => node.id);

        // Если highlightedNodes был обновлен, возвращаем новое состояние
        if (!isEqual(highlightedIds, state.highlightedIds)) {
          return {
            highlightedIds
          };
        }
        return null;
    }

    render() {
        const { highlightedIds } = this.state;

        return (<div>...</div>);
    }
}
```

Но выглядит этот код избыточно, и если добавятся еще несколько зависимостей, то его будет и неудобно поддерживать. В данном кейсе на помощь приходит мемоизация:

```js
import memoize from 'memoize-one';

class Component extends React.Component {
    getHighlightedIds = memoize(
        (highlightedNodes) => highlightedNodes.map(node => node.id)
    );

    render() {
        const highlightedIds = this.getHighlightedIds(this.props.highlightedNodes);

        return (<div>...</div>);
    }
}
```

Метод getHighlightedIds будет заново итерироваться по массиву только в том случае, если проп highlightedNodes будет обновлен. По этой теме можете почитать [топик из официальной документации React](https://ru.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization).

## Избегайте dangerouslySetInnerHTML

У нас в проекте есть компонент *Icon*, который рендерит нужную иконку. Как он связан с задачей по фильтрации списка проектов? А связан он тем, что у каждой страницы есть своя иконка, а если это директория - то иконка папки:

<img
  class="lazyload"
  alt="Скриншот элементов списка"
  src="/assets/images/2020-03-29-react-optimization-story/7.min.png"
  data-src="/assets/images/2020-03-29-react-optimization-story/7.png"
/>

Иконки хранились в не оптимизированном svg (сжатие происходило в процессе билда продакшен сборки) и вставлялись в компоненте *Icon* через *dangerouslySetInnerHTML*:

```js
render() {
    const props = {
        ...rest,
        dangerouslySetInnerHTML: { __html: icons[icon] },
    };

    return <span {...props} />;
}
```

Что можно и было оптимизировано:

1. Сжать все svg (удобно делать через cli-утилиту [svgo](https://github.com/svg/svgo)). До сжатия в dev-версии 1000 иконок директорий (одинаковых svg) занимало **2мб!!** в HTML-разметке, после сжатия: **800кб**.

2. По опытам коллег, *dangerouslySetInnerHTML* замедляет время монтирования и демонтирования компонентов (ссылки в конце поста по этой теме приложу), поэтому svg рекомендуют переводить в простые stateless компоненты сразу в jsx. Но у нас не было патчинга свойств svg, поэтому я унес их в CSS Background. Время рендера списка уменьшилось на 30%, размер HTML снизился **до 350кб**.

## Следите за слушателями событий

Все мы знаем, что если подписываемся на какое-то событие в *componentDidMount*, то и должны отписаться в *componentWillUnmount*. Но у меня был еще один кейс: после нажатие на кнопку в инпуте начинают перерисовываться компоненты, которые вообще не относятся ни к поисковой строчке, ни к списку с нодами.

Как оказалось, в рутовом компоненте было две подписки на keyUp и keyDown, которые обрабатывали разные shortcuts-ы в приложении. И когда я нажимал кнопку, вызывались эти обработчики, меняли свой стейт, перерисовывали свои под компоненты.

Чтобы избавиться от такого поведения, мне было достаточно вызвать *stopPropagation* для отмены всплытия события в своих обработчиках:

```js
render() {
    return (
        <Input
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp} />
    );
}

onKeyDown = (event) => {
    event.stopPropagation();
};

onKeyUp = (event) => {
    event.stopPropagation();
    // ...
};
```

Не забывайте это делать и для своих компонент.

## Декомпозируйте на компоненты

Следующим на очереди был компонент List, который отрисовывает список нод:

<img
  class="lazyload"
  alt="Скриншот элементов списка"
  src="/assets/images/2020-03-29-react-optimization-story/8.min.png"
  data-src="/assets/images/2020-03-29-react-optimization-story/8.png"
/>

Он постоянно перерисовывался и делал это не быстро, 314ms. Открыв компонент, я увидел примерно следующее:

```js
class List extends React.Component {
    render() {
        return nodes.map(node => this._renderNode(node));
    }

    _renderNode(node) {}
}
```

При изменении хотя бы одной ноды (а как вы помните, они там исчисляются тысячами) перерисовывалось абсолютно все! Проблема очевидна, нужно вынести элемент списка в отдельный компонент:

```js
class List extends React.Component {
    render() {
        return nodes.map(node => (<ListNode node={node} />));
    }
}

class ListNode extends React.PureComponent {
    render() {
        return ();
    }
}
```

Сделав необходимый рефакторинг, время рендеринга уменьшилось **до 30ms** (в десять раз!).

<img
  class="lazyload"
  alt="Скриншот элементов списка"
  src="/assets/images/2020-03-29-react-optimization-story/9.min.png"
  data-src="/assets/images/2020-03-29-react-optimization-story/9.png"
/>

С простыми списками так же можно попробовать использовать библиотеки типа [react-window](https://github.com/bvaughn/react-window), которые рендерят только видимую часть списка (никакой магии: простая математика и *position: absolute*). Они дают огромный прирост в производительности, но при сложной логике (у нас есть реализация массового выделения) их далеко не просто интегрировать.

### И еще...

Декомпозиция на компоненты решило одну довольно частую ошибку: создание обработчиков в методе render.

```js
_renderNode(node) {
    const handleDoubleClick = this._getNodeDoubleClickHandler(node);

    // ...
}

_getNodeDoubleClickHandler(node) {
    return function () {}
}
```

В методе отрисовки ноды на каждый рендер создавалась своя функция хэндлер (еще не забыли, 1000 нод - 1000 обработчиков, N перерисовок - 1000 * N обработчиков).

После создания компонента ListNode код стал выглядеть вот так:

```js
class ListNode extends React.PureComponent {
    // ...

    _handleDoubleClick = () => {
        const { node } = this.props;
        // ...
    };
}
```

Один обработчик на все перерендеры и инстансы ListNode.

## Вместо заключения

История подошла к концу. После оптимизаций код стал чище, поиск стал работать, как и ожидается, моя задача была решена. Но мест в коде, которые можно и нужно еще оптимизировать не мало (лайзи лоад компонент, иммутальные структуры данных, правильная работа с редаксом и т.д.), но об этом уже в другой раз.

<img
  class="lazyload"
  alt="Финальный результат"
  src="/assets/images/2020-03-29-react-optimization-story/10.min.png"
  data-src="/assets/images/2020-03-29-react-optimization-story/10.gif"
/>

Спасибо за внимание, подписывайтесь на канал в телеграмме [@amorgunov](https://t.me/amorgunov), чтобы не пропускать анонсы новых постов и до скорых встреч!

### Ссылки по теме

- [Как было оптимизировано React web-приложение Twitter Lite](https://medium.com/@paularmstrong/twitter-lite-and-high-performance-react-progressive-web-apps-at-scale-d28a00e780a3) - эту статью очень рекомендую почитать, если вы пишите фронтенд.
- [Анализ производительности приложений на React 16 в Chrome DevTools](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad)
- [21 техника для оптимизации React-приложений](https://www.codementor.io/blog/react-optimization-5wiwjnf9hj)
- [Отличие self-time от total-time](https://bambielli.com/til/2016-02-24-self-time-total-time/)
- [Про метод жизненного цикла shouldComponentUpdate](https://ru.reactjs.org/docs/react-component.html#shouldcomponentupdate)
