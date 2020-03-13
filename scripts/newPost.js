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
---`;

const [, , title, slug] = process.argv;

if (!title) {
  throw new Error(
    'The title is required.\n' +
    'You should run script like `npm run create-post <title>`.'
  );
}

const formattedSlug = slug || title
  .toLowerCase()
  .replace(/[^a-z0-9а-яё]/g, '-');

const date = DateTime
  .fromJSDate(new Date(), { zone: 'utc' })
  .toFormat('yyyy-LL-dd');

const fileName = `${date}-${formattedSlug}`;
const path = `./src/posts/${fileName}.md`;
const content = template
  .replace('{title}', title)
  .replace('{date}', date);

fs.mkdirSync(`./src/assets/images/${fileName}`);
fs.writeFileSync(path, content, err => {
  if (err) {
    console.log(err);

    return;
  }

  console.log(`Post was created in ${path}!`);
});
