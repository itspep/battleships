const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: './dist',
    open: true,
    hot: true,
    port: 8098,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({  // Add this plugin
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
  stats: 'minimal',
});