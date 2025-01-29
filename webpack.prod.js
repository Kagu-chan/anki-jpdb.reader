const { config } = require('./webpack.common.js');

module.exports = async () => await config({ production: true, firefox: true });
