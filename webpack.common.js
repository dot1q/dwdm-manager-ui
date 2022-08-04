const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: [
      'core-js/fn/array/includes',
      'core-js/fn/promise',
      'core-js/fn/object/assign',
      'whatwg-fetch',
      './src/index.jsx',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist/site'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      // Load a custom template (lodash by default)
      template: './build/templates/html/siteIndex.html',
    }),
    new CopyPlugin([
      { from: 'src/assets', to: 'assets' },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
          options: {
            url: false,
          },
        }],
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
          options: {
            url: false,
          },
        }],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
