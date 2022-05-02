---
title: "Splash screen для загрузки данных"
date: 2022-05-01
time: 5
description: "Как ждать загрузки данных с помощью загрузочной страницы"
featuredImageThumbnail: "/assets/images/2022-05-01-splash-screen/preview.jpg"
tags:
  - frontend
  - splash
  - shortread
layout: layouts/post.njk
likes: 0
---

Поработав последние пол года над ReactNative проектом, я узнал много интересных практик, которые стандартны для мобильной разработки, но редко используются в вебе. Сегодняшняя небольшая заметка посвящена **Splash screen** (или загрузочному экрану). В контексте веба термин можно переименовать в загрузочную страницу, а не экран, без разницы.

Загрузочный экран показывается при старте приложение до тех пор, пока не будут подгружены и готовы к использованию все необходимые данные для работы. Такой экран есть абсолютно во всех нативных приложениях, вы его так же можете видеть в PWA. По умолчанию он используется для инициализации, но никто не мешает продолжить его использовать для подгрузки необходимых данных для запуска.

Какие данные нужны для запуска? Здесь все зависит от вашего проекта. Это может быть фичконфиг, проверка того, авторизован ли пользователь и получение его данных, получение данных о важных сущностях системы или так называемая аварийная заглушка на случай плановых (и не только) недоступностей проекта. На рабочем же проекте мы выполняем около 15-20 сетевых запросов до того, как пользователь что-либо увидит.

Например, на одном из пет-проектов я показываю сплеш экран до тех пор, пока выполняется несколько запросов за данными пользователя и только после показываю UI с профилем:

<img
  class="lazyload"
  alt="Пример splash экрана"
  src="/assets/images/2022-05-01-splash-screen/1.min.png"
  data-src="/assets/images/2022-05-01-splash-screen/1.gif"
/>

## Как реализовать технически

В реализации не должно возникнуть сложностей. Нужна сама страница (экран) и глобальный флаг, загружено ли приложение или нет (`appIsInited`). После загрузки всех необходимых данных достаточно сменить состояние флага и отрендерить основной интерфейс.

Код бизнес сценария загрузки может выглядеть подобным образом:

```ts
export async function initApp(dispatch: Dispatch<AppState>) {
  await Promise.all([
    laodAccidentModeStatus(),
    loadFeatureConfig(),
  ]);

  await Promise.all([
    loadUser(),
    loadSubscriptions(),
    loadProducts(),
    // ...
  ]);

  dispatch({ appIsInited: true });
}
```

## Где сплэш screen не подойдет?

Пользователи в вебе ~~зажрались~~ очень требовательны и требуют немедленной загрузки нужной им информации. Каждая дополнительная секунд ожидания приводит к тому, что пользователи уходят, так и не дождавшись загрузки. Показывая сплеш экран мы явно заставляем ждать, чего юзеры очень не любят.

Поэтому, если продукт напрямую зависит от времени открытия и нужно как можно быстрее что-нибудь показать пользователю, то стоит использовать другой паттерн, а именно «Placeholder UI», [о котором я писал несколько лет назад](https://amorgunov.com/posts/2018-11-05-content-placeholder/). Но с ним тоже нужно быть осторожным, потому что большое количество плейсхолдеров при первом показе интерфейса (которые часто еще смещают контент после загрузки) уменьшают отзывчивость интерфейс. Парадокс, так как изначально плейсхолдеры создавались именно для повышения отзывчивости.

Загрузочный экран не подойдет для новостных лент, веб-**сайтов**, интернет магазинов и т.д. Но идеально подходит для решений, которые прямо специализируются как веб-**приложения**. Например, этот блог залит на платформу https://netlify.com/ , которое при заходе в личный кабинет использует сплэш заглушку и после показывает полностью загруженный интерфейс.

## Что запомнить

**Splash screen** - это техника, при которой в приложении отображается специальный экран (или страница) при старте, пока загружаются данные для работы приложения.