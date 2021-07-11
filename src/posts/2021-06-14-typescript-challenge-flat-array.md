---
title: "Typescript challenge: flatArray"
date: 2021-06-14
time: 5
description: "Напишем типы для функции flatArray, которая делает массив плоским"
featuredImageThumbnail: "/assets/images/2021-06-14-typescript-challenge-flat-array/preview.jpg"
tags:
  - typescript
  - typings
layout: layouts/post.njk
likes: 3
---

Я уже давно пишу на тайпскрипте, но продолжаю открывать для себя новые возможности, подходы к написанию кода и проблемы компилятора. Чтобы аккумулировать новые знания, решил сделать серию постов по типизации различных функций и модулей в TypeScript.

В сегодняшнем (дебютном) посте попробуем написать типы для функции `flatArray` (упрощенный аналог `Array.prototype.flat` из ES2019), которая "разворачивает" подмассивы, т.е. все элементы из вложенных подмассивов поднимает на верхний уровень:

```ts
const arr = ['foo', ['bar', 'baz', ['xyz']]];

flatArray(arr); // ['foo', 'bar', 'baz', 'xyz'];
```

Реализовать функцию можно через рекурсию, стек или воспользоваться встроенным методом flat. Но реализация нам сейчас не интересна, важно затипизировать функцию.

> Все примеры из поста удобно запускать в онлайн песочнице https://www.typescriptlang.org/play

## Первый подход

Начнем с простого: описать исходных массив, состоящий из строк и массивов, содержащих строки и массивы, содержащие... Стоп, давайте выйдем из рекурсии и все же опишем такой тип:

```ts
// Элемент массива (строка или массив строк)
type NestedArrayElement = string | string[];

// Исходный массив
type NestedArray = NestedArrayElement[];

const arr: NestedArray = ['foo', ['bar', 'baz', ['xyz']]];
                                                ^^^^^^^
```

Но код выполнится с ошибкой. Если внимательно посмотреть на типы, можно понять, почему TypeScript выкинет ее. Все потому, что в качестве элемента кроме массива строк могут быть, например, массивы массивов строк. К счастью, нам повезло, что мы живем в то время, когда TypeScript позволяет описать такую рекурсивную структуру. Достаточно заменить `string[]` на `NestedArrayElement[]`, то есть элемент может быть как строкой, так и вложенным массивом:

```ts
// Элемент массива (строка или массив строк)
type NestedArrayElement = string | NestedArrayElement[];

// Исходный массив
type NestedArray = NestedArrayElement[];

const arr: NestedArray = ['foo', ['bar', 'baz', ['xyz']]];
```

Сделаем тип универсальным (не только для строк). Для этого воспользуемся дженериком ([документация](https://www.typescriptlang.org/docs/handbook/2/generics.html)), заменив `string` на тип из дженерика `T`:

```ts
type NestedArrayElement<T> = T | NestedArrayElement<T>[];

type NestedArray<T = unknown> = NestedArrayElement<T>[];
```

Укажем для `T` по умолчанию тип `unknown`, чтобы его не пришлось задавать явно. Тип готов, опишем функцию:

> С помощью `declare` можно декларировать фукнцию или переменную, не реализовывая ее.

```ts
declare function flatArray<T>(arr: NestedArray<T>): Array<T>;
```

В TypeScript есть прекрасная возможность выводить типы - [*infer type*](https://www.typescriptlang.org/docs/handbook/type-inference.html) - когда тип не описывается явно, а формируется на основе данных. Это и будет происходить с типом T внутри функции выше:

```ts
// Тип stringArr будет string[]
const stringArr = flatArray(["foo", ["bar", ["baz"]]]);
// Тип mixedArr будет (string | number)[]
const mixedArr = flatArray(["foo", 55, ["bar", ["baz"]]]);
```

Неплохо, правда! В альтернативной вселенной на этом можно было заканчивать статью, так как функцию мы типизировали. Но, к сожалению, TypeScript не всегда может верно автоматически вывести тип в рекурсивных структурах, например у массива `[1, ["foo"]]` будет выведен тип `string[]` вместо `(string | number)[]`.

```ts
const arr1 = flatArray(['foo', 5]); // Array<string | number>
const arr2 = flatArray(['foo', [5, 'bar']]); // Array<string | number>
const arr3 = flatArray(['foo', 5, ['bar']]); // Array<string | number>

const arr4 = flatArray(['foo', [5]]); // Array<number>
                        ^^^^^
//                      Type 'string' is not assignable to type
//                      'NestedArrayElement<number>'.
```

Почему так происходит? Я не знаю. Пол года назад я задавал этот вопрос на stackoverflow, создавал issue, но так и не получил ответа. Возможно когда то в будущем я все же найду силы залезть в недра компилятора и разобраться, почему вывод работает именно так, но не сегодня.

Чтобы избегать ошибку, можно явно передавать тип структуры при вызове метода (`flatArray<string | number>`), а можно перейти к следующей главе.

## Копаем глубже

Выше была попытка описать тип входного массива. Можно пойти другим путем и сразу описать тип выходного массива (а тип исходного массива оставить без изменений). Функция будет выглядеть следующим образом:

```ts
declare function flatArray<T>(arr: T): FlatArray<T>[];
```

С помощью [`infer` и *conditional types*](https://www.typescriptlang.org/docs/handbook/type-inference.html) можно вывести тип вложенных структур, в том числе и элементов массива в виде *union type* (объединения типов):

```ts
type FlatArray<T> = T extends ReadonlyArray<infer R> ? R : T;

type ResulArr = FlatArray<[1, 'bar', ['foo']]>; // 1 | 'bar' | ['foo']
type ResultStr = FlatArray<'bar'>; // 'bar'
```

Что происходит в `FlatArray`? В типе проверяем, является ли T из дженерика подмножеством массива (`T extends ReadonlyArray<infer R>`). Если да, то возвращаем объединение типов элементов массива, иначе возвращаем исходный элемент.

Получилось развернуть верхний уровень массива. Чтобы развернуть все вложенные массивы, достаточно рекурсивно вызвать `FlatArray` на `R`:

```ts
type FlatArray<T> = T extends ReadonlyArray<infer R> ? FlatArray<R> : T;

type ResulArr = FlatArray<[1, 'bar', ['foo']]>; // 1 | 'bar' | 'foo'
```

TypeScript при получении в качестве проверяемого значения объединение типов, выполнит проверку (в нашем случае на массив) каждый элемент по отдельности.

Проверим на проблемном кейсе из первой части:

```ts
const arr4 = flatArray(['foo', [5]]); // Array<string | number>
```

Все работает, мы описали тип, поздравляю:

```ts
type FlatArray<T> = T extends ReadonlyArray<infer R> ? FlatArray<R> : T;

declare function flatArray<T>(arr: T): FlatArray<T>[];
```

## Реализация Array.prototype.flat

Метод `Array.prototype.flat` ([документация на MDN](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)) интересен тем, что в него можно передать аргумент *depth* (глубина), на сколько уровней вложенности уменьшается мерность исходного массива (по умолчанию 1).

До мая 2020 года типы были описаны максимально просто (посмотреть можно [здесь](https://github.com/microsoft/TypeScript/commit/35c1ba67baac2fd5152908184f8b2ec565815942#diff-d1641fc29156fd1998b9b563300edf5febc5a055428f976ef32337d74612f198L45-L222)), которые типизировали только массивы с элементами одного типа и ограниченной вложенности, до четвертого уровня, где все случаи были описаны вручную, например вот так:

```ts
flat<U>(this:
    ReadonlyArray<U[][][][]> |

    ReadonlyArray<ReadonlyArray<U[][][]>> |
    ReadonlyArray<ReadonlyArray<U[][]>[]> |
    ReadonlyArray<ReadonlyArray<U[]>[][]> |
    ReadonlyArray<ReadonlyArray<U>[][][]> |

    ReadonlyArray<ReadonlyArray<ReadonlyArray<U[][]>>> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<U>[][]>> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>[][]> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<U>[]>[]> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<U[]>>[]> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<U[]>[]>> |

    ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U[]>>>> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>[]>>> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>[]>> |
    ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>>[]> |

    ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>>>>,
    depth: 4): U[];
```

Но некий Нейтон Сандерс написал вот такой тип, который используется до сих пор:

```ts
type FlatArray<Arr, Depth extends number> = {
    "done": Arr,
    "recur": Arr extends ReadonlyArray<infer InnerArr>
        ? FlatArray<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
        : Arr
}[Depth extends -1 ? "done" : "recur"];
```

Этот тип так же разворачивает массив, но на каждом шаге уменьшает значение переменной *Depth*, тем самым ограничивая рекурсию до указанной глубины. Интересно, что максимальная глубина вложенности равна 21. Видимо, было предположение, что задача автоматически выводить тип у более глубоких структур не встречается в жизни или TS просто не справляется с таким.

```ts
const arr = ['foo', ['bar', ['baz']]];

arr.flat(0); // Array<string | (string | string[])[]> - исходный тип
arr.flat(1); // Array<string | string[]> - развернули только первый уровень вложенности
arr.flat(2); // Array<string>
arr.flat(3); // Array<string>
```

---

На основе этих трех примеров можно определить ваши навыки работы с TypeScript:

- Вы уверенный **Junior TypeScript разработчик**, если смогли бы реализовать первый вариант. Затипизировать 90% кода в проекте для Вас не проблема; 
- Вы **Middle TypeScript разработчик**, если умеете использовать infer и опциональные типы;
- Вы **Senior TypeScript разработчик**, если смогли бы реализовать тип `FlatArray` из ES2019.

Конечно же это просто шуточное деление на уровни и не стоит воспринимать его дословно. Но по мере того, как я изучал TypeScript, мне бы пригодилась такая разбивка, для понимания, на каком уровне я знаю TS.

На сегодня все, до следующего выпуска!
