---
title: "Создаем телеграм бота с помощью serverless на nodejs"
description: "Создаем телеграм бота с помощью serverless на nodejs"
date: 2019-03-26
time: 11
tags:
  - nodejs
  - aws lambda
  - serverless
  - telegram
  - tutorial
layout: layouts/post.njk
---

Данный выпуск - второй по serverless в блоге, и сегодня мы создадим бота в телеграме и напишем лямбду с помощью serverless-a для обработки сообщений. С другими постами по теме вы можете ознакомиться по ссылкам ниже:

<div class="post-series">
    <h4>Серия статей:</h4>
    <ol>
        <li><a href="/posts/2019-03-25-get-started-with-serverless-aws-lambda/">Что такое serverless технологии</a></li>
        <li>Создаем телеграм бота с помощью serverless на nodejs <em>(Этот пост)</em></li>
        <li><a href="/posts/2020-05-07-using-aws-lambda-with-typescript/">Использование AWS Lambda с TypeScript</a></li>
    </ol>
</div>

> Перед началом у вас должен быть аккаунт в AWS с админским доступом или специальный пользователь с нужными правами (при неверно выданных правах все может работать не так, как нужно); бесплатно создать его можно [тут](https://portal.aws.amazon.com/billing/signup#/start). И установлена Nodejs v8 и выше.

Если вы хотите посмотреть код, полученный в результате, можете сразу открывать github: [serverless-telegram-echo-bot](https://github.com/noveogroup-amorgunov/serverless-telegram-echo-bot).

<img
  alt="Пример работы бота"
  src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/preview.png"
/>

Я предполагаю, вы знакомы с Nodejs, но ни разу не создавали ботов в телеграме. Если вам покажется какая-то часть сильно очевидной, то смело пропускайте ее.

Вообще, ребята из телеграм большие молодцы. Я создавал ботов для разных платформ: фейсбук, вконтакте, слака и самое приятое «bot api» (в плане использования) оказалось у [telegram](https://core.telegram.org/bots/api). Для создания бота достаточно написать [@BotFather](https://t.me/botfather), в диалоге с которым вы можете создавать и управлять своими ботами. Напишите ему `/newbot` и следуйте инструкциям для создания нового бота.

> ⚡ Когда бот будет создан, вы получите токен, который нам понадобится далее (`<TELEGRAM_ACCESS_TOKEN>`).

Схема работы такая:

<img
  class="lazyload"
  alt="Схема работы telegram-бота"
  src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/2.min.png"
  data-src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/2.png"
/>

Когда кто-то пишет боту, он будет отправлять webhook на установленный нами эндпоинт, через «Api Gateway» запрос будет передан на обработку лямбде, которая в свою очередь будет через «Telegram API» отправлять сообщение пользователю.

Структура проекта выглядит следующим образом:

```
  .env            - Переменная с токеном для телеграма
  handler.js      - Лямбда функция
  package.json    - Зависимости
  serverless.yml  - Конфигурационный файл serverless
  telegram.js     - Модуль для работы с telegram api
```

В реальных проектах структуру обычно делают следующим образом: создают `src` для всех исходников и уже внутри находятся директория `handler`, `config` и т.д. Внутри `handler` размещают саму лямбду. Но в нашем случае у нас довольно простая лямбда, поэтому используем плоскую структуру.

### Установка зависимостей

Установим фреймворк [serverless](https://serverless.com/) с двумя плагинами: для запуска функции без деплоя и для загрузки переменных окружения из среды. Библиотека `axios` понадобится нам для запросов к телеграму, которая предоставляет удобное request-api.

```
npm init --yes
npm i --save axios
npm i --save-dev serverless serverless-dotenv-plugin serverless-offline
```

Далее в секции `scripts` в `package.json` добавим:

```json
{
  "local": "sls offline start",
  "deploy": "sls deploy",
  "logs": "sls logs --function processWebhook -t"
}
```

С помощью команды `npm run local` можно будет запустить функцию локально, `deploy` - задеплоить в amazon, `logs` - для вывода потока логов в консоль.

> ⚡ Для смены порта можно использовать опцию port: `npm run local -- --port 8080`

Содержимое файла `.env` выглядит следующим образом:

```
TELEGRAM_TOKEN=<TELEGRAM_ACCESS_TOKEN>
```

Эта переменная будет прокинута в код и передаваться при запросах к телеграму.

### Конфигурационный файл serverless.yml

```
service: my-telegram-echo-bot

plugins:
  - serverless-dotenv-plugin
  - serverless-offline

provider:
  name: aws
  runtime: nodejs8.10
  stage: dev
  region: us-east-2
  environment:
    TELEGRAM_TOKEN: ${env:TELEGRAM_TOKEN}

functions:
  processWebhook:
    handler: handler.processWebhook
    events:
      - http:
          path: /
          method: post
```

Единственное, вы можете поменять регион, в котором будет запускаться лямбда и название самой функции с `my-telegram-echo-bot` на любое название.

### telegram.js

В данном файле мы определим всего один метод - `sendMessage`, который отправляет сообщение, ничего сложного:

```js
const axios = require('axios');

const TOKEN = process.env.TELEGRAM_TOKEN;

module.exports.sendMessage = params => {
    const baseUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    return axios
        .get(baseUrl, { params })
        .catch(e => {
            console.error('Telegram error', e.response.data);
        });
};
```

### handler.js

От телеграма будут прилетать подобные запросы:

```json
{
  update_id: 354673398,
  message: {
    message_id: 172,
    from: {
      id: 329857150,
      is_bot: false,
      first_name: 'Alexander',
      last_name: 'Morgunov',
      username: 'saaaaaaaaasha',
      language_code: 'ru'
    },
    chat: {
      id: 329857150, <--------- message.chat.id
      first_name:' Alexander',
      last_name: 'Morgunov',
      username: 'saaaaaaaaasha',
      type: 'private'
    },
    date: 1552137992,
    text: 'Hello, bot' <--------- message.text
  }
}
```

Наша лямбда парсит body в json и если в объекте есть поле message (может не быть, так как вебхуки могут прилетать совершенно разные, не только на входящие сообщения), то отправляет сообщение отправителю: `message.chat.id`:

```js
const telegram = require('./telegram');

module.exports.processWebhook = async event => {
    const body = JSON.parse(event.body);

    console.log(body); // Логируем body

    if (body && body.message) {
        const { chat, text } = body.message;

        await telegram.sendMessage({ chat_id: chat.id, text: `You said: ${text}` });
    }

    return { statusCode: 200 };
};
```

### Тестирование локально

Запускаем локально лямбду командой `npm run local`, в терминале будет показан следующий текст:

```
Serverless: DOTENV: Loading environment variables from .env:
Serverless:      - TELEGRAM_TOKEN
Serverless: Starting Offline: dev/us-east-2.

Serverless: Routes for processWebhook:
Serverless: POST /

Serverless: Offline listening on http://localhost:3000
```

Когда лямбда запущена, можно протестировать работу вебхука. Так как телеграм не может слать запросы на localhost, есть два варианта: самому сэмулировать запрос или проксировать запросы из внешнего мира в локалхост.

Первый вариант можно сделать, зная id чата с ботом; нужно выполнить curl запрос:

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{ "message": { "chat": { "id": 329857150 }, "text": "Hello, bot" } }' \
  http://localhost:3000/
```

После отправления запроса вы получите сообщение в телеграме.

---

Для реализации второго варианта нам понадобится [ngrok](https://ngrok.com/), CLI-библиотека, которая позволяет организовать удаленный доступ до localhost, выдав динамический адрес с SSL (https). После установки запустите ngrok следующей командой:

```
./ngrok http 3000

> Forwarding https://f97d1779.ngrok.io -> http://localhost:3000
```

Вы получите адрес, который будет проксировать запросы в лямбду, в моем примере `https://f97d1779.ngrok.io`.

После этого необходимо установить Webhook для вашего бота. Для этого выполните команду

```
curl --data "url=<INVOKE_URL>" "https://api.telegram.org/bot<TELEGRAM_ACCESS_TOKEN>/setWebhook"
```

Где `<INVOKE_URL>`, адрес, выданный ngrok-ом. После выполнения запроса вы должны получить следующее сообщение:

```
{"ok":true,"result":true,"description":"Webhook was set"}
```

Теперь можно попробовать написать боту сообщение:

<p>
<picture>
    <source data-srcset="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/3.webp" type="image/webp">
    <source data-srcset="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/3.gif" type="image/gif">
    <img
        class="lazyload"
        src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/3.min.png"
        data-src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/3.gif">
</picture>
</p>

Еще одна классная фишка лямбд, что это всего лишь функция и при ее изменении не нужно перезапускать сервер - «хотрелоад» из коробки.

### Деплой

Командой `npm run deploy` можно задеплоить функцию в AWS. В терминале вы будете видеть весь процесс деплоя лямбды (все файлы складываются в zip архив и заливаются в S3). В итоге вы получите постоянный эндпоинт, что-то типа: `https://sg2bxp8khj.execute-api.us-east-2.amazonaws.com/dev/`, его нужно установить в качестве вебхука для телеграма.

Созданная лямбда появится в интерфейсе aws (https://console.aws.amazon.com/lambda/home#/functions):

<img
  class="lazyload"
  alt="Созданная лямбда в aws"
  src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/4.min.png"
  data-src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/4.png"
/>

При клике на лямбду можно увидеть сразу созданные интеграции с «CloudWatch Logs» (Посмотреть логи лямбд: https://console.aws.amazon.com/cloudwatch/home) и «API Gateway»:

<img
  class="lazyload"
  alt="Созданная лямбда в aws"
  src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/5.min.png"
  data-src="/assets/images/2019-03-26-create-telegram-echo-bot-with-serverless/5.png"
/>

> Не забудьте при тестирование обновить webhook на новый url!

Так же новые логи можно смотреть локально, запустив команду `npm run logs`.

### Безопасность

У вас может возникнуть вопрос, а что, если кто-то будет отправлять вручную запрос с подставными данными? И в самом деле, сейчас зная url, предоставленный *api gateway*,мы можем без проблем запустить лямбду, хотя это должен делать только телеграм посредством вебхука. Есть два варианта решения:

- Первый, в url добавить токен от бота, вместо того, чтобы хранить его в переменных окружения. В таком случае, только зная токен, можно будет работать с телеграмом.

- Второй, telegram шлет запрос с определенных IP-адресов ([подробнее тут](https://core.telegram.org/bots/webhooks#the-short-version)), поэтому достаточно проверить, что IP адрес запроса является адресом телеграма. Реализовать это можно как-то так:

```js
// Ваша функция для преобразования ip адреса в числовое представление
// Например, https://stackoverflow.com/q/8105629
function ipToNumber(string) {
  // ...
}

const { sourceIp } = event.requestContext.identity;
const [lower, upper] = [ipToNumber('149.154.167.197'), ipToNumber('149.154.167.233')];
const ip = ipToNumber(sourceIp);

if (ip < lower || ip > upper ) {
  throw new Error('IP is not allowed');
}
```

На этом на сегодня все, с вами как всегда был автор этого блога - Александр Моргунов, счастливо!
