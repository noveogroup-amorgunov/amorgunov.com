const fs = require('fs');
const {DateTime} = require('luxon');
const {argv} = require('yargs');
const {spawnSync} = require('child_process');

const help = `Usage: node ./scripts/newPost <options>

options:
    --title=<title>  Required post title
    --slug=<slug>    Post slug
    --date=<date>    Post published date in YYYY-MM-DD
`;

if (argv.help || argv.h) {
	console.log(help);
	process.exit(0);
}

if (!argv.title) {
  throw new Error(
    'The title is required.\n' +
    'You should run script like `node ./scripts/newPost --title=<title>`.'
  );
}

const formattedSlug = argv.slug || argv.title
  .toLowerCase()
  .replace(/[^a-z0-9а-яё]/g, '-');

const date = argv.date
  ? DateTime.fromISO(argv.date)
  : DateTime.fromJSDate(new Date(), { zone: 'utc' })

const formattedDate = date.toFormat('yyyy-LL-dd');

const template = `---
title: "{title}"
date: {date}
time: 5
description: ""
featuredImageThumbnail: "/assets/images/{date}-{slug}/preview.jpg"
tags:
  - {tagName}
layout: layouts/post.hbs
likes: 0
---`;

const fileName = `${formattedDate}-${formattedSlug}`;
const path = `./src/posts/${fileName}.md`;
const content = template
  .replace(/{title}/g, argv.title)
  .replace(/{slug}/g, formattedSlug)
  .replace(/{date}/g, formattedDate);

if (!fs.existsSync(`./src/assets/images/${fileName}`)) {
  fs.mkdirSync(`./src/assets/images/${fileName}`);
}

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, content);
}

console.log(`Post was created in ${path}`)

console.log(`Next command to run: node .scripts/generatePreview --slug=${fileName}`);

// spawnSync(`node ./generatePreview --slug=${fileName}`);
