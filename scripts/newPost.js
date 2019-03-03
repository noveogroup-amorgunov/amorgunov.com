/**
 * Script to create new post with title and slug
 *
 * Usage:
 *   `npm run create:post "Awesome title" "awesome-slug"`
 *   `npm run create:post "Awesome title" # Slug is auto-generated
 */

const fs = require('fs');
const { DateTime } = require('luxon');

const [, , title, slug] = process.argv;

if (!title) {
  throw new Error(
    'The title is required.\n' +
    'You should run script like `node newPost.js <title>`.'
  );
}

const formattedSlug = slug || title
  .toLowerCase()
  .replace(/[^a-z0-9а-яё]/g, '-');

const date = DateTime
  .fromJSDate(new Date(), { zone: 'utc' })
  .toFormat('yyyy-LL-dd');

const path = `./src/posts/${date}-${formattedSlug}.md`;

fs.writeFileSync(path, getTemplate(title, date), err => {
  if (err) {
    console.log(err);

    return;
  }

  console.log(`Post "${title}" was created!`);
});

function getTemplate(t, d) {
  return `---
title: "${t}"
date: ${d}
description:
tags:
layout: layouts/post.njk
---`;
}
