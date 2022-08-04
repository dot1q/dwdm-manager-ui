const merge = require('webpack-merge');
const path = require('path');
const base64 = require('base-64');
const fs = require('fs');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:9000",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    clientLogLevel: 'debug',
    historyApiFallback: true,
    inline: true,
    contentBase: path.join(__dirname, 'dist', '.'),
    // compress: true,
    port: 9000,
  },
});


// NWAX API Dhx6lzkWhnyoCZM1VxrnTKU1WIKIUENX7r8n6MVZ301xHNnD
