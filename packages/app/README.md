# @amorgunov/app

![](./src/assets/images/common/preview-github@dark.png#gh-dark-mode-only)![](./src/assets/images/common/preview-github@light.png#gh-light-mode-only)

## Features

- Separate build static (*webpack*) and build pages (*11ty*) processes
- Components approach (using handlebars templates)
- Clean configs folder
- Posts and tags 11ty collections
- Likes post system (using *github actions* and *AWS Lambda*)
- CLI scripts to create posts and optimize images
- Lazy loading image like *Medium.com*
- Dark theme

## Development

Use command from root of project

### Build

```bash
pnpm build

# 1 - pnpm run build:clean
# 2 - pnpm run build:webpack
# 3 - pnpm run build:11ty
```

### Start

```bash
pnpm start

# Run watchers in parallel
# 1 - pnpm run start:content
# 1 - pnpm run start:webpack
# 1 - pnpm run start:11ty
```
