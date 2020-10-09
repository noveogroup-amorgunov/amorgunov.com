---
title: "Как написать свой Virtual DOM"
date: 2020-08-03
time: 25
description: "Напишем с нуля свою реализацию Virtual DOM"
featuredImageThumbnail: "/assets/images/2020-08-03-create-own-virtual-dom/preview.jpg"
tags:
  - tutorial
  - virtual dom
layout: layouts/post.njk
likes: 26
---
Всем привет! Сегодня нас ждет удивительное приключение реализации виртуального DOM-a с нуля.

Материал получился большим, чтение у вас может занять до получаса, имейте это ввиду. А если у вас нет столько времени, то вы можете сразу посмотреть результат в песочнице [codesandbox](https://codesandbox.io/s/vdom130-12fsf) или [на гитхабе](https://github.com/noveogroup-amorgunov/vdom130).

Быстрые переходы по частям:

- [Что такое Virtual DOM?](#что-такое-virtual-dom%3F)
- [Реализуем метод createVNode](#createvnode(tagname%2C-props%2C-children))
- [Создаем реальный DOM-узлы](#createnode(vnode))
- [Монтируем DOM-узел в DOM-дерево](#mount(node%2C-target))
- [Сравнение виртуальных нод](#patchnode(node%2C-vnode%2C-nextvnode))
- [Сравнение атрибутов](#patchprops(node%2C-props%2C-nextprops))
- [Сравнение дочерних нод](#patchchildren(...))
- [Собираем все вместе](#собираем-все-вместе)
- [Обработчики событий](#обработчики-событий)
- [Бонус: интегрируем JSX](#интегрируем-jsx)

## Что такое Virtual DOM?

Если речь заходит про виртуальный DOM, то почти всегда дело касается React-а. Но на самом деле это общая концепция, используемая и за пределами мира React-а.

**Виртуальный DOM** (VDOM) - это представление пользовательского интерфейса в памяти (например, в JS переменной), по которому можно сформировать "настоящий" DOM. Виртуальный DOM отвечает не только представление в памяти, но и за синхронизацию с реальным DOM.

Например, у нас есть следующий код:

```html
<div id="app">
 Hello world
</div
```

Виртуальное представление может выглядеть следующим образом:

```js
const vNode = {
  tagName: "div",
  props: {
    id: "app"
  },
  children: [
    "Hello world"
  ],
}
```

Такой паттерн позволяет описывать интерфейсы в декларативном подходе, абстрагирует нас от прямой работы с DOM, обработчиками событий и атрибутов, и самое важное: оптимизирует работу обновления только нужных частей DOM-дерева (отвечает за синхронизацию с реальным DOM).

На медиуме есть [классный пост](https://medium.com/@nickbulljs/how-virtual-dom-work-567128ed77e9), как работает VDOM в React-е, а мы реализуем его сами (конечно очень упрощенную, но рабочую версию). Приступим!

## createVNode(tagName, props, children)

В первом разделе реализуем метод, который будет создавать виртуальный элемент (узел или ноду, все это синонимы,  далее по тексту они будут использоваться в одном контексте). В большинстве реализаций виртуального DOM-а функцию создания виртуальных элементов называют либо `createElement`, либо сокращенно `h`. Но мы назовем ее с ключевым словом **vNode**, чтобы явно указать на работу с виртуальным деревом.

Реализация этого метода довольна простая, поэтому приступим:

<div class="code-path">src/vdom.js</div>

```js
export const createVNode = (tagName, props = {}, children = []) => {
  return {
    tagName,
    props,
    children,
  };
};
```

Метод принимает три параметра:

- `tagName` - имя тега (например, `div` или `span`);
- `props` - свойства узла (например, атрибуты - `class` или `id`);
- `children` - дочерние элементы.

Формат этой функции и названия полей мы задаем сами, как захотим. Свойство `props` может называться `attrs`, а `tagName` - `type`; Смотрите на виртуальный DOM как на концепцию без четкого интерфейса реализации.

Для свойств и детей используем значения по умолчанию, чтобы при вызове `createVNode('h1')` быть уверенным, что у созданной виртуальной ноды будут проставлены как свойства, так и дети, и избегать этих проверок в дальнейшем.

Напишем наш первый виртуальный элемент:

<div class="code-path">src/app.js</div>

```js
import { createVNode } from './vdom';

const vNode = createVNode('div', {
  class: 'container'
});

console.log(vNode);
```

В результате мы получим следующий объект:

```
Object
    tagName: "div"
    props: Object
        class: "container"
    children: Array[0]
```

Придумаем что-нибудь посложнее:

<div class="code-path">src/app.js</div>

```js
import { createVNode } from './vdom';

const vNode = createVNode('div', { class: 'container' }, [
  createVNode('h1', {}, ['Hello, Virtual DOM']),
  createVNode('img', { src: 'https://i.ibb.co/M6LdN5m/2.png', width: 200 }),
]);

console.log(vNode);
```

И посмотрим на вывод в терминале:

```
Object
    tagName: "div"
    props: Object
        class: "container"
    children: Array[2]
        0: Object
            tagName: "h1"
            props: Object
            children: Array[1]
                0: "Hello, Virtual DOM"
        1: Object
            tagName: "img"
            props: Object
                src: "https://i.ibb.co/M6LdN5m/2.png"
                width: 200
            children: Array[0]
```

Мы только что научились строить виртуальное дерево или виртуальный DOM, поздравляю! Но это только самое начало. Далее мы будет из этого дерева получать реальные DOM элементы.

## createNode(vNode)

Теперь из виртуального дерева необходимо сформировать DOM узел. Рассмотрим реализацию ниже:

<div class="code-path">src/vdom.js</div>

```js
export const createDOMNode = vNode => {
  const { tagName, props, children } = vNode;

  // создаем DOM-узел
  const node = document.createElement(tagName);

  // Добавляем атрибуты к DOM-узлу
  Object.entries(props).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });

  // Рекурсивно обрабатываем дочерные узлы
  children.forEach(child => {
    node.appendChild(createDOMNode(child));
  });

  return node;
};
```

> Вы можете заметить, что рекурсия не лучшее решение, особенно для обхода DOM-узлов, вложенность которых может быть очень глубокой, и лучше использовать стек (чтобы не словить ошибку при достижении лимитов рекурсии). И вы будете правы, но для простоты реализации оставим именно этот вариант.

В DOM существуют целых [семь типов элементов](https://developer.mozilla.org/ru/docs/Web/API/Node/nodeType) (выше мы обработали самый используемый тип - _ElementNode_). Обработаем еще один тип - _TextNode_ (простой текст). В нашем виртуальном дереве это будет выглядеть следующим образом:

<div class="code-path">src/app.js</div>

```js
const vNode = createVNode('div', { class: 'container' }, [
  createVNode('h1', {}, ['Hello, Virtual DOM']),
  'Text node without tags', // <- TextNode
  createVNode('img', { src: 'https://i.ibb.co/M6LdN5m/2.png', width: 200 }),
]);
```

У текстовых нод нет ни аттрибутов, ни детей, поэтому в виртуальном DOM-е их можно хранить в виде обычных строк. Добавим в метод _createDOMNode_ условие на обработку текстовых узлов - они будут создаваться с помощью метода _document.createTextNode_, если виртуальная нода представлена строкой.

<div class="code-path">src/dom.js</div>

```js
export const createDOMNode = vNode => {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }

  const { tagName, props, children } = vNode;
  // ...
}
```

Попробуем метод в действии:

<div class="code-path">src/app.js</div>

```js
import { createVNode, createDOMNode } from './vdom';

const vNode = createVNode('div', { class: 'container' }, [
  createVNode('h1', {}, ['Hello, Virtual DOM']),
  'Text node without tags',
  createVNode('img', { src: 'https://i.ibb.co/M6LdN5m/2.png', width: 200 }),
]);

const node = createDOMNode(vNode);

console.log(node);
```

После выполнения кода в терминале будет отображено полученное DOM-дерево:

```html
<div class="container">
  <h1>Hello, Virtual DOM</h1>
  Text node without tags
  <img src="https://i.ibb.co/M6LdN5m/2.png" width="200"></img>
</div>
```

Очередной шаг завершен. Мы научились строить виртуальное DOM-дерево и формировать из него реальное. Теперь нужно отобразить результат в DOM страницы.

## mount(node, target)

Нам понадобится index.html страница, на которую и будем монтировать полученное DOM-дерево:

<div class="code-path">src/index.html</div>

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Virtual DOM</title>
</head>
<body>
  <div id="app"></div>
  <script src="./app.js"></script>
</body>
</html>
```

В элемент с `id=app` необходимо вставить полученное DOM-дерево. Способов сделать это не мало, например с помощью `innerHTML` отчистить содержимое родительской ноды и добавить в нее нужный элемент, используя `appendChild`. Мы же сделаем еще проще и заменим текущую DOM-ноду на переданную:

<div class="code-path">src/dom.js</div>

```js
export const mount = (node, target) => {
  target.replaceWith(node);
  return node;
};
```

> У выбранного способа есть проблема - если с сервера к нам приходит уже готовый HTML (сервер сайд рендеринг), то лишний раз полностью перерисовывается DOM. Ближе к концу материала мы исправим это.

Используем метод `mount` в нашем приложении и посмотрим на результат в браузере:

<div class="code-path">src/app.js</div>

```js
import { mount, createVNode, createDOMNode } from "./vdom";

const vNode = createVNode("div", { class: "container" }, [
  createVNode("h1", {}, ["Hello, Virtual DOM"]),
  "Text node without tags",
  createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 })
]);

const app = document.getElementById("app");

mount(createDOMNode(vNode), app);
```

<img
  class="lazyload"
  alt="Результат монтирования DOM-дерева на страницу"
  src="/assets/images/2020-08-03-create-own-virtual-dom/2.min.jpg"
  data-src="/assets/images/2020-08-03-create-own-virtual-dom/2.jpg"
/>

### Состояние

Усложним пример и добавим на страницу состояние. Конечно же, что может быть лучше старого доброго счетчика, который мы и добавим. Будем обновлять каждую секунду счетчик (с помощью `setInterval`) и перерисовывать DOM-дерево.

Виртуальное дерево перенесем в функцию `createVApp`, которая будет принимать наше состояние (обычный объект `state = { count }`) и использовать его в двух местах (просто выводить на странице и записываться в data-атрибут корневого элемента):

<div class="code-path">src/app.js</div>

```js
import { mount, createVNode, createDOMNode } from "./vdom";

const createVApp = state => {
  const { count } = state;
  return createVNode("div", { class: "container", "data-count": count }, [ // <- тут
    createVNode("h1", {}, ["Hello, Virtual DOM"]),
    createVNode("div", {}, [`Count: ${count}`]), // <- и тут
    "Text node without tags",
    createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 })
  ]);
};

// ...
```

И добавим код с интервалом и перерендером:

<div class="code-path">src/app.js</div>

```js
// ...

const state = { count: 0 };
const app = document.getElementById("app");

mount(createDOMNode(createVApp(state)), app);

setInterval(() => {
  state.count++;
  mount(createDOMNode(createVApp(state)), app);
}, 1000);
```

Вернувшись в браузер, мы увидим, что счетчик обновляется, как мы и планировали! На данном этапе мы можем писать приложения в декларативном стиле, что интуитивно понятно и просто.

Но есть и несколько серьезных проблем:

- Сбрасываются состояния (например, текст или фокус в инпуте) и обработчики событий после каждого ререндера (которых у нас сейчас нет, но это так);
- На каждое обновление счетчика постоянно перерисовывается DOM-дерево. А его перерисовка - достаточно тяжелая операция (одна из основных причин, зачем нужен VDOM);

Чтобы увидеть реальные перерисовки браузера, можно включить в devtools браузера вкладку Rendering и поставить галку у пункта "Paint flashing" (области, которые браузер перерисовывает, будут подсвечиваться зеленым цветом):

<img
  class="lazyload"
  alt="Как включить параметр Paint flashing"
  src="/assets/images/2020-08-03-create-own-virtual-dom/4.min.jpg"
  data-src="/assets/images/2020-08-03-create-own-virtual-dom/4.gif"
/>

И посмотрим на результат:

<img
  class="lazyload"
  alt="Paint flashing в действии"
  src="/assets/images/2020-08-03-create-own-virtual-dom/5.min.jpg"
  data-src="/assets/images/2020-08-03-create-own-virtual-dom/5.gif"
/>

Браузер перерисовывает все элементы, несмотря на то, что часть из них не меняется.

Для решения проблемы нам нужно не полностью заменять ноду, а обновлять (патчить) ее атрибуты и детей. Сделать это можно как раз с помощью виртуальных элементов - сравнив два элемента, можно найти отличия и точечно сделать изменения в реальном DOM.

## patchNode(node, vNode, nextVNode)

Мы подошли к самому интересному - сравнение виртуальных нод и применение изменений к реальной DOM-ноде. Идея в следующем:

 - Строится виртуальное дерево, по которому в свою очередь строится реальное и монтируется в DOM;
 - Как только меняется состояние (например, счетчик увеличивается), то строится новое виртуальное дерево и сравнивается с предыдущим;
 - Все найденные отличия патчатся в реальный DOM-узел;
 - Текущий виртуальный DOM заменяем новым.

> Далее в коде переменные, содержащие новое виртуальное дерево, его дочерние ноды или атрибуты, будут начинаться со слова `next`, помогая нам понять, что это именно следующее значение, которое нужно сравнивать с текущим.

Выглядеть это будет следующим образом:

<div class="code-path">src/app.js</div>

```js
// ...

const state = { count: 0 };
let vApp = createVApp(state);
let rootNode = mount(createDOMNode(vApp), document.getElementById("app"));

setInterval(() => {
  state.count++;

  // Формируем новое виртуальное дерево
  const nextVApp = createVApp(state);

  // Применяем изменения к DOM-ноде
  rootNode = patchNode(rootNode, vApp, nextVApp);

  // Текущее виртуальное дерево заменяем новым
  vApp = nextVApp;
}, 1000);
```

Приступим к реализации метода `patchNode`. Начнем с описания кейсов, которые нужно обработать при сравнении элементов. Первое, что приходит в голову, это изменение атрибутов и дочерних узлов. Все верно, но эти пункты мы рассмотрим далее, а пока опишем возможные случаи с самим элементом:

- Если `nextVNode` равен `undefined`, то реальную ноду нужно удалить;
- Если хотя бы одно из значений `vNode` и `nextVNode` равно строке (не виртуальный элемент) и они не равны друг другу (например, `vNode` это строка, а `nextVNode` - нет, наоборот или два значения - это строки, которые не равны), то можно просто создать новую DOM-ноду с помощью `createNode` и заменить ей текущую с помощью `node.replaceWith`;
- Если `vNode.tagName`, не равен `nextVNode.tagName`, то предположим, что это новый элемент и просто создадим новую DOM-ноду, заменив текущую;
- Если у элементов одинаковый тег, то нужно сравнить дочерние узлы и атрибуты.

<div class="code-path">src/vdom.js</div>

```js
export const patchNode = (node, vNode, nextVNode) => {
  // Удаляем ноду, если значение nextVNode не задано
  if (nextVNode === undefined) {
    node.remove();
    return;
  }

  if (typeof vNode === "string" || typeof nextVNode === "string") {
    // Заменяем ноду на новую, если как минимум одно из значений равно строке
    // и эти значения не равны друг другу
    if (vNode !== nextVNode) {
      const nextNode = createDOMNode(nextVNode);
      node.replaceWith(nextNode);
      return nextNode;
    }

    // Если два значения - это строки и они равны,
    // просто возвращаем текущую ноду
    return node;
  }

  // Заменяем ноду на новую, если теги не равны
  if (vNode.tagName !== nextVNode.tagName) {
    const nextNode = createDOMNode(nextVNode);
    node.replaceWith(nextNode);
    return nextNode;
  }

  // Патчим свойства (реализация будет далее)
  patchProps(node, vNode.props, nextVNode.props);

  // Патчим детей (реализация будет далее)
  patchChildren(node, vNode.children, nextVNode.children);

  // Возвращаем обновленный DOM-элемент
  return node;
};
```

## patchProps(node, props, nextProps)

Начнем с метода `patchProps`, который довольно простой в реализации:

- С помощью деструктизации объектов мержим `props` и `nextProps`, получая единый объект с атрибутами элемента;
- Далее перебираем ключи это объекта:
- Если атрибут имеет одинаковые значения, ничего не делаем;
- Если `nextProp` равен `undefined`, `null` или `false`, то удаляем атрибут у ноды (с помощью `removeAttribute`);
- В остальных случаях вызываем `setAttribute`, который перезапишет старое значение новым.

> Вполне логичным замечанием будет то, почему мы мержим старые и новые свойства и перебираем их, когда старые достаточно было бы удалить. В разделе с обработчиками событий нам это пригодится.

Обновление самого свойства вынесем в дополнительный метод `patchProp`:

<div class="code-path">src/vdom.js</div>

```js
const patchProp = (node, key, value, nextValue) => {
  // Если новое значение не задано, то удаляем атрибут
  if (nextValue == null || nextValue === false) {
    node.removeAttribute(key);
    return;
  }

  // Устанавливаем новое значение атрибута
  node.setAttribute(key, nextValue);
};

const patchProps = (node, props, nextProps) => {
  // Объект с общими свойствами
  const mergedProps = { ...props, ...nextProps };

  Object.keys(mergedProps).forEach(key => {
    // Если значение не изменилось, то ничего не обновляем
    if (props[key] !== nextProps[key]) {
      patchProp(node, key, props[key], nextProps[key]);
    }
  });
};
```

В методе `createDOMNode` теперь тоже можно использовать метод `patchProps`, просто передавая в качестве текущих свойств пустой объект:

```diff
-  Object.entries(props).forEach(([key, value]) => {
-     node.setAttribute(key, value);
-   });
+  patchProps(node, {}, props);
```

Стоит отметить, что `setAttribute` преобразует значение в строчку, поэтому если нужно хранить объекты, массивы или методы, то их необходимо сеттить в `node`, например:

```js
const key = 'customArray';
const value = [1, 5];

node[key] = value;
```

В нашей реализации мы этого делать не будем.

## patchChildren(...)

`patchChildren(parentNode, vChildren, nextVChildren)`

Обновление дочерних нод - процесс без какой либо магии и всего в несколько строк кода. В метод нужно передать родительскую ноду, так как именно ее детей необходимо править (удалять, добавлять и обновлять). Рассмотрим возможные кейсы:

- Если количество детей каждого виртуального элемента одинаково, то просто сравниваем их в методе `patchNode`;
- Если у текущего виртуального дерева детей больше, то необходимо удалить эти ноды. но нам не придется ничего писать дополнительно, так как метод `patchNode` умеет удалять DOM-ноды;
- Если у следующего виртуального элемента детей больше, то их просто нужно добавить в родительский DOM-элемент с помощью `appendChild`.

Метод выглядит следующим образом:

<div class="code-path">src/vdom.js</div>

```js
const patchChildren = (parent, vChildren, nextVChildren) => {
  parent.childNodes.forEach((childNode, i) => {
    patchNode(childNode, vChildren[i], nextVChildren[i]);
  });

  nextVChildren.slice(vChildren.length).forEach(vChild => {
    parent.appendChild(createDOMNode(vChild));
  });
};
```

С помощью `slice` мы получаем массив из дочерних нод, которые необходимо просто вставить в родительскую DOM-ноду.

> Так же можно для виртуальных нод добавить поле key, чтобы использовать его в списках, как это сделано в React, и при добавлении элемента в начало списка не обновлять все следующие ноды. Но этот пункт мы так же пропустим.

## Собираем все вместе

Файл `vdom.js` содержит 120 строк кода и реализует простейший вариант Virtual DOM-a. Попробуем его в действии: будем на каждое обновление стейта формировать новый виртуальный DOM и патчить ноду.

<div class="code-path">src/app.js</div>

```js
import { patchNode, mount, createVNode, createDOMNode } from "./vdom";

const createVApp = state => {
  const { count } = state;
  return createVNode("div", { class: "container", "data-count": count }, [
    createVNode("h1", {}, ["Hello, Virtual DOM"]),
    createVNode("div", {}, [`Count: ${count}`]),
    "Text node without tags",
    createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 })
  ]);
};

let vApp = createVApp(state);
let app = mount(createDOMNode(vApp), document.getElementById("app"));

setInterval(() => {
  state.count++;

  const nextVApp = createVApp(state);

  app = patchNode(app, vApp, nextVApp);
  vApp = nextVApp;
}, 1000);
```

Посмотрим на результат в браузере:

<img
  class="lazyload"
  alt="Результат обновления измененных элементов"
  src="/assets/images/2020-08-03-create-own-virtual-dom/6.min.jpg"
  data-src="/assets/images/2020-08-03-create-own-virtual-dom/6.gif"
/>

А так же в DevTools на изменения в DOM-дереве:

<img
  class="lazyload"
  alt="Результат обновления измененных элементов в DOM"
  src="/assets/images/2020-08-03-create-own-virtual-dom/7.min.jpg"
  data-src="/assets/images/2020-08-03-create-own-virtual-dom/7.gif"
/>

Что же, мы решили проблемы и сейчас обновляются только измененные элементы! Но если мы посмотрим на код в `app.js`, то он не сильно удобный для использования (постоянно хранить ссылку как на DOM-элемент, так и на виртуальный DOM, который еще нужно и заменять). Инкапсулируем всю эту логику в методе `patch`.

## patch(vNode, node)

В метод `patch` будем передавать виртуальный элемент и реальный, содержимое которого нужно обновить. Текущее виртуальное дерево будем хранить в самой DOM-ноде в свойстве `v`.

<div class="code-path">src/vdom.js</div>

```js
export const patch = (nextVNode, node) => {
  // Получаем текущее виртуальное дерево из DOM-ноды
  const vNode = node.v;

  // Патчим DOM-ноду
  node = patchNode(node, vNode, nextVNode);

  // Сохраняем виртуальное дерево в DOM-ноду
  node.v = nextVNode;

  return node;
};
```

Это будет работать и теперь появилась возможность использовать `patch` вместо метода `mount`. Но у нас еще осталась проблема с гидрацией, когда с сервера уже приходит HTML (SSR). Так как изначально `node.v` равно `undefined`, то текущий элемент будет просто заменен новым (в методе `patchNode`).

Однако мы можем решить это, восстановив виртуальное дерево из реального DOM-узла. Полностью восстанавливать мы его не будем (например, атрибуты), но восстановим текстовые элементы (понять, что элемент текстовый, можно по свойству `nodeType`, которое будет равно 3) и структуру элементов с правильными тегами:

<div class="code-path">src/vdom.js</div>

```js
const TEXT_NODE_TYPE = 3;

const recycleNode = node => {
  // Если текстовая нода - то возвращаем текст
  if (node.nodeType === TEXT_NODE_TYPE) {
    return node.nodeValue;
  }

  //  Получаем имя тега
  const tagName = node.nodeName.toLowerCase();

  // Рекурсивно обрабатываем дочерние ноды
  const children = [].map.call(node.childNodes, recycleNode);

  // Создаем виртуальную ноду
  return createVNode(tagName, {}, children);
};
```

Используем этот метод в `patch`:

<div class="code-path">src/vdom.js</div>

```diff
export const patch = (nextVNode, node) => {
+  const vNode = node.v || recycleNode(node);
  // ...
};
```

И перепишем `app.js` (теперь можно не использовать метод `mount` и обойтись `patch`):

<div class="code-path">src/app.js</div>

```diff
// ...
let vApp = createVApp(state);
- let app = mount(createDOMNode(vApp), document.getElementById("app"));
+ let app = patch(vApp, document.getElementById("app"));

setInterval(() => {
  state.count++;

-  const nextVApp = createVApp(state);
-
-  app = patchNode(app, vApp, nextVApp);
-  vApp = nextVApp;
+  app = patch(createVApp(state), app);
}, 1000);
```

Конечно же вручную запускать `patch` на каждое обновление стейта не хочется, поэтому усложним несколько наше состояние, добавив метод `setState` и слушателя `onStateChanged`:

<div class="code-path">src/app.js</div>

```js
const store = {
  state: { count: 0 },
  onStateChanged: () => {},
  setState(nextState) {
    this.state = nextState;
    this.onStateChanged();
  }
};

let app = patch(createVApp(store), document.getElementById("app"));

// На каждое изменение состояния патчим DOM-элемент
store.onStateChanged = () => {
  app = patch(createVApp(store), app);
};
```

Создавали VDOM, а по ходу реализовали очень легкую версию flux-стора. Теперь достаточно только обновлять `state` и DOM автоматически будет обновлен:

```js
setInterval(() => {
    store.setState({ count: store.state.count + 1 });
}, 1000);
```

Финальный вариант файла `app.js` будет выглядеть следующим образом:

<div class="code-path">src/app.js</div>

```js
import { patch, createVNode } from "./vdom";

const createVApp = store => {
  const { count } = store.state;
  return createVNode("div", { class: "container", "data-count": count }, [
    createVNode("h1", {}, ["Hello, Virtual DOM"]),
    createVNode("div", {}, [`Count: ${count}`]),
    "Text node without tags",
    createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 })
  ]);
};

const store = {
  state: { count: 0 },
  onStateChanged: () => {},
  setState(nextState) {
    this.state = nextState;
    this.onStateChanged();
  }
};

let app = patch(createVApp(store), document.getElementById("app"));

store.onStateChanged = () => {
  app = patch(createVApp(store), app);
};

setInterval(() => {
    store.setState({ count: store.state.count + 1 });
}, 1000);
```

## Обработчики событий

Даже для простой версии виртуального DOM-а обработчики событий обязательны. Сначала добавим кнопки "+1" и "-1" для изменения значения счетчика и удалим `setInterval`. Для кнопок напишем свою фабрику или компонент (если говорить на языке React-а) с двумя свойствами `onclick` и `text`:

<div class="code-path">src/app.js</div>

```js
const createVButton = props => {
  const { text, onclick } = props;

  return createVNode("button", { onclick }, [text]);
};
```

И добавим две кнопки в `createVApp`:

<div class="code-path">src/app.js</div>

```diff
const createVApp = store => {
  const { count } = store.state;
  return createVNode("div", { class: "container", "data-count": count }, [
    createVNode("h1", {}, ["Hello, Virtual DOM"]),
    createVNode("div", {}, [`Count: ${count}`]),
    "Text node without tags",
    createVNode("img", { src: "https://i.ibb.co/M6LdN5m/2.png", width: 200 }),
+    createVNode("div", {}, [
+      createVButton({
+        text: "-1",
+        onclick: () => store.setState({ count: store.state.count - 1 })
+      }),
+      " ",
+      createVButton({
+        text: "+1",
+        onclick: () => store.setState({ count: store.state.count + 1 })
+      })
+    ])
  ]);
};
```

Запустив этот код, кнопки появятся, но при нажатии на них ничего не будет происходить. Почему так? Если посмотреть в исходный код, то увидим, что код обработчиков (функции) находятся в атрибуте `onclick` в виде строки. И даже если бы он вызывался, то произошла бы ошибка, так как переменная `store` не определена.

<img
  class="lazyload"
  alt="Отображение кнопок в DOM"
  src="/assets/images/2020-08-03-create-own-virtual-dom/8.min.jpg"
  data-src="/assets/images/2020-08-03-create-own-virtual-dom/8.jpg"
/>

Чтобы сохранить контекст вызова, нужно сохранить обработчик прямо в DOM-ноду. Сперва создадим функцию `listerner`:

<div class="code-path">src/vdom.js</div>

```js
function listener(event) {
  return this[event.type](event);
}
```

Зачем она нам нужна и что делает? Эта функция будет вызываться при вызове события (например `click`), `this` указывает на DOM-элемент, `this[event.type]` на метод, который мы указываем в виртуальном элементе.

Теперь добавим обработку событий в метод `patchNode`. Чтобы отличать события от не событий можно называть их с префикса _on_ (например, _onclick_, _onkeydown_), тем самым отделяя их от остальных атрибутов:

<div class="code-path">src/vdom.js</div>

```js
const patchProp = (...) => {
  if (key.startsWith("on")) {
    // ...
  }
```

Когда мы поняли, что нужно обработать событие, нужно вытащить его имя (удалив `on`), добавить функцию в DOM-ноду, и навесить обработчик с помощью `addEventListener`, если значение в текущем виртуальном узле не задано (или удалить, если значение не задано в следующем виртуальном узле):


<div class="code-path">src/vdom.js</div>

```js
const patchProp = (...) => {
  if (key.startsWith("on")) {
    const eventName = key.slice(2);

    node[eventName] = nextValue;

    if (!nextValue) {
      node.removeEventListener(eventName, listener);
    } else if (!value) {
      node.addEventListener(eventName, listener);
    }
    return;
  }
```

Проверяем работу событий в действии:

<img
  class="lazyload"
  alt="Финальный результат"
  src="/assets/images/2020-08-03-create-own-virtual-dom/9.min.jpg"
  data-src="/assets/images/2020-08-03-create-own-virtual-dom/9.gif"
/>

## Интегрируем JSX

Для компиляции JSX кода в JS можно воспользоваться babel-плагинами [`@babel/plugin-transform-react-jsx`](https://babeljs.io/docs/en/next/babel-plugin-transform-react-jsx.html) и `@babel/plugin-syntax-jsx`. Для этого их нужно установить и создать `.babelrc` в директории проекта:

```json
{
  "plugins": [
    "@babel/plugin-syntax-jsx",
    ["@babel/plugin-transform-react-jsx", { "pragma": "createVNode" }]
  ]
}
```

Также нужно передать опцию `pragma`, в которой указать название метода (в который JSX-код будет преобразован). Например, следующиий JSX:

```jsx
<div>Count</div>
```

будет скомпилирован в следующий JS-код:

```js
createVNode("div", {}, "Count")
```

Для интеграции JSX нужно немного изменить метод `createVNode`, а именно добавить возможность передачи функции и обработки дочерних элементов:

<div class="code-path">src/vdom.js</div>

```js
export const createVNode = (tagName, props = {}, ...children) => {
  if (typeof tagName === "function") {
    return tagName(props, children);
  }

  return {
    tagName,
    props,
    children: children.flat(),
  };
};
```

> Нужно для приведения возвращаемого значения к формату [hyperscript](https://github.com/hyperhype/hyperscript).

Теперь изменим наш пример:

<div class="code-path">src/app.js</div>

```js
const createVApp = store => {
  const { count } = store.state;
  const decrement = () => store.setState({ count: store.state.count - 1 });
  const increment = () => store.setState({ count: store.state.count + 1 });

  return (
    <div {...{ class: "container", "data-count": String(count) }}>
      <h1>Hello, Virtual DOM</h1>
      <div>Count: {String(count)}</div>
      Text node without tags
      <img src="https://i.ibb.co/M6LdN5m/2.png" width="200" />
      <button onclick={decrement}>-1</button>
      <button onclick={increment}>+1</button>
    </div>
  );
};
```

Выглядит компактнее, а для любителей реакта и привычнее. Как вы можете заметить, мы используем ключ `class`, а не `className` (так как обработка `className` в атрибут `class` происходит на стороне Virtual DOM-а, не JSX-а, и у нас такой обработки нет, в отличие от React-а).

## Итоги

Сегодня мы проделали большую работу, реализовав свою версию Virtual DOM с блекджеком, обработчиками событий, методом патчинга реальной ноды и даже интегрировали JSX.

Итоговый вариант залит на [гитхаб](https://github.com/noveogroup-amorgunov/vdom130) и в [codesandbox](https://codesandbox.io/s/vdom130-12fsf) (версия без jsx).

В процессе написания поста я наткнулся на библиотеку [superfine](https://github.com/jorgebucaran/superfine), которая предоставляет свою реализацию Virtual DOM в 300 строк кода. Если хотите погрузиться в тему поглубже, то рекомендую начать с изучения именно данного решения (в ней есть работа с key в списках, обработка svg, выполнение на стороне сервера и многое другое).

Чтобы не пропускать посты на блоге, подписывайтесь на телеграм канал https://t.me/amorgunov. До связи!
