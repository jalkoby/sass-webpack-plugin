# SASS-webpack-plugin

Let's make webpack easy. If you need a **scss/sass** support just do next:

```js
// webpack.config.js
const SassPlugin = require('sass-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new SassPlugin('%relative-path-to-your-stylesheet%', process.env.NODE_ENV),
    ...
  ]
};
```

## Requirements

**ONLY webpack 2+**. Webpack 1.x is not tested so the correct work is not guarantee.

## Install

`yarn add --flat sass-webpack-plugin`

If you're using **npm**:

`npm i sass-webpack-plugin`

## Configuration
```js
new SassPlugin("./path/to/file", mode = (undefined <> "development" | "production"), node-sass-config = {})
```
*node-sass-config* is the direct options to ** [node-sass](https://github.com/sass/node-sass#options)**


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

If you're working with a css library like Bootstrap 3+ feel free to add it in the working space:
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
5. Create new Pull Request

SASS-webpack-plugin is released under the [MIT License](./LICENSE).
