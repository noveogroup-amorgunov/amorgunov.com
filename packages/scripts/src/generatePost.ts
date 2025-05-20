import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { DateTime } from 'luxon'

const template = `---
title: "{TITLE}"
date: {DATE}
time: 5
description: "ХХХ"
featuredImageThumbnail: "../images/{DATE}-{SLUG}/preview.jpg"
tags:
  - ХХХ
  - ХХХ
layout: layouts/post.hbs
likes: 0
---`

interface Options {
  title: string
  slug: string
  date?: string
}

// FIXME: move to env
const BASE_CONTENT_PATH = path.join(process.cwd(), '../content')

export async function generatePost(options: Options) {
  const formattedSlug = options.slug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')

  const date = options.date
    ? DateTime.fromISO(options.date)
    : DateTime.fromJSDate(new Date(), { zone: 'utc' })

  const formattedDate = date.toFormat('yyyy-LL-dd')

  const fileName = `${formattedDate}-${formattedSlug}`
  const path = `${BASE_CONTENT_PATH}/posts/${fileName}.md`

  const content = template
    .replace(/\{TITLE\}/g, options.title)
    .replace(/\{SLUG\}/g, formattedSlug)
    .replace(/\{DATE\}/g, formattedDate)

  if (!fs.existsSync(`${BASE_CONTENT_PATH}/images/${fileName}`)) {
    fs.mkdirSync(`${BASE_CONTENT_PATH}/images/${fileName}`)
  }

  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, content)
  }

  console.log(`Post was created in ${path}`)
}
