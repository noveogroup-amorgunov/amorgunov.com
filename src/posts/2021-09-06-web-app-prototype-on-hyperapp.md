---
title: 'Прототип web-приложения на Hyperapp за 5 минут'
date: 2021-09-06
time: 5
description: 'Реализуем простое приложение счетчика на Hyperapp'
featuredImageThumbnail: '/assets/images/2021-09-06-web-app-prototype-on-hyperapp/preview.jpg'
tags:
  - tutorial
  - hyperapp
  - typescript
layout: layouts/post.njk
likes: 1
---

Порой нужно реализовать прототип небольшого приложения для проверки какой-нибудь гипотезы. Недавний пример с работы: мы решили попробовать work-in-progress лимиты (из методологии kanban), но наш трекер не умеет с ними работать. Появилась задача по-быстрому собрать дашборд с тикетами из спринта с указанием лимитов.

React или любой другой современный фреймворк (библиотека) для прототипа может быть слишком избыточным (еще и придется ставить кучу всего из экосистемы - стейт-менеджер, роутер и научится все это собирать - на это может уйти не один день). Да-да, есть create-react-app и подобные инструменты, но сколько там всего под капотом. Хочется использовать минимум библиотек, минимум конфигов, TypeScript, JSX (почему нет) и максимально быстро собрать приложение. Хочется минимализма.

> Вы можете сказать, что есть же Svetle? Да, его я тоже очень хотел попробовать и попробую в следующий раз, возможно даже в таком же стиле выпущу пост по основным концепнциям библиотеки.

Сегодня соберем такое приложение на [Hyperapp](https://github.com/jorgebucaran/hyperapp). Это супер-маленький фреймворк (1.1кб) для построения UI с _one-way data binding_ стейт-менеджертом (как Redux или Vuex) и виртуальным DOM-ом (как в React-е). Несмотря на почти 19к звезд на гитхабе, сообщество не очень большое, как и материалов на русском. Поэтому первую часть поста посмотрим на возможности и реализуем бизнес-логику приложения Counter (а на чем же еще показывать возможности библиотеки), а во второй части - рассмотрим готовый стартер для проекта.

Что получилось по итогу:

- Пример счетчика: [noveogroup-amorgunov/hyperapp-counter](https://github.com/noveogroup-amorgunov/hyperapp-counter)
- Стартер на Hyperapp: [noveogroup-amorgunov/hyperapp-starter](https://github.com/noveogroup-amorgunov/hyperapp-starter)

> Hyperapp позиционируется как полноценное решение для построения сложных интерфейсов. Но из-за довольно ограниченного туллинга и маленькой экосистемы для больших приложений библиотека не подойдет.

## Из чего приготовлен Hyperapp

Hyperapp состоит из 4 основных составляющих: представление (используется hypertext формат, что позволит использовать JSX), экшены, эффекты и подписки для работы с состоянием приложения. Но прежде, чем перейти к ним, стоит остановиться на кое чем более важном.. на архитектуре. Архитектура Hyperapp основана на концепции _State machine_ и конечных автоматов (_Finite-state machine_, далее просто FSM). Подробнее можете почитать [статью Антона Субботина про конечные автоматы в реальной жизни](https://habr.com/ru/company/yandex_praktikum/blog/564800/).

FSM - это такая абстрактная модель системы, которая имеет конечное число состояний, и правила перехода между которыми заранее известны. Автомат умеет взаимодействовать с внешним миром через входы и выходы. Входы (inputs) - различные способы реакции состояния из внешнего мира, а выходы (outputs) - влияние на внешний мир. Если подытожить, FSM определяется списком его состояний, начальным состоянием и инпутами (входы и выходы).

<img
  class="lazyload"
  alt="FSM"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/1.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/1.out.jpg"
/>

### Состояние (Store) и экшены (Actions)

Стейт (наш FSM), это обычный JavaScript объект, для которого нужно указать начальное состояние:

```ts
type State = {
  counter: number;
};

const initialState: State = {
  counter: 0,
};
```

Так как все Hyperapp приложения - это FSM, то изменять свое состояние они могут через входы, которые называются экшенами. Экшены - это чистые функцию, которые в качестве аргумента принимают стейт и возвращают новой стейт (привет, Redux):

```ts
import type {Action} from 'hyperapp';

const add: Action<State> = state => ({...state, counter: state.counter + 1});
const subract: Action<State> = state => ({...state, counter: state.counter - 1});
```

<img
  class="lazyload"
  alt="Actions"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/3.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/3.out.jpg"
/>

> Все TypeScript тайпинги взяты из оффициального [index.d.ts](https://github.com/jorgebucaran/hyperapp/blob/main/index.d.ts). К сожалению, они не очень хорошо расширяются и код получается не всегда ~~хорошо~~ правильно типизирован.

### Представление (View)

Еще не забыли, что у FSM есть выходы, которые после изменения состояния влияют на внешний мир? В качестве одного из выходов выступает View-слой, который обновляется после каждого изменения состояния и отрисовывает DOM-ноды:

<img
  class="lazyload"
  alt="Views"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/4.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/4.out.jpg"
/>

Представления можно писать с помощью JSX, и как в React, вместо работы с настоящим DOM-ом, работа происходит с виртуальным деревом:

```jsx
import type {VNode} from 'hyperapp';

function View(state: State): VNode<State> {
  return (
    <main>
      <h1>state.counter: {state.counter}</h1>
      <button onclick={add}>Add</button>
      <button onclick={subract}>Subtract</button>
    </main>
  );
}
```

Функция принимает стейт и возвращает виртуальную DOM-ноду. В качестве атрибутов с названием `on-*` можно передавать наши экшены и как вы можете заметить, что они написаны в нижнем регистре (в React-е например они указываются как onClick и это просто особенность реакта). Т.е. View может производить экшены, которые изменяют состояние:

<img
  class="lazyload"
  alt="Actions, state, view"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/5.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/5.out.jpg"
/>

Похоже на типичную работу стандартного react-redux приложения. А можно сделать ее еще более похожей, если view-слой разделить с помощью композиции и вынести повторяющие часты в отдельные вьюхи (компоненты):

```jsx
import type {VNode} from 'hyperapp';

type ButtonProps = {
  onclick: Action<State>,
};

function Button(props: ButtonProps, children: VNode<unknown>) {
  const {onclick} = props;

  return <button onclick={onclick}>{children}</button>;
}
```

И перепишем `View`:

```jsx
import type {VNode} from 'hyperapp';

function View(state: State): VNode<State> {
  return (
    <main>
      <h1>state.counter: {state.counter}</h1>
      <Button onclick={add}>Add</Button>
      <Button onclick={subract}>Subtract</Button>
    </main>
  );
}
```

> Важно, что у Hyperapp нет изолированного стейта у отдельных компонентов (как в React-е), поэтому все состояния хранятся в одном месте. С помощью композиции состояния можно самому проектировать структуру стейта.

### Подписки (Subscriptions)

Для изменения состояния из внешнего мира (веб-сокеты, таймеры, изменения в адресе страницы) используются подписки. Это функции, которые принимают стейт и какой-нибудь пэйлоад, и подписываются на необходимых слушателей. Например, можно подписаться на событие `keydown` и слушать события нажатия на кнопки стрелок:

```ts
import type {Subscription} from 'hyperapp';

const keyDownSubscription: Subscription<State> = [
  (dispatch, {onup, ondown}) => {
    let handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        dispatch(onup);
      }
      if (event.key === 'ArrowDown') {
        dispatch(ondown);
      }
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  },
  {onup: add, ondown: subract},
];
```

Подписку можно сделать опциональной при подключении и в таком случае нужно отписаться от подписки (для этого из функции нужно вернуть коллбек для отписки). Опять же аналогия из мира реакта - `useEffect`. Подписки являются выходами, поэтому схема с FSM будет выглядеть следующим образом:

<img
  class="lazyload"
  alt="Схема работы с подписками"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/6.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/6.out.jpg"
/>

### Эффекты (Effects)

Асинхронные экшены (например, http-запросы) делать в Hyperapp нельзя, поэтому есть еще одна составляющая - это эффекты. С помощью них можно сделать асинхронную операцию и после вызвать экшен. По сути с помощью них можно делать любые сайд эффекты.

Создадим эффект `addAsyncEffect`, который будет увеличивать счетчик через 1 секунду после клика на кнопку:

```ts
import type {Effect} from 'hyperapp';

const addAsyncEffect: Effect<State> = [
  dispatch => {
    setTimeout(() => {
      dispatch(add);
    }, 1000);
  },
  null,
];
```

> Вторым элементом массива Effect ожидает какой-нибудь пэйлоад. У нас его нет, поэтому просто указываем null.

Кто работал с Redux-thunk или Vuex, сразу увидит аналогию и схожесть в работе. Чтобы инициировать эффект, нужно обернуть его в экшен (прокинув его вторым элементом массива):

```ts
import type {Action} from 'hyperapp';

const addAsync: Action<State> = state => [
  // состояние можно обновить, но в данном экшене этого делать не нужно
  state,
  addAsyncEffect,
];
```

Т.е. вместо возврата состояния, нужно вернуть массив (картеж), где первым элементов - будет новых стейт, а втором - эффект. Таким образом, эффекты - это выходы, которые "эффектят" на внешний мир и генерируют экшены. Финальная схема выглядит следующим образом:

<img
  class="lazyload"
  alt="Финальная схема работы hyperapp"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/7.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/7.out.jpg"
/>

Добавим новую кнопку на `View`:

```jsx
import type {VNode} from 'hyperapp';

function View(state: State): VNode<State> {
  return (
    <main>
      <h1>state.counter: {state.counter}</h1>
      <Button onclick={add}>Add</Button>
      <Button onclick={addAsync}>Add async</Button>
      <Button onclick={subract}>Subtract</Button>
    </main>
  );
}
```

### Собираем все вместе

И наконец, соберем все вместе с помощью функции `app`, которая создаст приложение и примаунтит его в реальный DOM (привет, `React.render`):

```ts
import {h, app} from 'hyperapp';

// ...

app<State>({
  init: initialState,
  view: View,
  subscriptions: () => [keyDownSubscription],
  node: document.querySelector('#app')!,
});
```

<img
  class="lazyload"
  alt="Финальный результат работы приложения"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/8.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/8.gif"
/>

Собственно и все, с учетом импортов, TypeScript-типов собрали приложение асинхронного счетчика (значение которого можно изменять с клавиатуры) из 80 строк кода. Финальный вариант можно посмотреть в Github-репозитории [noveogroup-amorgunov/hyperapp-counter](https://github.com/noveogroup-amorgunov/hyperapp-counter).

### Включаем JSX

К сожалению, пример выше не заведется, так как Hyperapp не работает с JSX из коробки. Нужно сделать 3 шага: указать в typescript правильную обработку JSX (чтобы TS подтягивал тайпинги), настроить babel плагин `@babel/plugin-transform-react-jsx` (чтобы создавались h-функции, а не `React.createElement`) и переопределить дефолтный `h` из `hyperapp` (работающую версию `h.jsx` можно посмотреть [в гитхабе](https://github.com/noveogroup-amorgunov/hyperapp-counter/blob/main/src/h.tsx)).

В собранном бандле теперь код компонентов будет выглядеть вот так:

```js
var _h = require('~/src/h');

function Button(props, children) {
  const {onclick} = props;
  return _h.h('button', {onclick: onclick}, children);
}
```

Весь JSX будет заменяться на вызов функции `h`, в данном случае переопределенной нами.

## Стартер для приложения

Чтобы не настраивать конфиги с нуля, я создал стартер [noveogroup-amorgunov/hyperapp-starter](https://github.com/noveogroup-amorgunov/hyperapp-starter). На самом деле подобные стартеры уже есть, но либо они не работают с TypeScript, либо с JSX, либо вообще написаны для первой версии Hyperapp (которая несовместима со второй). Собирается проект с помощью zero-config сборщика [Parcel](https://v2.parceljs.org).

На самом деле завести Parcel + TypeScript + JSX + Hyperapp оказалось не такой и простой задачей. Parcel по умолчанию использует свой `tsconfig`, поэтому переопределять `h` функцию нужно на уровне `babelrc`. Ниже пара интересных моментов из стартера.

### Провайдер состояния

По умолчанию `state` приложения недоступен в дочерних компонентах, так как в Hyperapp нет контекста. Это можно обойти, обернув каждую ноду в high order function, которая будет предоставлять состояние. Ниже реализация:

```ts
import {VNode} from 'hyperapp';

type FnWithState<S> = (...args: any[]) => (state: S) => VNode<any>;
type Fn = (...args: any[]) => VNode<any>;
type View<S> = Fn | FnWithState<S>;

export const stateProvider = <S>(view: View<S>) => (state: S) =>
  (function provide(target): VNode<any> {
    if (typeof target === 'function') {
      return provide(target(state));
    }

    if (target && target.children) {
      // @ts-expect-error children is readonly prop
      target.children = target.children.map(child => provide(child));
    }

    return target;
  })(view(state));
```

Если вместо `VNode` компонент будет возвращать функцию, то хелпер вызывает ее, прокидывая в нее стейт. В компонентах это будет выглядеть вот так:

```ts
export const View = () => (state: State) => {
    return (/* ... */);
};
```

Подключить хелпер очень просто, нужно обернуть рутовый компонент при инициализации приложения:

```diff
app<State>({
-  view: View,
+  view: stateProvider<State>(View),
  // ...
});
```

### Синхронизация состояния с хранилищем

Следующая фича, сохранение состояния в localStorage (либо еще где-нибудь). Это можно сделать с помощью подписок, которые вызываются на каждое изменения стейта. Ниже реализация подписки, которая сохраняет сериализованный стейт.

```ts
import type {Subscription} from 'hyperapp';

const STORAGE_KEY = '__store';

function persistFx<S>(_: unknown, state: S) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return () => true;
}

export function persist<S>(state: S): Subscription<S> {
  return [persistFx, state];
}
```

При инициализации приложения достаточно просто считать значения из _localStorage_:

```ts
export function getInitialState<S>(initialState: S): S {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || initialState;
  } catch (err) {
    return initialState;
  }
}
```

Подключаются функции в вызове app:

```diff
app<State>({
  view: stateProvider<State>(View),
+ init: getInitialState<State>({}),
+ subscriptions: state => [persist(state)],
  // ...
});
```

### Stateful модули

Один из главных вопросов, с которым сталкиваются при работе с hyperapp, как создать локальный стейт у компонентов? Все примеры с каунтером (из поста выше, в том числе) будут работать с одним глобальным состоянием. Это можно сделать, выделяя для каждого компонента отдельное подсостояние.

Делать это вручную уже на втором компоненте станет больно, поэтому можно автоматически выделять место в стейте под каждый инстанс компонента. Компонент должен предоставлять начальный стейт, поэтому удобнее использовать другое название, например, модуль (который принимает View слой и его состояние). При первом рендере (вызове функции) проверяем, пустой ли стейт и если пустой, инициализируем его.

> Возможно проблема коллизии имен. Но ее можно решить, запоминая id в каком-нибудь массиве и при использовании одного имени в разных местах, выкидывать ошибку.

Так же помимо инициализации локальной области в глобальной стейте нужно позаботиться, чтобы экшен изменял именно свой локальный стейт, а не соседнего инстанса. А подписки на уровне таких модулей вообще отказываются работать, так как они запускаются на глобальном уровне приложения.

Исходных код можно посмотреть в репозитории [здесь](https://github.com/noveogroup-amorgunov/hyperapp-starter/blob/main/src/core/module.tsx) (а пример модуля [здесь](https://github.com/noveogroup-amorgunov/hyperapp-starter/tree/main/src/modules/Counter)). Для использования нужно вручную передать path в стейте через свойство `id`:

```jsx
export const View = () => (state: AppState) => {
  return (
    <main>
      <Counter id="__foo__" />
      <Counter id="__bar__" />
      <br />
      <pre>
        <code>{JSON.stringify(state, null, '  ')}</code>
      </pre>
    </main>
  );
};
```

<img
  class="lazyload"
  alt="Пример работы stateful модуля"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/10.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/10.gif"
/>

В итоге получаем на каждый инстанс свой подстейт с указанным путем через свойство `id`.

## Что дальше

Сам я собрал пару приложений, например, UI для написания постов в телеграмме:

<img
  class="lazyload"
  alt="Пример готового приложения на Hyperapp"
  src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/9.min.png"
  data-src="/assets/images/2021-09-06-web-app-prototype-on-hyperapp/9.gif"
/>

Могу сказать, что очень не хватает хуков (не думал, что я когда-нибудь буду по ним так скучать), а если быть точнее - `useState`. Если вынести обсуждение на уровень выше, то не хватает локального состояния компонентов. Далее, ограниченный набор связанных библиотек и как я уже выше упомянул, неидеальные TypeScript тайпинги. Но для простых приложений подходит, и даже необычно, что уровень кода одновременно очень близок к React-у и к нативному.

Дальше можете заглянуть на [https://github.com/jorgebucaran/hyperawesome](https://github.com/jorgebucaran/hyperawesome), где собраны различные материалы, туториалы и библиотеки из экосистемы.

Еще материал по теме:

- [Hyperapp V2 in Under 5 Minutes](https://medium.com/@NickDodson/hyperapp-v2-in-under-5-minutes-7e9fa49f7f5)
- [A Walk through Hyperapp 2](https://medium.com/hyperapp/a-walk-through-hyperapp-2-b1f642fca172)
- [Официальный туториал](https://github.com/jorgebucaran/hyperapp/blob/main/docs/tutorial.md)

А дальше - больше, в следующем материале соберем приложение на TypeScript и esm-модулями, используя Superfine (View-слой из Hyperapp, о библиотеке я упоминал в посте [о создании своего Virtual DOM](https://amorgunov.com/posts/2020-08-03-create-own-virtual-dom/)) и **не используя сборщиков**! На практике особо не применимо, но по ходу разберем много чего интересного. Чтобы не пропустить пост, подписывайтесь на [телеграмм канал](https://t.me/amorgunov), где я анонсирую все посты в блоге.
