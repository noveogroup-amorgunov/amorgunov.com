![](./src/assets/favicon@dark.png#gh-dark-mode-only)![](./src/assets/favicon.png#gh-light-mode-only)

# amorgunov.com

[![Netlify Status](https://img.shields.io/netlify/763b6aa3-7b4a-47fe-9c14-ee98f17d9580?style=flat&colorA=000000&colorB=000000)](https://app.netlify.com/sites/nukeapp/deploys) ![Like action](https://img.shields.io/github/actions/workflow/status/noveogroup-amorgunov/amorgunov.com/likes.yml?branch=master&style=flat&colorA=000000&colorB=000000)

Hey! Here you can find source files for my personal blog built with [**_11ty_**](https://www.11ty.io/), [**_webpack_**](https://webpack.js.org/) and hosted by [**_Netlify_**](https://netlify.com/).

## Live demo

![](./src/assets/images/preview-github@dark.png#gh-dark-mode-only)![](./src/assets/images/preview-github@light.png#gh-light-mode-only)

You can see all pages on [https://amorgunov.com](https://amorgunov.com)

## Features

- Separate build static (*webpack*) and build pages (*11ty*) processes
- Components approach (using handlebars templates)
- Clean configs folder
- Posts and tags 11ty collections
- Likes post system (using *github actions* and *AWS Lambda*)
- CLI scripts to create posts and optimize images
- Lazy loading image like *Medium.com*
- [ ] Dark theme
- [ ] I18n mode

## Development

```bash
nvm use

npm install

# generate templates for 11ty
npm run build:webpack

# start webpack and 11ty watchers
npm run start
```

## License

Licensed under the MIT license.
