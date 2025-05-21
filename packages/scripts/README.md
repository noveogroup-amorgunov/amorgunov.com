# @amorgunov/scripts

Scripts list:

- [Generate new post](#generate-new-post)
- [Optimize post images](#optimize-post-images)
- [Internal: Update post reactions](#update-post-reactions)
- [Internal: Copy posts](#copy-posts)

## Generate new post

- Create markdown file and put it to content folder (`root/packages/content/posts/*`)
- Create empty image folder (`root/packages/images/*`)

Usage:

```bash
# template
# pnpm post:generate --help
# pnpm post:generate --title=<title> --slug=<slug> --date=<date?>

pnpm post:generate --title="Awesome title" --slug="awesome-slug" "2019-12-22"
pnpm post:generate --title="Awesome title" --slug="awesome-slug" # with current date
```

## Optimize post images

- Create small thumbnail version of images with `LQIP` (`*.min.(png|jpg)`)
- Optimize image with `imagemin` (`*.out.(png|jpg)`)
- Remove original files

Usage:

```bash
# template
# pnpm post:optimize-images <path>

# if you run script from package
pnpm post:optimize-images ../content/images/2025-05-20-how-solve-cross-imports

# if you run scriot from root
pnpm post:optimize-images ./packages/content/images/2025-05-20-how-solve-cross-imports
```

## Update post reactions

> [!IMPORTANT]
> Internal script which using by github action [`likes.yml`](../../.github/workflows/likes.yml)

Update reactions to blog posts. All reactions are stored in _DinamoDB_ and updated by user in site. Every week github action run workflow which execute this script (load all posts from `root/content/posts/*.md` and update reactions count inside files).

Usage:

```bash
pnpm post:update-reactions
```

## Copy posts

> [!IMPORTANT]
> Internal script which using by main package (app) to copy posts to 11ty folder.

This script copy posts (`root/content/posts/*.md`) to 11ty application folder. Also fix images sources for all relative images inside posts. This is necessary so that the images are displayed correctly both inside github source and on the external site.

Use into [`root/app/configs/preparePosts.mts`](../app/configs/preparePosts.mts).
