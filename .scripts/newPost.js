const fs = require('fs');
const { DateTime } = require('luxon');

const template = `---
title: "{title}"
date: {date}
time: 5
description: ""
tags:
  - {tagName}
layout: layouts/post.njk
likes: 0
---`;

const [, , title, slug, argDate] = process.argv;

if (!title) {
  throw new Error(
    'The title is required.\n' +
    'You should run script like `npm run create-post <title>`.'
  );
}

const formattedSlug = slug || title
  .toLowerCase()
  .replace(/[^a-z0-9а-яё]/g, '-');

const date = argDate
  ? DateTime.fromISO(argDate)
  : DateTime.fromJSDate(new Date(), { zone: 'utc' })

const formattedDate = date.toFormat('yyyy-LL-dd');

const fileName = `${formattedDate}-${formattedSlug}`;
const path = `./src/posts/${fileName}.md`;
const content = template
  .replace('{title}', title)
  .replace('{date}', formattedDate);

fs.mkdirSync(`./src/assets/images/${fileName}`);
fs.writeFileSync(path, content, err => {
  if (err) {
    console.log(err);

    return;
  }

  console.log(`Post was created in ${path}!`);
});
