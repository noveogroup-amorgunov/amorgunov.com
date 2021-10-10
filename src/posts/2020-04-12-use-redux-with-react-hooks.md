---
title: "Стоит ли использовать Redux с React Hooks"
date: 2020-04-12
time: 5
featuredImageThumbnail: "/assets/images/2020-04-12-use-redux-with-react-hooks/preview.png"
description: "Перепишем компонент на хуки с использованием react-redux и посмотрим на достоинства и недостатки"
tags:
  - react
  - redux
  - hooks
layout: layouts/post.njk
likes: 156
---

> Уже много материалов написано по этой теме, во всяком случае в англоязычном сообществе, но мало где рассматривается честное сравнение между использованием connect и хуками, чем сегодня мы и займемся.

Хайп уже почти закончился: одни прониклись философией хуков и используют их везде, другие еще не дошли до их использования, а есть и те, кто попробовал и решил, что эта концепция не для него. Но глупо спорить, React Hooks все больше и больше внедряются в экосистему реакта. Если у вас есть библиотека на реакте и в ней нет хуков, то что-то здесь не так. Документация многих пакетов переписывается на примеры с использованием хуков как основной способ использования (*formik*, *react-dnd*). На мой взгляд, это дело времени, пока все не начнут использовать хуки, пусть даже неявным образом.

[React-redux](https://react-redux.js.org/), начиная с версии 7.1 добавили долгожданную поддержку хуков. На самом деле это произошло давно, но в своем проекте я решил на днях посмотреть, насколько будет удобно их использовать. Внедрение хуков означало, что теперь можно избавиться от `connect` (компонента высшего порядка) и использовать Redux внутри функциональных компонентов.

В посте рассмотрим, как начать использовать React Hooks с редаксом, какие могут возникнуть проблемы и постараюсь ответить на главный вопрос: "Стоит ли в своих проектах избавляться от `connect` в пользу хуков"?

## Что такое React Hooks

В реакте 16.8 появились хуки. Они позволили использовать такие вещи, как состояние, возможности методов жизненного цикла в функциональных компонентах, которые ранее были доступны только в компонентах на классах.

Например, у нас есть компонент со состоянием, написанный на классе:

```js
class AwesomeComponent extends React.Component {
    state = {
        counter: 0,
    };

    onClick = () => {
        this.setState({ count: this.state.count + 1 });
    };

    render() {
        return (
            <div>
                <p>Count: {this.state.count}</p>
                <button onClick={this.onClick}>Add +1</button>
            </div>
        );
    }
}
```

Сейчас этот компонент может быть переписан на хуки, например, так:

```js
import { useState } from 'react';

function AwesomeComponent() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Add +1</button>
        </div>
    );
}
```

Думаю вы согласитесь, что код с хуками выглядит более лаконично. И он позволяет в функциональные компоненты добавлять фичи, ранее недоступные без переписывания компонента на класс. По хукам есть [отличная документация](https://ru.reactjs.org/docs/hooks-intro.html) на официальном сайте (на английском и русском языках), поэтому если хотите разобраться в них, рекомендую к прочтению.

## Как использовать Redux с хуками

На самом деле очень просто! В библиотеки react-redux есть уже готовые `useSelector` и `useDispatch`, которые можно использовать вместо коннект.

[`useSelector`](https://react-redux.js.org/api/hooks#useselector) - это аналог `mapStateToProps`. Хук принимает на вход селектор - метод, который принимает *redux state* и возвращает из него необходимые данные.

[`useDispatch`](https://react-redux.js.org/api/hooks#usedispatch) - замена для `mapDispatchToProps`, только в довольно упрощенном виде. Хук возвращает *dispatch* метод из редакса, с помощью которого можно диспатчить экшены. С одной стороны это избавляет нас от *action creators*, с другой - ломает уже принятую парадигму не использовать *dispatch* напрямую.

У меня сразу возник вопрос, зачем мне нужен *dispatch*, если у меня есть заготовленные *action creators*. В документации я увидел следующее:

<img
    class="lazyload"
    alt="Хук useActions"
    src="/assets/images/2020-04-12-use-redux-with-react-hooks/1.min.jpg"
    data-src="/assets/images/2020-04-12-use-redux-with-react-hooks/1.jpg">

Как оказалось, изначально хук `useActions` был добавлен в альфу, но потом его выпилили из-за комментария Дена Абрамова ([раз](https://github.com/reduxjs/react-redux/issues/1252#issuecomment-488160930), [два](https://github.com/facebook/create-react-app/issues/6880#issuecomment-488158024)). Ден сказал о том, что паттерн *action creators as a props* добавляет лишние абстракции и сложность в мире хуков и привел хороший пример:

> You don't `useFunction(sum, 2, 2)` to obtain a `boundSum` and then call `boundSum`. You just call `sum(2, 2)`. This is the same.

Что ж, раз автор редакса сказал, не использовать *bindActionCreator*, не будем. Но в ознакомительных целях хук *useActions* может выглядеть следующим образом:

```js
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

export function useActions(actions, dependencies = []) {
    const dispatch = useDispatch();

    return useMemo(
        () => actions.map(a => bindActionCreators(a, dispatch)),
        [dispatch, ...dependencies]
    );
}
```

В любом случае давайте перепишем компонент с `connect` на хуки. Первоначально компонент может выглядеть так:

```js
import React from 'react';
import { connect } from 'react-redux';
import { incrementCount } from './store/counter/actions';

export function AwesomeReduxComponent(props) {
    const { count, incrementCount } = props;

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={incrementCount}>Add +1</button>
        </div>
    );
}

const mapStateToProps = state => ({ count: state.counter.count });
const mapDispatchToProps = { incrementCount };

export default connect(mapStateToProps, mapDispatchToProps)(AwesomeReduxComponent);
```

Теперь, с хуками это может выглядеть вот так:

```js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { incrementCount } from './store/counter/actions';

export const AwesomeReduxComponent = () => {
    const count = useSelector(state => state.counter.count);
    const dispatch = useDispatch();

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => dispatch(incrementCount())}>Add +1</button>
        </div>
    );
};
```

Выглядит более просто, чем с использованием функции `connect`, *props* компонента не смешиваются со свойствами из редакса. Также большое преимущество, что теперь не нужно оборачивать свои компоненты в HOC-и, тем самым избавляясь от *connect hell*:

<img
    class="lazyload"
    alt="connect hell"
    src="/assets/images/2020-04-12-use-redux-with-react-hooks/4.min.jpg"
    data-src="/assets/images/2020-04-12-use-redux-with-react-hooks/4.jpg">

Каждый компонент, который использует *redux*, оказывается обернут в `Connect(ComponentName)`, тем самым увеличивая глубину дерева с компонентами.

В [документации](https://react-redux.js.org/api/hooks) хорошо описаны доступные хуки, рекомендую почитать.

## Redux hooks против connect

Преимущества хуков в рамках редакса мы уже рассмотрели, теперь поговорим о недостатках. На самом деле некоторые *gotchas* описаны в документации в разделе [usage warnings](https://react-redux.js.org/api/hooks#usage-warnings):

 - `useSelector` использует по умолчанию строгое равенство для сравнения объектов, которые возвращает селектор (из-за этого в случае возврата нового объекта компонент постоянно будет перерисовываться) и нужно использовать свой метод для сравнения. Или можно написать свой хук:

 ```js
import { useSelector, shallowEqual } from 'react-redux';

export function useShallowEqualSelector(selector) {
    return useSelector(selector, shallowEqual);
}
```

И использовать его:

```js
export const AwesomeReduxComponent = () => {
    // Хук необходим, если селектор возвращает новый объект
    const { count } = useShallowEqualSelector(state => {
        count: state.counter.count;
    });
    const dispatch = useDispatch();

    return <div />;
};
```

- К тому же, в отличие от `connect`, хук `useSelector` не предотвращает повторный ререндер компонента, когда перерисовывается родитель, даже если пропы не изменились. Поэтому для оптимизации стоит использовать *React.memo()*:

```js
export const AwesomeReduxComponent = React.memo(() => {
    // Хук необходим, если селектор возвращает новый объект
    const { count } = useShallowEqualSelector(state => {
        count: state.counter.count;
    });
    const dispatch = useDispatch();

    return <div />;
});
```

- При передаче *callback-a* с *dispatch* дочерним компонентам следует оборачивать метод в *useCallback*, что бы дочерние компоненты не рендерились без необходимости:

```js
export const AwesomeReduxComponent = React.memo(() => {
    // Хук необходим, если селектор возвращает новый объект
    const { count } = useShallowEqualSelector(state => {
        count: state.counter.count;
    });
    const dispatch = useDispatch();
    const onClick = useCallback(
        () => dispatch(incrementCount()),
        [dispatch]
    );

    return <div />;
});
```

Уже не выглядит так лаконично, не правда ли? На тестовом проекте у меня получилось следующее:

```js
function SneakersPage() {
    const { popular } = useSelector(getHomepage);
    const isLoading = useSelector(isLoadingSelector);
    const data = useSelector(getShoes);
    const dispatch = useDispatch();
    const fetchShoes = React.useCallback(
        slug => dispatch(fetchShoesActionCreator(slug)),
        [dispatch]
    );

    // ...
}
```

К компоненту добавилось 8 дополнительных строчек кода. Как это будет выглядеть в больших проектах, 20-30 дополнительных строчек кода? Думаю в этот момент захочется переписать все обратно. Но есть решение: в таком случае можно использовать композицию хуков - все хуки выносить в отдельный хук для компонента. Выглядеть это будет как-то так:

```js
function SneakersPage() {
    const {
        popular,
        isLoading,
        data,
        dispatch,
        fetchShoes
    } = useSneakersPage();

    // ...
}
```

К этим кейсам можно привыкнуть, найти ответы на *stackoverflow и использовать хуки для редакса. Но все они убивают простоту и понятность кода.

Есть еще несколько моментов:

- **Усложнение тестирования**. Для тестирования компонента придется всегда создавать стор и оборачивать компонент в *ReduxProvider*, т.е. придется писать интеграционные тесты. В случае с *connect*, мы можем экспортировать компонент и тестировать его независимо.

- **Нарушение принципа единой ответственности**. Компонент становится ответственным за слишком многое, тем самым становится более сложным. Дядюшка Боб будет недоволен.

- **Дебаг**. В своем тестовом приложении я могу изменять значения пропсов компонента в *dev tools* (которые приходят из *connect-a*) и смотреть, как компонент будет выглядеть в таком случае. Например, ниже, я меняю проп `isLoading` и элементы с кроссовками меняются на заглушки:

<img
    class="lazyload"
    alt="Изменение свойств у компонента"
    src="/assets/images/2020-04-12-use-redux-with-react-hooks/2.min.jpg"
    data-src="/assets/images/2020-04-12-use-redux-with-react-hooks/2.gif">

Как дела с хуками? С хуками у нас следующая картина:

<img
    class="lazyload"
    alt="Неинформативная информация о хуках"
    src="/assets/images/2020-04-12-use-redux-with-react-hooks/3.min.jpg"
    data-src="/assets/images/2020-04-12-use-redux-with-react-hooks/3.jpg">

К сожалению, нет возможности просматривать текущие значения и изменять их как пропсы. Есть только понимание, что используются три *useSelector* и *useDispatch*. Как воркэраунд, можно вынести хуки в компонент высшего порядка, но в таком случае смысл использования хуков пропадает.

## Итого

*React Hooks* - это крутая фича, которая добавила в реакт возможности по использованию функциональных компонентов, которые ранее были невозможными, делая код проще и лаконичнее. Сообщество движется к использованию функциональных компонентов и хуков, когда это возможно.

Но что касается Redux, то я придерживаюсь мнения, что с хуками код выглядит сложнее. Нарушается принцип единой ответственности, сложнее тестировать и дебажить компоненты. Если вынести хуки в отдельный компонент, то получится тот же самый connect, но без дополнительных полезных обработчиков для оптимизации перерендеров.

Это лишь мое мнение, и попробовать хуки в этом кейсе определенно стоит. Возможно, через время я переосмыслю это и напишу новый пост, что я был не прав, но не сейчас.

### Ссылки по теме

- [Официальная документация по хукам](https://ru.reactjs.org/docs/hooks-intro.html)
- [Как context и хуки могут заменить redux](https://blog.logrocket.com/use-hooks-and-context-not-react-and-redux/)
- [Как тестировать хуки с редаксом](https://medium.com/better-programming/unit-testing-react-redux-hooks-ce7d69e1e834)
