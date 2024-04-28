---
title: "Использование AWS Lambda с TypeScript"
date: 2020-05-07
time: 10
featuredImageThumbnail: "/assets/images/2020-05-07-using-aws-lambda-with-typescript/preview.jpg"
description: "Пример работы AWS Lambda с TypeScript"
tags:
  - aws lambda
  - typescript
  - serverless
layout: layouts/post.hbs
likes: 32
---

Сегодня мы создадим облачную функцию на TypeScript, которая будет возвращать текущую погоду для переданного города («weather app» на лямбдах), рассмотрим основные моменты работы, покроем код тестами и задеплоим функцию в AWS Lambda.

Данный выпуск - третий по serverless технологиям в блоге, и сегодня мы поговорим о работе с TypeScript. С другими постами по теме вы можете ознакомиться по ссылкам ниже:

<div class="post-series">
    <h4>Серия статей:</h4>
    <ol>
        <li><a href="/posts/2019-03-25-get-started-with-serverless-aws-lambda/">Что такое serverless технологии</a></li>
        <li><a href="/posts/2019-03-26-create-telegram-echo-bot-with-serverless/">Создаем телеграм бота с помощью serverless на nodejs</a></li>
        <li>Использование AWS Lambda с TypeScript <em>(Этот пост)</em></li>
    </ol>
</div>

Есть несколько способов для работы с TS в лямбдах: собирать TypeScript-исходники с помощью ts-node, собирать с помощью webpack или использовать плагин `serverless-plugin-typescript` при использовании фреймворка [serverless](https://serverless.com/).

Собирать вебпаком код в один бандл стоит, если размер функции со всеми хелперами и вспомогательными библиотеками весит больше 50 МБ (например, из-за больше веса библиотек в node_modules). Но есть нюансы: (1) нужно самому описать webpack конфиг и подготовить код для лямбды (это можно сделать с помощью плагина: [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack)) и (2) зависимости с bin-исходниками вебпак может не собрать и после деплоя функции в облаке код может не запускаться.

В данном материале рассмотрим 3-ий вариант - использование плагина, который избавит от ручной сборки и подготовит все за нас.

Если вы хотите посмотреть код, полученный в результате, можете сразу открывать github: [aws-lambda-typescript-weather-app](https://github.com/noveogroup-amorgunov/aws-lambda-typescript-weather-app).

## Подготовка проекта

### Настройка аккаунта AWS

**Важно**: Для деплоя функции у вас должен быть аккаунт в AWS, добавлены переменные окружения `AWS_ACCESS_KEY_ID` и `AWS_SECRET_ACCESS_KEY`:

- Создайте AWS аккаунт [здесь](https://portal.aws.amazon.com/billing/signup#/start)
- Получите AWS Credentials ([почитать подробнее](https://serverless.com/framework/docs/providers/aws/guide/credentials/), где их получить)
- Добавьте credentials в `~/.aws/credentials`:

```env
[default]
aws_access_key_id = <ACCESS_KEY_ID>
aws_secret_access_key = <SECRET_ACCESS_KEY>
```

### Зависимости и конфиги

Первым делом установим зависимости и настроим два конфигурационных файла (для TS, и для и Serverless). Создадим директорию для проекта, создадим `package.json` (npm init -f) и установим зависимости:

```bash
mkdir weather-app
cd weather-app
npm init -f
npm i --save-dev @types/node @types/aws-lambda @types/axios @types/jest typescript serverless serverless-offline serverless-plugin-typescript serverless-dotenv-plugin jest ts-jest
npm i --save axios
```

- `@types/*` - TypeScript типы, необходимые для работы кода
- `typescript` - TypeScript компилятор
- `serverless` - фреймворк для работы с лямбдами и плагины для него (плагин `serverless-offline` позволит запускать лямбду локально, `serverless-plugin-typescript` - использовать TypeScript, `serverless-dotenv-plugin` - читать переменные окружения из `.env` файла);
- `jest`, `ts-jest` - для тестов
- `axios` - библиотека для http-запросов

**Чтобы сохранить размер загружаемых данных в AWS небольшим, важно добавлять зависимости в `devDependencies`.**

Добавим в секцию `scripts` скрипты для запуска лямбды локально, для деплоя и для прогона тестов:

```json
{
    "local": "sls offline start",
    "deploy": "sls deploy",
    "test": "jest"
}
```

Данные о погоде будем брать из [API Weatherstack](https://weatherstack.com/), для работы которого нужен `API_KEY` (для его получения достаточно зарегистрироваться). Ключ нужно положить в `.env` файл. Содержимое этого файла выглядит следующим образом:

```env
WEATHERSTACK_API_KEY=<API_KEY>
```

Так же нужно добавить в `package.json` опцию jest, в которой указать, что все тесты с расширением `.ts` или `.tsx` прогонять через `ts-jest` (по умолчанию jest не умеет работать с TypeScript):

```json
{
  "jest": {
    "transform": {
      ".+\\.tsx?$": "ts-jest"
    }
  }
}
```

Далее настроим конфиги.

### Конфиг Serverless

Все доступные параметры конфигурации описаны [в официальной документации](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/).

Файл `serverless.yml`:

```
service: aws-lambda-typescript-weather-app

plugins:
  - serverless-plugin-typescript
  - serverless-dotenv-plugin
  - serverless-offline

provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  region: us-east-2
  environment:
    WEATHERSTACK_API_KEY: ${env:WEATHERSTACK_API_KEY}

functions:
  getWeather:
    handler: src/getWeather.hander
    events:
      - http:
          path: /weather/{city}/current
          method: get
```

Из интересного:

- Конфиг описывает одну функцию `getWeather`, которая будет триггериться с помощью HTTP-события (в рамках AWS - это API Gateway);
- На момент написания статьи AWS Lambda поддерживает Nodejs с версии 12 (локально можно разрабатываться на 8 и 10, но в облаке код будет выполняться на 12.x версии);
- Важно подключать `serverless-plugin-typescript` перед `serverless-offline`, чтобы сначала код скомпилировался, а потом уже запускался локально.

### Конфиг TypeScript

Файл `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,
    "outDir": ".build",
    "rootDir": "./",
    "module": "commonjs",
    "lib": ["es2019", "es2020.bigint", "es2020.string", "es2020.symbol.wellknown"],
    "target": "es2019"
  }
}
```

По традиции рассмотрим интересное:

- `strictNullChecks`, `noImplicitAny` - не обязательные правила, но которые включают более строгие проверки TypeScript и позволяют писать более затипизированный код;
- TypeScript позволяет собирать код под разные ECMASCRIPT стандарты (например, можно собрать код под es5 c var-ами). Nodejs v12 полностью поддерживает `es2019` (подробнее можно почитать здесь: https://stackoverflow.com/questions/59787574/typescript-tsconfig-settings-for-node-js-12). `target` сообщает компилятору, какую версию библиотеки включать при компиляции, поэтому в конфиге указан с соответствующим значением.
- Опция lib говорит TypeScript, что в платформе реализованы указанные фичи и не нужно их дополнительно преобразовывать. Реальный кейс - когда мы собираем код под ES5 и подключаем полифилл для Promise, можно указать `"lib": ["es5", "es2015.promise"]` и TS не будет дополнительно транспилировать промисы.

> Стоит иметь ввиду, что TypeScript не подключает полифилы и о их подключнии нужно позаботиться самому.

## Подготовка типов

Создадим файл `scr/types.ts` в котором опишем необходимые типы для работы приложения. В пакете `@types/aws-lambda` уже есть необходимые типы для работы с лямбда-функциями, поэтому с нуля писать их не нужно. Например, вот так выглядит тип `ApiGatewayProxyEventBase`:

<img
  class="lazyload"
  alt="Типы aws-lambda"
  src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/5.min.png"
  data-src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/5.jpg"
/>

Для начала опишем типы для входного события лямбда-функции и возвращаемый результат:

```ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export type HttpEventRequest<T = null> = Omit<APIGatewayProxyEvent, 'pathParameters'> & {
    pathParameters: T
}

export type HttpResponse = Promise<APIGatewayProxyResult>;
```

Если с типом `HttpEventResponse` все должно быть понятно - так как будем использовать async-функцию, то ожидаем в качестве ответа Promise, который вернет уже готовый тип `APIGatewayProxyResult`.

А что касается `HttpEventRequest`, могут возникнуть вопросы. Сейчас рассмотрим проблему и приведенный выше способ решения. В базовом типе `APIGatewayProxyEvent` свойство `pathParameters` описано следующим образом:

```##1
pathParameters: { [name: string]: string } | null;
```

И если в коде попытаться получить из pathParameters параметр пути в url (в нашем случае это `weather/{city}/current` и параметр `city`), то TypeScript будет выдавать ошибку:

<img
  class="lazyload"
  alt="Ошибка типа pathParameters"
  src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/6.min.png"
  data-src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/6.jpg"
/>

Это связано с тем, что тип `pathParameters` может быть null, который нельзя деструктизовать. Для решения проблемы есть два варианта:

1. Использовать "!", что указать TypeScript, что pathParameters не равен null:

```ts##1
const { city } = event.pathParameters!;
```

2. С помощью встроенного хелпера `Omit`, который удаляет из типа переданный ключ, удалить из типа `APIGatewayProxyEvent` свойство `pathParameters` и добавить его отдельным типом с использованием дженерика. Такой тип можно использовать вот так:

```ts##1
const event: HttpEventRequest = {...};
```

Если не ожидается использование `pathParameters` (параметр будет равен null) или вот так:

```ts##1
const event: HttpEventRequest<{ city: string }> = {...};
```

В данном случае ожидается обязательный параметр `city` (который мы явно передали) в `pathParameters`. Если попробовать взять другое свойство, то TypeScript ожидаемо подсветит эту строчку:

<img
  class="lazyload"
  alt="Ошибка использования неожидаемого path параметра"
  src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/3.min.png"
  data-src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/3.jpg"
/>

Я выбрал второй способ, который запретит брать из параметров неожидаемые значения.

Опишем еще несколько типов:

```ts
// Тип body, возвращаемый пользователю из лямбды
export type HttpResponseBody = {
    city: string;
    temperature: number;
    textWeather: string[];
}

// Тип успешного ответа API Weatherstack
export type WeatherstackSuccessResponse = {
    request: {
        type: string;
        query: string;
        language: string;
        unit: string;
    };
    location: {
        name: string;
        country: string;
        region: string;
        lat: string;
        lon: string;
    };
    current: {
        temperature: number;
        weather_descriptions: string[];
        wind_speed: number;
        pressure: number;
    };
};

// Тип ответа с ошибкой API Weatherstack
export type WeatherstackErrorResponse = {
    success: false;
    error: object;
}

// Тип ответа API Weatherstack
export type WeatherstackResponse = WeatherstackSuccessResponse | WeatherstackErrorResponse;
```

## Тесты

> Рекомендую почитать материал "[Как писать тесты в Nodejs](https://amorgunov.com/posts/2020-01-28-how-write-tests-in-nodejs/)" о правильных практиках и подходах по написанию тестов.

Давайте пойдем по методологии TDD и опишем два тест-кейса для лямбды, после приступим к реализации. В данном примере достаточно проверить два кейса: когда API Weatherstack возвращает информацию о погоде и когда возвращает ошибку.

Для начала нам нужны стабы (заглушки) ответа от API Weatherstack (успешный и неудачный), а так же объект event, который принимает лямбда-функция (можете взять [из репозитория](https://github.com/noveogroup-amorgunov/aws-lambda-typescript-weather-app/tree/master/src/__test__/mocks)).

Перед описанием тест-кейсов создадим перемененную с дефолтным event и хук `beforeEach`, в котором перед каждым тестом будем отчищать моки, установленные jest-ом.

```ts
const defaultEvent = {
    // стаб объекта event, сформированный api gatetway
    ...httpEventMock,
    pathParameters: { city: 'london' },
} as any;

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getWeather handler', () => {
    // ...
});
```

И опишем два тест-кейса:

```ts
it('should respond current weather by city', async () => {
    const requestSpy = jest
        .spyOn(axios, 'get')
        .mockImplementation(async () => ({ data: weatherstackSuccessResponse }));

    const actual = await handler(defaultEvent);
    const expected = respondJson({
        city: 'Lakefront Airport',
        temperature: 22,
        textWeather: ['Clear']
    }, 200);

    expect(actual).toEqual(expected);
    expect(requestSpy).toHaveBeenCalled();
})
```

```ts
it('should respond error if weatherstack API respond error', async () => {
    const requestSpy = jest
        .spyOn(axios, 'get')
        .mockImplementation(async () => ({ data: weatherstackErrorResponse }));

    const actual = await handler(defaultEvent);
    const expected = respondJson({ error: true }, 200);

    expect(actual).toEqual(expected);
    expect(requestSpy).toHaveBeenCalled();
});
```

С помощью `jest.spyOn` замокаем http-запрос до API. Далее вызываем функцию, передавая `defaultEvent` в качестве первого аргумента. А с помощью хелпера `respondJson` формируем ответ лямбды. Также стоит проверить, что spy-агент был вызван.

Теперь запустим тесты `npm test`:

<img
  class="lazyload"
  alt="Тесты упали, можно приступать к реализации"
  src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/4.min.png"
  data-src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/4.jpg"
/>

Они ожидаемо упали, можно приступать к реализации.

## Пишем лямбду

Напишем код хелпера для формирования ответа и лямбду:

```ts
export function respondJson(body: object, statusCode: number) {
    return {
        statusCode,
        body: JSON.stringify(body)
    };
}

export async function handler(event: HttpEventRequest<{ city: string }>): HttpResponse {
    const { city } = event.pathParameters;

    return respondJson({ city }, 200);
}
```

Эту функцию можно запустить локально. После запуска будет создана директория `.build`, в которой можно посмотреть скомпилированный в JavaScript код:

<img
  class="lazyload"
  alt="Скомпилированный TypeScript код в JS"
  src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/2.min.png"
  data-src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/2.jpg"
/>

Допишем отправку запроса в API, обработку ответа от API и формирования ответа лямбды.

```ts
const API_KEY = process.env.WEATHERSTACK_API_KEY;

export async function handler(event: HttpEventRequest<{ city: string }>): HttpResponse {
    const { city } = event.pathParameters;

    // Делаем запрос в API Weatherstack
    const endpoint = 'http://api.weatherstack.com/current';
    const { data } = await axios.get<WeatherstackResponse>(endpoint, {
        params: { access_key: API_KEY, query: city }
    });

    // Если есть ошибка, возвращаем это пользователю
    // Оператор in помогает TypeScript работать с union-типами
    if ('error' in data) {
        return respondJson({ error: true }, 200);
    }

    // Формируем ответ
    const response: HttpResponseBody = {
        city: data.location.name,
        temperature: data.current.temperature,
        textWeather: data.current.weather_descriptions,
    }

    return respondJson(response, 200);
}
```

Теперь можно еще раз запустить функцию локально и сделать запросы в браузерной строке для возврата погоды:

```##1
http://localhost:3000/dev/weather/{city}/current
```

И запустить тесты, чтобы убедиться в их успешном прохождении:

<img
  class="lazyload"
  alt="Успешно пройденные тесты"
  src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/7.min.png"
  data-src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/7.jpg"
/>

## Деплой в AWS

Командой `npm run deploy` можно задеплоить функцию в AWS. В терминале вы будете видеть весь процесс деплоя лямбды (все файлы складываются в zip архив и заливаются в S3). В итоге вы получите постоянный эндпоинт, что-то типа: https://xxx.execute-api.us-east-2.amazonaws.com/dev/.

Делая запрос на `GET https://xxx.execute-api.us-east-2.amazonaws.com/dev/weather/{city}/current` вы получите информацию о погоде:

<img
  class="lazyload"
  alt="Ответ лямбды с информацией о погоде"
  src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/8.min.png"
  data-src="/assets/images/2020-05-07-using-aws-lambda-with-typescript/8.jpg"
/>

## Итого

Писать лямбды на TypeScript довольно просто, достаточно добавить конфигурационный файл `tsconfig.json` и использовать плагин `serverless-plugin-typescript`.

Написанная нами лямбда не готова для продакшена: нужно предусмотреть валидацию входных данных, обработку ошибок и другие вещи, присущие всем API Endpoint-ам, но старт работы с TypeScript положен, проект подготовлен. Дальше - только ваши бизнес требования и фантазия.
