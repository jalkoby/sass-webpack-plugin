# SASS-webpack-plugin

[![Build Status](https://travis-ci.org/jalkoby/sass-webpack-plugin.svg?branch=master)](https://travis-ci.org/jalkoby/sass-webpack-plugin)
[![npm version](https://badge.fury.io/js/sass-webpack-plugin.svg)](https://badge.fury.io/js/sass-webpack-plugin)
[![dependencies](https://david-dm.org/jalkoby/sass-webpack-plugin.svg)](https://david-dm.org/jalkoby/sass-webpack-plugin)

Get your stylesheets together 😼. If you need a **scss/sass** support just add this:

```js
// webpack.config.js
const SassPlugin = require('sass-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new SassPlugin('./relative/path/to/your/stylesheet', process.env.NODE_ENV),
    ...
  ]
};
```

## The reasons to use it

It's **a production ready solution for working with css**. For a long time you had to add [a few loaders for
development](https://github.com/webpack-contrib/sass-loader#examples) and [one more for production](https://github.com/webpack-contrib/sass-loader#in-production) 😒. With sass-webpack-plugin just add one
plugin, specify a path to a root css and your are ready to go 🙏.

Here are the reasons to use sass-webpack-plugin over "x"-loader:
- easy to add and little to configure
- generates a separate file(or a few if there is a need) which fits best for the production
- completely compiles by node-sass, so styles doesn't slow down a webpack compilation
- a native import sass rather [a patch version of it](https://github.com/webpack-contrib/sass-loader#imports)

Here are reasons why sass-webpack-plugin is not the best case:
- you build a js library/app which should has a css inside js code
- you need a hot module reload. At the moment there is no support for hot reload, but sass-webpack-plugin will rebuild
  css only when a root css or one of its dependencies. Webpack will start a **style rebuild only**. On my laptop it's
  about 100ms (when webpack is not evolved it's really fast)

## Requirements

**ONLY webpack 2+**. The work with webpack 1.x is not tested so it's up to you 🤞

## Install

`yarn add sass-webpack-plugin`

If you're using **npm**:

`npm i --save-dev sass-webpack-plugin`

## Configuration
```js
// webpack.config.js

// the most simple case
{
  entry: "src/js/index.js",
  plugins: [
    new SassPlugin("src/css/styles.scss")
  ]
}

// with an extra node-sass config
{
  entry: "src/js/index.js",
  plugins: [
    new SassPlugin("src/css/styles.scss", { indentWidth: 4 })
  ]
}

// with automatic dev/production modes
{
  entry: "src/js/index.js",
  plugins: [
    new SassPlugin("src/css/styles.scss", process.env.NODE_ENV)
  ]
}

// with auto mode + custom config

{
  entry: "src/js/index.js",
  plugins: [
    new SassPlugin("src/css/styles.scss", process.env.NODE_ENV, { indentWidth: 4 })
  ]
}

```
For details about node-sass options please look at the [node-sass's repo](https://github.com/sass/node-sass#options)


In the **development** mode you will get these defaults:
```js
{
  indentedSyntax: true,
  indentWidth: 2,
  sourceMap: true,
  sourceMapEmbed: true,
  sourceComments: true,
  sourceMapContents: true
}
```

In the **production** mode the defaults is next:
```js
{
  outputStyle: 'compressed'
}
```

## Bootstrap support
If you're working with a css library like Bootstrap 3+ feel free to add it to your config:
```js
// webpack.config.js
module.exports = {
  plugins: [
    new SassPlugin('./src/css/index.scss', process.env.NODE_ENV, {
      includePaths: [path.join(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets')]
    })
  ]
}
```
After that you can easily assess Bootstrap's internals like this:
```scss
// ./src/css/index.scss
@import "bootstrap/normalize";
@import "bootstrap/print";

```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

SASS-webpack-plugin is released under the [MIT License](./LICENSE).
