const path = require('path');
const SassWebpackPlugin = require('../dist/');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let watchOptions = {};
if(process.env.USER === 'vagrant') {
  watchOptions.poll = 500;
  watchOptions.ignored = /node_modules/;
}

module.exports = {
  entry: './demo/src/index.js',
  plugins: [
    new SassWebpackPlugin('./demo/src/page.sass', 'development', { sass: { sourceMapEmbed: false } }),
    new SassWebpackPlugin({ './demo/src/loading.scss': 'components/loader.css' }, 'production', { sass: { includePaths: [path.resolve(__dirname, '..', 'node_modules')] } }),
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: require('html-webpack-template'),
      title: 'Sass webpack plugin',
      links: [
        { rel: 'stylesheet', type: 'text/css', href: '/page.css' },
        { rel: 'stylesheet', type: 'text/css', href: '/components/loader.css' }
      ],
      appMountId: 'app'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: true
  },
  watchOptions
}
