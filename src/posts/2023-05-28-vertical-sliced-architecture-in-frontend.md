---
title: "Архитектура фронтенда на основе вертикальных слайсов"
date: 2023-05-28
description: "Обсудим подход вертикальных слайсов через технические слои во фронтенде"
featuredImageThumbnail: "/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/2-sliced-over-clean-architecture.out.jpg"
tags:
  - architecture
  - frontend
  - feature-sliced
  - react
  - redux
likes: 0
---

Добрый день, друзья. Сегодня поговорим о сложном простыми словами - об архитектуре. Сразу предупрежу о трех моментах:

1. Мы не будем сегодня говорить о микрофронтендах. Последнее время это очень хайповое направление, но мы обсудим более концептуальные вещи, которые в том числе актуальны и для микрофронтов.

2. Ниже я буду употреблять термин *features* (фичи), который никак не связан с одноименным слоем из методологии *feature-sliced*.

3. В примерах будем использовать *React* и *Redux*, как самые (имхо) популярные на сегодняшний день решения, чтобы материал был понятен большой части читателей. Каких-то специфичных вещей не будет, так что если вы пишите на *Vue*/*Svetle*/*Solid*, проблем с пониманием концепций возникнуть не должно.

<hr class="apple-divider" />

Удивительно, что фронтенду, как самостоятельному направлению разработки, уже более 10 лет, если за старт считать начало бурного роста SPA, и целых 28 лет, если считать со дня появления JavaScript-а. Но до сих пор нет универсальных паттернов и подходов для построения архитектуры приложений. Точнее они есть, но каждое приложение - уникальное. Я работал на многих проектах (небольших, больших и очень больших), которые маинтейнили сильные (иногда нет) разработчики. На большинстве из них применялись схожие подходы: построение архитектуры на основе фичей, попытка применять *Low Coupling* (низкая связанность) и *High Cohesion* (высокое зацепление), разделение компонентов на умные и глупые, композиция интерфейса на компоненты, DI. Но во всех не было четко описанных границ, как модули внутри приложения должны взаимодействовать друг с другом, и обычно получалась так называемая *спагетти*-архитектура.

Сегодня мы рассмотрим несколько подходов и выработаем типичный шаблон для архитектуры фронтенд приложений.

## С чего все начиналось

Структура первых* проектов была устроена на основе разделения по техническим слоям (пример shopping-cart в [redux/examples](https://github.com/reduxjs/redux/tree/master/examples/shopping-cart/src)). В таком подходе весь проект делится на слои (в случае использования react/redux, есть отдельные директории для Reducers, Actions, Selectors, общие директории для компонентов и контейнеров (умные компоненты) и т.д.

```treeview
src
├── actions/
├── api/
├── components/
├── constants/
├── containers/
├── pages/
├── reducers/
├── selectors/
└── index.js
```

Почему я рассказываю об этом подходе? Во первых, у такого подхода есть определенные границы между слоями, а не все смешано в куче - это уже лучше, чем ничего. А во вторых, до сих пор тысячи проектов начинаются именно с такой структуры проекта. И это хорошо работает пока проект маленький, но это максимально не расширяемая модель, особенно для бизнесовых приложений.

\* (на самом деле такой подход пришел с бекенда и использовался независимо от фреймворков и паттернов. *MVC*, *MVVM*, *React* с *Flux* - везде использовался подход с разлением на слои.

Даже с такой структурой было важное правило: **у слоев есть однонаправленный поток использования, и нельзя импортировать файлы из слоев, находящихся на уровне выше**:

```treeview
↓ page
↓ containers
↓ store (actions, reducers, selectors)
↓ api
↓ components
↓ constants
```

Страницы могут импортить код из всех модулей. Контейнеры (умные компоненты) - все, кроме, кода из страниц. А константы не могут импортировать ничего. Обычно это правило (не смотря на его важность) было зафиксировано на уровне договоренностей и не всегда выполнялось, но даже в таком виде оно сильно упрощало разработку в целом.

### Проблемы

С ростом проектов подход выше приводит к следующему:

- Неявные связи в рамках конкретных слоев: бизнес компоненты (ProductCard, UserProfile) смешиваются c UI компонентами (Link, Button) в *components*, одни *actions* начинают использовать другие, которые напрямую с ними не связаны, понять, какой компонент можно импортировать, а какой нельзя - становится нереально сложно;
- Даже для небольших продуктовых фичей приходится править код по всему проекту, так как он раскидан по разным слоям.

## «Vertical sliced» подход

Вместо того, чтобы думать о системе как о наборе технических слоев (*Reducers*, *Actions*, *Selector* и компонентов), приложение можно представить как набор фичей (*features*), объектов из предметной области нашего проекта.

Другими словами это называется **подходом вертикальных слайсов** (*slice*, их еще называют срезами, но для простоты я ниже буду употреблять только «слайс»). Подход подразумевает, что архитектура строится не вокруг технических слоев (*layer*), а поверх конкретных слайсов (бизнес фич) проекта. Например, в случае онлайн магазина - это корзина/заказ/товар, в случае чата - контакт/чат/сообщение, в случае github-а - репозиторий/ветка/коммит.

Мы берем любую архитектуру на основе слоев (здесь так же может подойти и n-tier, гексоганальная или чистая архитектура), удаляем границу между слоями и строим границы между слайсами:

<img
  class="lazyload inverting"
  alt="Пример слайсов поверх слоев"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/1-sliced-over-layer-architecture.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/1-sliced-over-layer-architecture.png"
/>

Сперва начали складывать по слайсам только слои, которые относятся к состоянию приложения (в контексте редакса: *Reducers*, *Actions*, *Selector*). Назвали это «Duck modular approach», а основые моменты описали в [github/ducks-modular-redux](https://github.com/erikras/ducks-modular-redux):

```treeview
src
├── api/
├── components/
├── constants/
├── containers/
├── ducks
│   ├── cart
│   │   ├── actions.ts
│   │   ├── reducer.ts
│   │   ├── selectors.ts
│   │   └── index.js
│   ├── product/
│   ├── ...
│   └── other/
├── pages/
└── index.js
```

Реальный пример можете посмотреть в одном из моих стареньких пет проектов [github/react-ssr-tutorial/src/store/ducks/catalog/*](https://github.com/noveogroup-amorgunov/react-ssr-tutorial/tree/master/src/store/ducks/catalog).

А после пришло понимание, что вертикальные слайсы можно применять не только для состояния, а на всех уровнях приложения:

```treeview
src
├── features
│   ├── cart
│   │   ├── api/
│   │   ├── components/
│   │   ├── containers/
│   │   ├── constants/
│   │   ├── ducks/
│   │   └── index.js
│   ├── product/
│   ├── ...
│   └── other/
├── pages/
└── index.js
```

Добавляя или изменяя фичу в приложении, обычно затрагивается множество технических слоев. Например, при добавлении промокодов в корзину (*cart*), нужно поменять пользовательский интерфейс, добавить поля в интерфейс модели, изменить проверки и так далее. Вместо изменений по всему приложению и связями между слоями, вертикальные слайсы позволяют работать в контексте самого слайса.

На выходе **получаем высокое зацепление (*high cohesion*) внутри слайса и низкую связанность (*low coupling*) между разными слайсами** (противоположную модель из первой архитектуры).

Любая новая продуктовая фича не будет затрагивать написанный код чужих модулей, и не нужно переживать по поводу возможных сайд эффектов. А рефакторинг текущих - только связанные слайсы. Круто, не так ли?

Например, нужно загрузить список с товарами или отменить заказ: все эти пользовательские истории будут реализовываться в рамках конкретной фичи.

<img
  class="lazyload inverting"
  alt="Пользовательские истории в контексте слайса"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/3-user-cases-in-slices-context.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/3-user-cases-in-slices-context.out.jpg"
/>

### Что с чистой архитектурой?

В этом разделе я не могу не порекомендовать одну из лучших статей (если не лучшую) про чистую архитектуру во фронтенде: [https://bespoyasov.ru/blog/clean-architecture-on-frontend](https://bespoyasov.ru/blog/clean-architecture-on-frontend/). Саша Беспоясов проделал огромную работу и очень подробно расписал, как чистую архитектуру можно встроить во фронтенд, чтобы ее можно было применять на реальных проектах.

У Саши получилась следующая структура проекта ([https://github.com/bespoyasov/frontend-clean-architecture/tree/master/src](https://github.com/bespoyasov/frontend-clean-architecture/tree/master/src)):

```treeview
src
├── application/
├── domain/
├── lib/
├── services/
├── ui/
└── index.jsx
```

И она так же отлично сочитается с вертикальными слайсами (*):

<img
  class="lazyload inverting"
  alt="Пример слайсов поверх слоев чистой архитектуры"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/2-sliced-over-clean-architecture.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/2-sliced-over-clean-architecture.out.jpg"
/>

```treeview
src
├── features
│   ├── cart
│   │   ├── application/
│   │   ├── domain/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── ui/
│   │   └── index.js
│   ├── product/
│   ├── ...
│   └── other/
├── pages/
└── index.js
```

\* Далее будет расширенный пример с *domain*.

### Что с общим кодом?

На любом проекте есть код, не связанный с бизнес фичами напрямую: общие хелперы, UI компоненты (кнопки, формы, лайаут) или глобальное shared-состояние, которые используются во многих фичах одновреммено. А так же различные инфраструктурные вещи (работа с конфигами, переводами, нотификациями и т.д.). На этот случай выделяют специальную директорию *shared*, в которой все и складируют. Для того, чтобы это папка не превращалась в *мусорку*, она может иметь те же название поддиректорий, что и любой слайс из фич (api, компоненты, контейнеры, *даки* и т.д.):

```treeview
src
├── features/
├── pages/
├── shared
│   ├── api/
│   ├── components/
│   ├── store/
│   ├── ...
│   └── other/
└── index.js
```

> Глобальное shared-состояние - это кстати антипаттерн, но его часто можно встретить в боевых проектах

Уже здесь можно заметить, что у нас опять вырисовывается структура проекта на верхнем уровне на основе технических слоев, а в внутри каждого слоя код разделен на вертикальные слайсы (за исключением *shared*).

### Важное правило

Для вертикальных слайсов сохраняется однонаправленный поток импортов внутри самих слайсов. А так же добавляется новое правило: **фичи не могут напрямую использовать друг друга**. Если нужно использовать какие-нибудь данные/UI из соседней фичи, то можно использовать DI или паттерн *render-prop*, когда мы можем прокинуть зависимость снаружи (например, со страницы).

Это позволяет держать фичи максимально изолировано друг от друга (так называемая модульная архитектура), решить проблемы циклических импортов и следовать подходу *high cohesion* - *low coupling*.

### Как работать c глобальным стором в Redux

В *Redux*, в отличии от *MobX* или *effector*, есть общий глобальный стор, в котором будут хранится данные всех фич. 

Это могло бы быть проблемой, если у нас не было *Redux-Toolkit*, который позволяет создавать изолированные подсторы, и *combineReducers*, который по сути нужен только для объединения всех редьюсеров (аналог *RootStore* в *MobX*). Поэтому технически мы храним все в одном месте, но в коде конкретной фичи работаем со стором только этой фичи:

```ts
// src/features/user/store/slice.ts

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {/*...*/},
})
```

И собираем все фичи в одном месте:

```ts
// src/store.ts

const rootReducer = combineReducers({
  [userSlice.name]: userSlice.reducer,
  // ...
})
```

> На одном из проектом мы для фичей писали автоматическую генерацию подстора для каждого инстанса фичи и переопределяли `useSelector`, чтобы невозможно было залезть в сторы других фичей (кроме *shared*).

## Что такое фича?

С подходом выше все хорошо до тех пор, пока наши фичи не становятся сильно масштабными и не понятно, куда складывать тот или иной модуль (внутрь конкретной фичи или создать отдельную). Поэтому вопрос, а каких размеров должны быть фичи (и что они из себя вообще должны представлять) - очень правильный вопрос.

На примерах выше мы в качестве фич рассматривали большие бизнес-сущности приложения (корзина, товар, заказ). На одном из проектов у нас было именно такое разделение, и некоторые фичи со временем стали очень монструозными. По сути нашу фичу можно было бы разделить на много более мелких фич, у которых так же может быть свое состояние, API ручки и UI. Например `productPopuparSlider`, `productAlreadyPurchasedGrid`, `productFavoriteList` и т.д.

```treeview
src
├── features
│   ├── product
│   │   ├── (?) productDetails/
│   │   ├── (?) productAlreadyPurchasedGrid/
│   │   ├── (?) productFavoriteList/
│   │   ├── (?) productPopuparSlider/
│   │   ├── (?) productListFilters/
│   │   ├── (?) productListSorting/
│   │   ├── (?) productListViewMode/
│   │   ├── store
│   │   ├── components
│   │   ├── ...
│   │   └── other/
│   ├── ...
│   └── other/
├── pages/
├── shared/
└── index.js
```

По идеи все эти фичи стоит вынести на внешний уровень (директория *features*). Но все они завязаны на данные соответствующих бизнес фичей (фичи из кода выше завязаны на стор и API *product*). Что можно сделать? Можно положить *product* в shared, но тогда мы опять возвращаемся к неявным связям и смешения бизнес сущностей с остальным кодом...

### «Фича драйвен девелопмент»

Давайте на время забудем о том, что мы обсуждали ранее, и рассмотрим фичи с другой стороны. Я уверен, что все, кто когда то занимался архитектурой, приходит к следующему заключению: весь интерфейс можно разбить на самостоятельные модули (более высокоуровневые, чем просто компоненты или контейнеры), которые можно переиспользовать и которые содержат свою бизнес логику. Такой подход даже получил название - *feature driven development* (именно в рамках фронтенд разработки, так как есть еще одноименная методология в менеджменте) и он успешно применяется на многих проектах, в которых я работал.

Таким фичам обычно выставляют следующие требования:

- Изоляция (*self-contained*) - содержит внутри себя все необходимое для работы
- Ориентация на пользователя (*user-facing*) - направлена на какую-то пользовательскую потребность (сделать действие, показать информацию и т.д.)
- Переиспользуемость (*reusable*) - может быть переиспользована на различных страницах
- Сложная логика (*complex logic*) - сложнее чем обычный компонент или контейнер (более высокий уровень абстракции)

Давайте рассмотрим пример модуля, который выводит детальную информацию о продукте - *productDetails*.

<img
  class="lazyload"
  alt="Интерфейс модуля детальной информации и продукте"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/7-product-details.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/7-product-details.out.jpg"
/>

У этого модуля может быть свой запрос в API, свое состояние (загружаются данные, была ли получена ошибка), свой UI (общая сетка, изображения, доступные пользователю действия, доступные размеры и т.д.). Он ориентирован на пользователя (предоставляет детальную информацию о товаре). Его можно переиспользовать в различных местах: на отдельной странице или внутри какого-нибудь модального окна. Все требования выполнены - это фича.

Все приложение может состоять из таких вот фичей:

<img
  class="lazyload"
  alt="Разбиваем интерфейс на фичи"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/6-product-details-in-features-slice.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/6-product-details-in-features-slice.out.jpg"
/>

Но как объединить этот паттерн фичей со структурой проекта из прошлых разделов? Здесь нам поможет простое правило - не хватает уровня композиции для слоев, вводим новый слой!

## Новый слой - «Domain»

Для решения проблемы можно ввести еще один слой, в котором складывать все бизнес сущности (корзина, товары, пользователь и т.д.). Этот слой не что-то новое, а давно известное понятие из чистой архитектуры и DDD - домен приложения. **Под ним понимают те бизнес сущности, которые описывают предметную область приложения**. Простая аналогия (но не совсем правильная) - в домене можно хранить все то, что хранится в базе данных на бекенде.

Правда мы немного отойдем от канонов чистой архитектуры и помимо самих сущностей (типов и преобразований данных) будем хранить базовые UI (все же у нас фронтенд и все сильно завязано на UI), походы в API (например, получение информации о текущем пользователе), *TypeScript* типы, состояние и т.д.

А в `features/*` мы будем складывать наши *self-contained* модули:

```treeview
src
├── domain
│   ├── product
│   │   ├── api/
│   │   ├── components/
│   │   ├── store/
│   │   ├── ...
│   │   └── other/
│   ├── ...
│   └── other/
├── features/
│   ├── productDetails/
│   ├── productAlreadyPurchasedGrid/
│   │   ├── api/
│   │   ├── components/
│   │   ├── store/
│   │   ├── ...
│   │   └── other/
│   ├── productFavoriteList/
│   ├── productPopuparSlider/
│   ├── productListFilters/
│   ├── productListSorting/
│   ├── productListViewMode/
│   ├── ...
│   └── other/
├── pages/
├── shared/
└── index.js
```

> Кстати фичи можно группировать по префиксу в названии (чтобы не увеличить вложенность). Например, все что касается товаров, начинать с *product\**, корзины -  *cart\** и т.д.

### Пример, что может лежать в домене

Давайте рассмотрим в качестве примера, что может находится внутри домена (не забываем, что обсуждения идут в рамках фронтенд проекта). Есть какая-то фича со списком товаров:

<img
  class="lazyload"
  alt="Что может лежать в домене"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/8-domain-parts.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/8-domain-parts.out.jpg"
/>

Внутри списка используется карточка отображения, которая используется по всему приложению? Отличный кандидат для попадания в `domain/product/components/ProductCard.tsx`. Есть действие добавление в список желаний/корзину  - `domain/product/store/actions/*`. Как то форматируется цена - `domain/product/helpers/formatPrice.ts`. И так далее. Все, что используется универсально на уровне бизнес сущности по всему приложению (в различных фичах или страницах) можно вынести в слой `domain`.

<hr class="apple-divider" />

Теперь мы окончального вернулись к тому, с чего начинали - технические слои снаружи (*domain*, *features*, *pages*, *shared*). И на первый взгляд, ничего не изменилось. Однако, есть большее отличие - внутри каждого слоя (за исключением *shared*) используются вертикальные слайсы.

```treeview
↓ page
↓ features
↓ domain
↓ shared
```

## Коммуникация между фичами

Я уже кратко упоминал, как можно общаться между фичами, если одной фичи нужны данные или UI другой, но давайте рассмотрим этот пункт подробнее.

### UI

Для того, чтобы одна фича могла использовать другую, ее можно прокинуть в виде пропа. Такой подход называется слотами или,  *render prop*, если мы говорим в контексте реакта.

Давайте рассмотрим пример. Есть две фичи: *LayoutHeader* и *LayoutProfileCard*. Карточку профиля пользователя нужно использовать внутри хедера, но нельзя связывать компоненты между собой:

<img
  class="lazyload"
  alt="Пример использования фичи в фиче"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/9-using-feature-into-feature.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/9-using-feature-into-feature.out.jpg"
/>

Это можно сделать, создав рендер-проп `rightContentSlot` в *LayoutHeader*, который будет рендерить переданный в компонент контент. Т.е. *LayoutHeader* и *LayoutProfileCard* остаются изолированными фичами, ничего не зная друг о друге.

<img
  class="lazyload"
  alt="Место для рендер прода"
  src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/10-render-slot-example.min.png"
  data-src="/assets/images/2023-05-28-vertical-sliced-architecture-in-frontend/10-render-slot-example.out.jpg"
/>

В коде это может выглядить следующим образом. Сам компонент *LayoutHeader*:

```tsx
type Props = {
  rightContentSlot: ReactNode
}

function LayoutHeader(props: Props) {
  return (
    <header>
      <div className={css.right}>
        {props.rightContentSlot}
      </div>
    </header>
  )
}
```

И его использование вместе с *LayoutProfileCard*:

```tsx
function Layout() {
  return (
    <LayoutHeader
      rightContentSlot={<LayoutProfileCard />}
    />
  )
}
```

В другом месте (на другой странице) мы можем переиспользовать фичу `LayoutHeader` и передать в нее любой другой контент. Дополнительно можете почитать статью от Кента Доттса на эту тему: https://epicreact.dev/one-react-mistake-thats-slowing-you-down/ .

### Данные

В случае с редаксом и его глобальным стором, у нас всегда есть простой доступ к данным из других слайсов (подсторов).

```tsx
// Например мы находимся в LayoutHeader
// src/features/LayoutHeader/slice.ts

export const selectPopularProducts = (state: State) =>
// 👎 Используем данные из другой фичи
    state.popuparProducts.items
//        ^^^^^^^^^^^^^^^^^^^^^
```

Или в компоненте:

```tsx
function LayoutHeader() {
  // 👎 Используем данные из другой фичи
  const popularProducts = useSelector(
    state: State => state.popuparProducts.items
//                        ^^^^^^^^^^^^^^^^^^^^^
  )

  return (<div />)
}
```

Это плохо, так как используя данные таким образом, мы начнем связывать фичи между собой. Решение на самом деле аналогично UI - прокидывать нужные переменные через пропы:

```tsx
// Layout находится на уровне страниц
function Layout() {
  // 👍 Получаемся данные из другой фичи на уровне pages
  const popularProducts = useSelector(
    state: State => state.popuparProducts.items
  )

  return (
    <LayoutHeader
      popularProducts={popularProducts}
    />
  )
}
```

Здесь не совсем удачное название свойства, так как вряд-ли *LayoutHeader* нужен список с популярными продуктами. Поэтому в зависимости от ситуации, имя и тип пропа следует изменить.

<hr class="apple-divider" />

Если вы используете решение на основе мультисторов, которое живет отдельного от view-слоя (напримир, *MobX*), то отлично работает DI, что-бы *инжектить* нужные зависимости:

```ts
@Service()
class LayoutHeaderService {
  constructor(
    public popularProducts: PopuparProductsService
  ) {}
}
```

## Заключение

Обещал в начале рассказать простыми словами, но вышло все равно довольно сложно. В любом случае мы сегодня рассмотрели две важные концепции: вертикальные слайсы в разрезе технических слоев приложения и фичи как самостоятельные модули приложения. Какую бы вы архитекутуру не выбрали для своих проектов, всегда держите в уме эти подходы, которые сделают ваши проекты более гибкими к мастшабированию и рефакторингу.

### Бонус 1: Микрофронты

Обещал не говорить про них, но пару абзацев все же напишу. Полученная архитектура отлично масштабируется под микрофронтенды, обернув нашу структуру в еще один уровень вертикальных слайсов:

```treeview
packages
├── catalog
│   ├── domain/
│   ├── features/
│   ├── pages/
│   ├── shared/
│   ├── index.ts
│   └── package.json
├── navbar/
├── support/
├── ...
└── other-microfrontend
```

По сути получается монорепозиторий, где каждый слайс является отдельным микрофронтом и внутри каждого из них реализована архитектура, описанная раньше.

### Бонус 2: Есть ли что универсальное?

Мы с вами по шагам спроектировали архитектуру. И к счастью для нас, уже есть готовая методология, которая решает вопросы выше (и многие другие) за нас. Называется она [Feature-Sliced](https://feature-sliced.design/). Это архитектурная методология для фронтенда, которая говорит, как правильно должны быть расположены директории в проекте, а модули взаимодействовать друг с другом. Внутри себя FSD объединяет различные лучшие практики, часть из которых мы рассмотрели сегодня (вертикальные слайсы, чистая архитектура, low coupling high cohesion). На мой взгляд это лучшее, что сейчас есть на рынке, поэтому при проектировании нового проекта очень советую обратить на нее внимание. Я же планирую написать пару постов в ней в будущем, потому подписывайтесь [на телеграмм канал](https://t.me/amorgunov), чтобы не пропустить новый пост.

> Если вы пойдете знакомиться с методологией после прочтения данного поста, то имейте виду, слой *features*, рассмотренный выше, равен *widgets*, а *domain* - *entities*.

### Материл по теме

- https://ryanlanciaux.com/blog/2017/08/20/a-feature-based-approach-to-react-development/
- https://jimmybogard.com/vertical-slice-architecture/
- https://enterprisecraftsmanship.com/posts/cohesion-coupling-difference/
- https://feature-sliced.design/