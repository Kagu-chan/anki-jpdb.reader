const { merge } = require('webpack-merge');
const { config } = require('./webpack.common.js');

module.exports = async () =>
  merge(await config({ development: true }), {
    devtool: 'source-map',
  });
