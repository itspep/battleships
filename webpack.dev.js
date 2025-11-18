const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: './dist',
    open: true,
    hot: true,
    port: 8080,
    historyApiFallback: true,
  },
  stats: 'minimal',
});