---
title: "Lazy-loading изображений"
description:
date: 2018-10-10
time: 7
tags:
  - image
  - lazyload
  - javascript
  - optimization
layout: layouts/post.hbs
likes: 14
---
На одном из рабочих проектов я решил посмотреть сколько данных приходит на клиент при первой загрузке.
Для этого можно зайти во вкладку `Network` в девтулс, перезагрузить страницу со сбросом кэша и перейти в раздел `Image`.
Несмотря на то, что изображений на сайте немного, результаты были следующие:

<img
    class="lazyload"
    src="/assets/images/2018-10-10-image-lazy-loading/1.min.png"
    data-src="/assets/images/2018-10-10-image-lazy-loading/1.png" />

Из 1.6 мегабайт 69% процентов (1.1 мб) заняли изображения! По [состоянию изображений в http archive](https://httparchive.org/reports/state-of-images) средний размер картинок, которые загружаются на странице равняется ~ 800 кб и для каждой страницы делается 33 запроса за изображениями.
От изображений нельзя отказаться, но можно применять различные оптимизации, одну из которых мы сегодня и рассмотрим.
Мы рассмотрим **lazy loading** (ленивая загрузка) - технику, уже давно известную, которая позволяет откладывать загрузку ресурсов (в нашем случае изображений) до тех пор, пока ресурсы не понадобятся.

<p>
<picture>
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/2.webp" type="image/webp">
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/2.gif" type="image/gif">
    <img
        class="lazyload"
        src="/assets/images/2018-10-10-image-lazy-loading/2.min.png"
        data-src="/assets/images/2018-10-10-image-lazy-loading/2.gif">
</picture>
</p>
<div class="image-text">Мое удивление когда я это увидел, что js бандл в 5 раз меньше картинок</div>

Небольшая демка того, что мы будем сегодня реализовывать.
Сначала на страницу подгружаются маленькие превьюшки картинок (в простом случае, серые плейсхолдеры), а потом, когда пользователь доскролит до картинки, начинает загружаться оригинал.

<p>
<picture>
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/f.webp" type="image/webp">
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/f.gif" type="image/gif">
    <img
        class="lazyload"
        src="/assets/images/2018-10-10-image-lazy-loading/f.min.png"
        data-src="/assets/images/2018-10-10-image-lazy-loading/f.gif">
</picture>
</p>
<div class="image-text">Установлено намеренно медленное соединение, чтобы продемонстрировать процесс</div>

Изначально на страницу подгружены маленькие превьюшки, а по мере прокрутки, загружаются оригиналы.
Если пользователь не будет скролить страницу, содержащую изображения, пользователь никогда не увидит эти изображения. Так зачем их грузить?

## Суть подхода

Начнем с типичной html-разметки для изображения:

```html##1
<img src="image.png" />
```

Первый шаг - нужно предотвратить загрузку изображения - когда браузер видит атрибут src - он начинает загружать изображение.
И не важно, одно или тысяча изображений у вас на странице. Чтобы отложить загрузку, нужно поместить URL-адрес картинки в атрибут, отличный от src. Используем атрибут `data-src`:

```html##1
<img
    data-src="image.jpg"
    src="image-preview.jpg" />
```

Атрибут `src` пуст, следовательно, браузер не будет запускать загрузку изображения. В src можно положить превью изображения.
Главный вопрос, как сообщить браузеру, чтобы он загружал оригинал изображения? Есть два основных способа проверить, входит изображение во viewport (видимый фрагмент страницы) или нет.

## Загрузка изображений при скроле и ресайзе

Необходимо подписаться на события скрола, ресайза и изменения ориентации девайса.
Когда происходит одно из этих событий, нужно найти все изображения на странице, для которых мы решили отложить загрузку. Для идентификации таких изображений им можно добавить какой-нибудь определенный класс, например, `lazyload`.
Далее для каждого из изображений нужно сделать проверку, что они находятся во viewport. Если это так, то заменяем значение `src` из `data-src` и подписываемся на событие `onload` изображения.

Так только изображение загружено, удаляем класс `lazyload` у изображения. В момент, когда все изображения будут подгружены,
можно так же отписываться от событий, так как они больше не нужны (если конечно приложение не SPA).

> **Стоит обратить внимание**, что событие скрола вызывается довольно часто, и чтобы не ухудшить производительность, будем запускать проверку всех изображений с небольшой задержкой (не чаще 200мс).

Вот рабочий пример этого подхода:

```js
/* lazyload.js */

function throttle(func, timeout) {
    let inThrottle = false;

    return function() {
        const args = arguments;
        const context = this;

        if (!inThrottle) {
            inThrottle = true;
            func.apply(context, args);
            setTimeout(() => { inThrottle = false; }, timeout);
        }
    };
}

function lazyload() {
    const windowHeight = window.innerHeight;
    const images = document.querySelectorAll('img.lazyload');

    /* Оффсет нужен, что подгружать изображение немного раньше, чем оно появится во вьюпорте */
    const offset = 100;

    images.forEach(image => {
        const boundingRect = image.getBoundingClientRect();
        const yPosition = boundingRect.top - windowHeight;
        const yPositionBottom = boundingRect.bottom;

        /* Если вверх изображения находится в пределах 100px от низа viewport-а,
           и низ изображения находится в пределах 100px от верха viewport-а */
        if (yPosition <= offset && yPositionBottom >= -offset) {
            /* Заменяем содержимое src из data-src */
            if (image.getAttribute('data-src')) {
                image.src = image.getAttribute('data-src');
            }

            /* Ожидаем пока новое изображение не загрузится */
            image.addEventListener('load', function() {
                /* Удаляем lazyload класс */
                this.classList.remove('lazyload');
            });
        }
    });
}

const throttledLazyLoad = throttle(lazyload, 200);

document.addEventListener('scroll', throttledLazyLoad);
window.addEventListener('resize', throttledLazyLoad);
window.addEventListener('orientationChange', throttledLazyLoad);

/* Если изображение сразу оказалось во вьюпорте, то оно не будет загружено,
   пока не наступит одно из событий (пользователь не проскролит).
   Поэтому нужно вызвать метод для обработки этого кейса */
throttledLazyLoad();
```

Достаточно подключить этот файл в ваше навороченное приложении, и lazy loading успешно настроен!

```js
import './lazyload';
```

Либо воспользоваться библиотекой [Paul-Browne/lazyestload.js](https://github.com/Paul-Browne/lazyestload.js), которая делает тоже самое, но так же умеет обрабатывать атрибут srсset и тег picture.
<p>
<picture>
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/3.webp" type="image/webp">
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/3.gif" type="image/gif">
    <img
        class="lazyload"
        src="/assets/images/2018-10-10-image-lazy-loading/3.min.png"
        data-src="/assets/images/2018-10-10-image-lazy-loading/3.gif">
</picture>
</p>
<div class="image-text">Теперь вы можете лениво смотреть,<br>как загружаются ваши ленивые изображения</div>

**Важное замечание**: если у вас картинка на странице появляется динамически и сразу попадает по viewport, то она не будет подгружена до полной версии без явного вызова метода `lazyload`.

## Загрузка изображений c использованием Intersection Observer

Слово *intersection* переводится как *пересечение*, а *observer* — это *наблюдатель*, вы сами сможете догадаться что делает этот объект.

Intersection Observer - относительно новый интерфейс, который позволит легко обнаружить, находится элемент во вьюпорте или нет. Небольшая [выдержка из MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API):

> **Intersection Observer API** позволяет веб-приложениям асинхронно следить за изменением пересечения элемента с его родителем или областью видимости документа viewport.

Ниже приведен пример использования данного апи (как и в предыдущем шаге, мы добавляем класс для всех "ленивых" картинок).

```js
const images = document.querySelectorAll('img.lazyload');
const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const image = entry.target;

            image.src = image.getAttribute('data-src');
            image.classList.remove('lazyload');

            imageObserver.unobserve(image);
        }
    });
}, {
    rootMargin: '100px 0px 100px 0px',
    root: document.querySelector('.app')
});

images.forEach(image => imageObserver.observe(image));
```

Тут все очень просто. В экземпляр `IntersectionObserver` передаются 2 параметра, первый - коллбэк метод
со всеми наблюдаемыми элементами, второй - объект с настройками.

Параметр `root` задает элемент-контейнер, при пересечении элемента с границей которого будет вызываться переданный коллбэк.
По умолчанию это область, в которой находится viewport.
Параметр `rootMargin` позволяет расширять и сужать границы контейнера и использует синтаксис правила CSS для настройки параметров отступов (например, margin или padding).
В нашем случае мы увеличиваем верхнюю и нижнюю границы для обнаружения пересечения элемента с контейнером на 100px. Это значит, что пересечение произойдет когда элемент попадёт в область, которая на 100 пикселей ниже нижней (выше верхней) границы контейнера.

Когда API обнаруживает, что любой из элементов пересек контейнер, используя свойство `isIntersecting` (которое равно `true` при пересечении), проделываем тоже самое, что и в методе со скролом - url-адрес из атрибута `data-src` переносим в `src`.

Причина, по которой `Intersection Observer` является более крутым методом определения попадания элемента во вьюпорт над способами с использованием *onScroll + getBoundingClientRect()* заключается в том, что реализация определения выполняется не в основном потоке.
Не смотря на это, обратный вызов запускается в основном потоке!

Но куда без недостатков - у апи [не очень хорошая поддержка](https://caniuse.com/#feat=intersectionobserver) (не работает в safari и ie), но есть [полифилл](https://github.com/w3c/IntersectionObserver/tree/master/polyfill).

## Какие использовать плейсхолдеры

На самом деле тут очень много вариантов, поэтому тут лучше исходить от задачи и пожеланий заказчика.
На мой вкус есть несколько основных вариантов:

- Использовать плейсхолдеры одного цвета, например серые заглушки. Эта техника называется *content placeholder*, и применима не только для картинок, но и для всего контента.
- Использовать уменьшенные версии изображений или ужатые по качеству. Например, можно использовать библиотеки [imagemin](https://github.com/imagemin/imagemin) (для оптимизации) и [lovell/sharp](https://github.com/lovell/sharp) (для ресайза).

Ниже фотография, сделанная на iphone7, размером *1280х1280px*, которая весит 710kb. Используя imagemin (вместе с [imagemin/imagemin-jpegtran](https://github.com/imagemin/imagemin-jpegtran)) минимальной конфигурации
фотография стала весить **в 2.5 раза меньше** (250kb), практически не потеряв в качестве!

```js
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');

async function optimizeImages() {
    await imagemin(['images/*.(jpeg|png|jpg)'], 'build/images', {
        use: [
            imageminMozjpeg({ progressive: true, quality: 75 }),
        ]
    });
}
```

Сможете догадаться где оригинал, а где оптимизированная версия изображения?

<img
    class="lazyload"
    data-src="/assets/images/2018-10-10-image-lazy-loading/4.png"
    src="/assets/images/2018-10-10-image-lazy-loading/4.min.png" />

<img
    class="lazyload"
    data-src="/assets/images/2018-10-10-image-lazy-loading/5.png"
    src="/assets/images/2018-10-10-image-lazy-loading/5.min.png" />

Оригинал находится справа. А что, если изображение на странице будет занимать 400x200px (как на скриншоте выше)?
Добавим использовать *sharp* для ресайза изображения.

```js
use: [
    imageminMozjpeg({ progressive: true, quality: 75 }),
    buffer => sharp(buffer).resize(400, 200, { fit: 'cover' }).toBuffer()
]
```

Изображение стало весить **всего 25kb**!

<img
    class="lazyload"
    data-src="/assets/images/2018-10-10-image-lazy-loading/6.png"
    src="/assets/images/2018-10-10-image-lazy-loading/6.min.png" />

<div class="image-text">Видна потеря качества, но для превью заглушки<br />подходит идеально</div>

Для *imagemin* есть [webpack loader](https://github.com/milewski/imagemin-loader), поэтому можно за одно оптимизировать картинки во время фронэнд сборки.

---

Опция `progressive: true` дает еще один классный эффект, *jpeg* изображения становятся прогрессивными (почитать можно например статью на хабре [про прогрессивный jpeg](https://habr.com/post/165645/)).

Если кратко, браузер может отображать все изображение сразу в плохом качестве и потом подгружать его, а не грузить последовательно блоками (пример ниже):

<!--video loop autoplay src="/assets/images/2018-10-10-image-lazy-loading/7.webm"-->

<p>
<picture>
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/7.webp" type="image/webp">
    <source data-srcset="/assets/images/2018-10-10-image-lazy-loading/7.gif" type="image/gif">
    <img
        class="lazyload"
        src="/assets/images/2018-10-10-image-lazy-loading/7.min.png"
        data-src="/assets/images/2018-10-10-image-lazy-loading/7.gif">
</picture>
</p>
<div class="image-text">Два оптимизированных изображений, только слева - прогрессивное, справа нет.<br />Вес у изображений одинаковый, эмуляция fast 3g</div>

- И довольно интересный вариант, использовать библиотеку [zouhir/lqip](https://github.com/zouhir/lqip) (low quality image placeholder).
Библиотека генерирует супер маленькие плейсхолдеры в base64 (10x10px).

Как это выглядит?

<img
    class="lazyload"
    data-src="/assets/images/2018-10-10-image-lazy-loading/8.png"
    src="/assets/images/2018-10-10-image-lazy-loading/8.min.png" />
<div class="image-text">Прьвью картинка весит <strong>меньше одного килобайта</strong>!</div>

Подобные плейсхолдеры используются кстати на [медиуме](https://medium.com/). Разве не круто? Если в статье или новости есть 10 картинок, а после новости идет блок еще с 15 картинками, можно сэкономить пару тройку мегабайт.

Как и для *imagemin* есть свой [webpack lqip-loader](https://github.com/zouhir/lqip-loader).

---

*Добавлено 01.03.2019*: Так же совсем недавно Google запустили сервис [https://squoosh.app/](https://squoosh.app) - удобный инструмент для оптимизации изображений, которое подбирает самый оптимальный алгоритм сжатия. Приложение использует ресурсы компьютера и написано как PWA - т.е. будет работать даже без интернета.

## Заключение

В итоге я хочу добавить, как бы не была эта техника привлекательна, не стоит ее использовать для всех-всех изображений.
Например логотип или баннеры, которые пользователи увидят сразу, явно должны грузиться сразу. Если у вас немного графики, и она
оптимизирована, то возможно вам вообще не стоит заморачиваться с lazy loading.

Но если вы сможете внедрить эту технику на свой сайт с умом, то вы явно выиграете в производительности при загрузке, уменьшая общий размер страницы, благодаря откладываю загрузки ненужных ресурсов.

Так же всем советую посмотреть доклад Никиты Дубко про то, [как правильно показывать картинки пользователю](https://www.youtube.com/watch?v=EwBYOQwPEpY) и онлайн книжку [Essential image optimization](https://images.guide) от Эдди Османи (*на англ.*).

До связи!
