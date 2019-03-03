---
title: "Что нового в es2019: Array.prototype.flat, Object.fromEntries"
description: Недавно стандарт ES2019 был окончательно утвержден, включая несколько новых фич. Все фичи уже реализованы в Chrome 73
date: 2019-02-08
tags:
  - nodejs
  - es2019
  - js
layout: layouts/post.njk
---
> Каждый год выходит новая версия [ECMAScript](https://tc39.github.io/ecma262/) с предложениями, которые официально уже готовы.
Это означает, что предложения, которые были приняты комитетом tc39 и достигли [stage 4](https://tc39.github.io/process-document/),
будут включены в спецификацию текущего года, а остальные - перенесены на следующий.

Недавно стандарт [ES2019](https://github.com/tc39/proposals/blob/master/finished-proposals.md) был окончательно утвержден, включая несколько новых фич.
Все фичи уже реализованы в Chrome 73, а самые интересные мы разберем далее.

<p><img src="/assets/images/2019-02-08-what-is-new-in-es2019/2019-02-08_13-09-11.png" /></p>

> **Если вы работаете на Node.js:** к сожалению, на момент написания статьи, нет версии Node.js, которая использовала бы V8 версии 7.3.
Последняя ночная сборка Node.js 12 еще использует V8 v7.1. Однако, большая часть фич (кроме `Object.fromEntries` и `Well-formed JSON.stringify()`) поддерживаются в V8 v7.0 (Можно пробовать в Node.js 11.6).


## Array.prototype.{flat,flatMap}

Как JavaScript разработчики, вы возможно слышали о *smoosh-gate*. У некоторых людей из tc39 появилась идея [переименовать](https://github.com/tc39/proposal-flatMap/pull/56) `flat` в `smoosh` и `flatMap` в `smooshMap`. 
Причиной этого был тот факт, что некоторые сайты, использующие довольно старую библиотеку MooTools (которая патчила свои методы), сломались бы. 

К счастью, это предложение не нашло поддержки, и нам не нужно использовать smoosh (переводится как *раздавливать*) вместо `flat`.
Эти методы доступны в Chrome v69 (V8 6.9) и  Node.js v11.

`Array.prototype.flat()` очень похож на функцию `_.flattenDepth()` из Lodash. Метод принимает в качестве аргумента массив массивов и *расплющивает* (сглаживает) вложенные массивы в массив верхнего уровня:

```javascript
console.log([[1, 2], [3, 4]].flat()); /* [1, 2, 3, 4, 5, 6] */
```

По умолчанию метод сглаживает только один уровень. Однако, можно передать аргумент `depth` (значение глубины) -  сколько уровней нужно сгладить:

```javascript
console.log([[[1, 2]], [[3, 4]]].flat()); /* [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ] */
console.log([[[1, 2]], [[3, 4]]].flat(2)); /* [1, 2, 3, 4, 5, 6] */
```

Новый метод `flatMap()` эквивалентен вызову `map()`, а следом - `flat()`. Это удобно, когда `map()` возвращает массив:

```javascript
const evenNumbers = [0, 2, 4];

const numbers = evenNumbers.flatMap(num => ([num, num + 1])); /* [ 0, 1, 2, 3, 4, 5 ] */

/* Тоже самое, но с использование map+flat */
const numbers = evenNumbers.map(num => ([num, num + 1])).flat();
```

Поскольку из коллбэка возвращается массив, `flatMap()` сглаживает его.

Одна из фишек ` flatMap()` заключается в том, что мы можем выполнить `filter()` и `map()` за один шаг.
Мы можем отфильтровать элемент, возвращая пустой массив, который потом "схлопнется":

```javascript
const numbers = [1, 2, 3, 4, 5];
const oddNumbers = numbers.flatMap(num => num % 2 === 0 ? [] : num); /* [ 1, 3, 5 ] */
```

<p>
<picture>
    <img
        class="lazyload"
        src="/assets/images/2019-02-08-what-is-new-in-es2019/1.min.gif"
        data-src="/assets/images/2019-02-08-what-is-new-in-es2019/1.gif">
</picture>
</p>
<div class="image-text">Когда понял, что можно делать еще более запутанный чейнинг</div>


## Object.fromEntries()

`Object.fromEntries()` предназначен для упрощения преобразования Map в объект:

```javascript
/* { hello: 'world', foo: 'bar' } */
Object.fromEntries(new Map([['hello', 'world'], ['foo', 'bar']]));
```

> Функция `Object.fromEntries()` на данный момент не поддерживается ни в одной из версий Node.js.
Но вы можете воспользоваться полифилом: [object.fromentries](https://www.npmjs.com/package/object.fromentries).

Приятный побочный эффект заключается в том, что есть возможность преобразовать массив пар ключ/значение в объект:

```javascript
/* { hello: 'world', foo: 'bar' } */
Object.fromEntries([['hello', 'world'], ['foo', 'bar']]);
```

Основное предназначение этой функции, это конвертирование Map в объекты, но для пар ключ/значения это тоже может быть полезно. Например можно получить из query-строки обычный объект:

```javascript
/* { foo: 'bar', baz: 'qux' } */
Object.fromEntries(new URLSearchParams('foo=bar&baz=qux'));
```

Или делать различные object-to-object трансформации полей:

```javascript
const collection = { alice: 32, bob: 16, mike: 40 };

/* { alice: 33, mike: 41 } */
Object.fromEntries(
    Object.entries(collection)
        .filter(([ key, val ]) => val < 30)
        .map(([ key, val ]) => [ key, val + 1 ])
);
```

## Optional Catch Binding

До этого предложения мы всегда были должны указывать переменную в `catch` для блока `try/catch` в независимости от того, используется она или нет:

```javascript
function parseJSON(text) {
    try {
        return JSON.parse(text);
    } catch(unusedVariable) {
        return null;
    }
}
```

*ES2019's optional catch binding* позволяет нам пропускать объявление переменной в `catch` вместе со скобками.
Эта фича доступна в Node.js v10 и Chrome v66.

```javascript
function parseJSON(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}
```

## Symbol Description Accessor
 
> [Symbols](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Symbol) - это тип данных, представленный в ES2015, помогающий избегать конфликтов между именами свойств.
Они могут быть использованы как идентификаторы для свойств объектов и гарантировать уникальный ключ.
В основном символы используются внутри движка JavaScript, потому что они не итерируемы и заведомо не сломают старый код, так как уникальны.

Во время создания символа (`Symbol`) можно указать описание, которое в дальнейшем можно использовать для отладки. В этом случае,
если мы хотим получить указанное описание, например, для восстановления `Symbol` или просто для логирования, мы должны
извлекать его из значения `toString`.

Предложенное решение добавляет новое свойство (только для чтения) `description`, которое возвращает описание Symbol:

```javascript
const symbol = Symbol('V8'); 
   
console.log(symbol.toString()); /* Symbol(V8) */
console.log(symbol.description); /* V8 */
```

---

Почитать про все изменения вы можете по ссылке (*год публикации: 2019*): [https://github.com/tc39/proposals/blob/master/finished-proposals.md](https://github.com/tc39/proposals/blob/master/finished-proposals.md).


## Что имеем в итоге

Предложения ES2019 не так впечатляют, как в свое время ES2015 (let/const, Promise, arrow function и т.д.) или ES2017 (async/await), но эти новые фичи дополняют API языка.
`Array.prototype.flat` и `Array.prototype.flatMap` расширяют поддержку работы с массивами путем построения цепочек,
`Object.fromEntries()` является логичным дополнением к `Object.entries()`. `Symbol#description` дополняет es6 symbols.

В целом, ES2019 небольшой, но шаг в правильном направлении развития JavaScript. 
