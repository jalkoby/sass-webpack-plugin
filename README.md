# SASS-webpack-plugin

[![Build Status](https://travis-ci.org/jalkoby/sass-webpack-plugin.svg?branch=master)](https://travis-ci.org/jalkoby/sass-webpack-plugin)
[![npm version](https://badge.fury.io/js/sass-webpack-plugin.svg)](https://badge.fury.io/js/sass-webpack-plugin)
[![dependencies](https://david-dm.org/jalkoby/sass-webpack-plugin.svg)](https://david-dm.org/jalkoby/sass-webpack-plugin)

Get your stylesheets together 😼. If you need [sass](http://sass-lang.com) + [autoprefixer](https://github.com/postcss/autoprefixer) + [webpack](https://webpack.js.org/) just do next:

```bash
  npm i -D webpack webpack-dev-server sass-webpack-plugin html-webpack-plugin html-webpack-template
  # or
  yarn add -D webpack webpack-dev-server sass-webpack-plugin html-webpack-plugin html-webpack-template
```

```js
  // webpack.config.js
  const SassPlugin = require('sass-webpack-plugin');
  const HtmlPlugin = require('html-webpack-plugin');
  const contentBase = path.join(__dirname, 'build');

  module.exports = {
    entry: './src/js/index.js',
    plugins: [
      new SassPlugin('./src/styles/index.scss', process.env.NODE_ENV),
      new HtmlPlugin({
        inject: false,
        template: require('html-webpack-template'),
        title: 'Sass webpack plugin',
        links: [{ rel: 'stylesheet', type: 'text/css', href: '/index.css' }],
        appMountId: 'app'
      })
    ],
    module: {
      // babel, linter, etc
    },
    output: {
      path: contentBase,
      filename: 'index.js'
    },
    devServer: (process.env.NODE_ENV === 'production') ? false : {
      contentBase: contentBase,
      compress: true,
      port: 3000
    }
  };
```

## The reasons to use it

It's an **all-in-one solution for sass + webpack** without any limitations.

Here are the reasons to use sass-webpack-plugin over "x"-loader:
- easy to add and little to configure
- generates a separate file (or a few if there is a need) which fits best for the production
- completely compiled by node-sass, so styles doesn't slow down a webpack compilation
- the native sass import instead of [a patch version of it](https://github.com/webpack-contrib/sass-loader#imports)

Here are reasons why sass-webpack-plugin is not the best case:
- you build a js library/app which should has a css inside js code
- full page reload on a style change take a too much time in your time 

## Requirements

**Webpack 2+**. The work with webpack 1.x is not tested so it's up to you 🤞

## Config examples

```js
  // basic
  new SassPlugin('./src/styles/index.scss');

  // production ready
  new SassPlugin('./src/styles/index.scss', process.env.NODE_ENV);

  // multi files
  new SassPlugin(['./src/styles/one.scss', './src/styles/two.sass'], process.env.NODE_ENV);

  // a different output filename
  new SassPlugin({ './src/styles/index.scss': 'bundle.css' }, process.env.NODE_ENV);

  // with sass tuning
  new SassPlugin('./src/styles/index.scss', process.env.NODE_ENV, {
    sass: {
      includePaths: [path.join(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets')]
    }
  });

  // with source maps + compressing - autoprefixing
  new SassPlugin('./src/styles/index.scss', {
    sourceMap: true,
    sass: { outputStyle: 'compressed' },
    autoprefixer: false
  });
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

SASS-webpack-plugin is released under the [MIT License](./LICENSE).
