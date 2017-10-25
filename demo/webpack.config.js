const path = require('path');
const SassWebpackPlugin = require('../dist/');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  plugins: [
    new SassWebpackPlugin(path.resolve(__dirname, './src/index.scss')),
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: require('html-webpack-template'),
      title: "Sass webpack plugin",
      links: [
        { rel: "stylesheet", type: "text/css", href: "/index.css" }
      ],
      appMountIds: ['loading', 'title']
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: true
  }
}
