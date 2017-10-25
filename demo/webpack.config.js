const path = require('path');
const SassWebpackPlugin = require('../dist/');
const HtmlWebpackPlugin = require('html-webpack-plugin');

console.log(__dirname);
module.exports = {
  entry: './demo/src/index.js',
  plugins: [
    new SassWebpackPlugin('./demo/src/page.sass'),
    new SassWebpackPlugin({ './demo/src/loading.scss': 'components/loader.css' }),
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: require('html-webpack-template'),
      title: 'Sass webpack plugin',
      links: [
        { rel: 'stylesheet', type: 'text/css', href: '/page.css' },
        { rel: 'stylesheet', type: 'text/css', href: '/components/loader.css' }
      ],
      appMountIds: ['loading', 'title']
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
  }
}
