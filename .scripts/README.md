# Commands

## New post

Create new post:

- create markdown file and put it to content folder;
- create image folder;

Usage:

```bash
npm run create-post <title> <slug?> <date?>
npm run create-post "Awesome title" "awesome-slug" "2019-12-22"
npm run create-post "Awesome title" # Slug is auto-generated and date is current
```

then you can generate preview:

```bash
node .scripts/generatePreview --slug=<slug>
```

## Optimize images

- Create small thumbnail version of images usign lqip
- Optimize image using squoosh

Usage:

```bash
node .scripts/optimizeImage --slug=<slug> --replace
```

You can pass `--replace` arg to remove original images.

To replace images path in post you can use follow regex:

```
/(\d+).(png|jpg|jpeg)
/$1.out.jpg
```
