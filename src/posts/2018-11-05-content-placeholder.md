---
title: "Использование техники content placeholder"
description:
date: 2018-11-05
time: 4
tags:
  - content-placeholder
  - react
  - javascript
  - ux
  - spa
layout: layouts/post.hbs
likes: 6
---
Сегодня я хочу рассказать о довольно интересном подходе, который называется **content placeholder**.
Порой возникает ситуация, когда нужно подгрузить какие-нибудь данные на страницу. В этом период времени пользователю необходимо ждать какое-то время.
Но мы можем уменьшить это ощущение ожидания. Как? Предоставляя пользователю некое представление о том, как будет выглядеть страница,
когда контент подгрузится.

В конце у нас получится что-то типо такого:

<img
    class="lazyload"
    src="/assets/images/2018-11-05-content-placeholder/2.min.png"
    data-src="/assets/images/2018-11-05-content-placeholder/2.png" />

Этот способ намного лучше обычного спиннера, потому что он показывает сразу, как будет располагаться контент. Это так же отлично подходит для *offline first* приложений.
И еще один аргумент за использование этого подхода, его сейчас используют все: ютуб, инстаграм, фейсбук, медиум, вайбер, можно перечислять и перечислять.

Типичная реализация на одном из веб-приложений, в котором я принимал участие:

<picture>
    <source data-srcset="/assets/images/2018-11-05-content-placeholder/1.webp" type="image/webp">
    <source data-srcset="/assets/images/2018-11-05-content-placeholder/1.gif" type="image/gif">
    <img
        class="lazyload"
        src="/assets/images/2018-11-05-content-placeholder/1.min.png"
        data-src="/assets/images/2018-11-05-content-placeholder/1.gif">
</picture>

Или можете перейти в этом блоге на главную, а потом на какой-нибудь еще не загруженный пост, и увидите тот же самый эффект.

Перейдем сразу к реализации: реализации на *react* и *typescript*.
Начнем с компонента `Rect` (Rectangle, *прямоугольник*), который будет просто рисовать прямоугольник, все просто.

*Библиотека `b_` используется для формирования классов, согласно методологии [BEM](http://getbem.com/).*

```typescript
import React, { StatelessComponent } from 'react';
import b from 'b_';
import './rect.css';

const class_ = b.with('rect');

interface RectProps {
    type?: string;
    width?: number | string;
    height?: number | string;
}

const Rect: StatelessComponent<RectProps> = (props: RectProps) => {
    const { width, height, type = 'default' } = props;

    return (
        <div style={ { width, height } } className={class_({ type })} />
    );
};

export default Rect;
```

Обычный функциональный компонент, который принимает ширину, высоту и тип блока.

Перейдем к css. Добавам немного анимации и два различных типа: *default* - по умолчанию и
*black* - более темный вариант, который будет использоваться как плейсхолдер для заголовков.

```css
.rect { animation: reсt-pulse 1.5s infinite; }
.rect_type_default { background: #e6e6e6; }
.rect_type_black { background: #aaa; }

@keyframes reсt-pulse {
  0% { opacity: .6; }
  50% { opacity: 1; }
  100% { opacity: .6;}
}
```

По сути, это все, что нужно. Мы на своих проектах используем подход, в котором для каждого
компонента кладем рядом компонент заглушку (`*.stub.ts`):

<img
    class="lazyload"
    src="/assets/images/2018-11-05-content-placeholder/3.min.png"
    data-src="/assets/images/2018-11-05-content-placeholder/3.png" />

Компонент заглушка выглядит подобным образом (результатом будет скриншот в начале статьи):

```typescript
const ComponentStub: StatelessComponent = () => {
  return (
    <div className="stub-container">
      <Rect height="50px" type="black" />
      <Rect height="18px" width="200px" />
      <Rect height="18px" />
      <Rect height="18px" />
      <Rect height="18px" />
      <Rect height="18px" />
      <Rect height="18px" />
      <Rect height="18px" />
    </div>
  );
}
```

И стили для контейнера:

```css
.stub-container {
  display: flex;
  flex-direction: column;
}

.stub-container > .rect {
  margin: 5px;
}
```

В основном компоненте в пропсах приходит параметр `isLoading`, по которому и отрисовываем content placeholder.
Поиграться можете в [онлайн песочнице codesandbox](https://codesandbox.io/s/q9mko75rzq).

```typescript
render() {
    const { isLoading } = this.props;

    if (isLoading) {
        return <ComponentStub />;
    }

    return (...);
}
```

> Хинт: Если нужно отрендерить несколько одинаковых карточек, то можно в компонент-заглушку передавать свойсто `itemsCount`, а внутри создавать массив с использованием `Array.fill` и с помощью `map` рендерить нужное количество заглушек:

```typescript
<ComponentStub itemsCount={5} />
/* ... */
render() {
    const items = Array(this.props.itemsCount).fill(0);

    return items.map(...)
}
```

Основная сложность в том, чтобы заглушки были похожи на основной контент.
Когда то видел даже онлайн решения, которые по скриншоту могут создать разметку для плейсхолдеров или подобрать высоту и отступы, но к сожалению, сейчас не нашел ни одного рабочего варианта.
Так же вы можете посмотреть в сторону готовой библиотеки [buildo/react-placeholder](https://github.com/buildo/react-placeholder), у которой куча разных возможностей или [zalog/placeholder-loading](https://github.com/zalog/placeholder-loading).

В итоге, это довольна простая техника, используя которую вы сможете сделать ваши веб-приложения более отзывчивыми.

На сегодня все, до связи!
