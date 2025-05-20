# scripts

> [!IMPORTANT]
> Run scripts from root to resolve correct paths

Scripts list:

- [Generate new post](#generate-new-post)
- [Optimize post images](#optimize-post-images)
- [Update post reactions](#update-post-reactions)

## Generate new post

- Create markdown file and put it to content folder
- Create image folder

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

pnpm post:optimize-images ../content/images/2025-05-20-how-solve-cross-imports
```

## Update post reactions

Usage:

```bash
pnpm post:update-reactions
```
