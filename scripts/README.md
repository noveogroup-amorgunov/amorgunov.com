# Commands

## New post

Create new post:

- create markdown file and put it to content folder;
- create image folder;

Usage:

```bash
npm run create-post <title> <slug>
npm run create-post "Awesome title" "awesome-slug"
npm run create-post "Awesome title" # Slug is auto-generated
```

## Optimize images

- Create small thumbnail version of images
- todo: optimize image

Usage:

```bash
npm run optimize-image <image-folder>
npm run optimize-image 2020-01-28-how-write-tests-in-nodejs.md
```
