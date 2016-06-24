'use strict';

let path = require('path');
let args = require('yargs').argv;
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');

const PATH_DIST = path.join(__dirname, 'dist');

const ENV = args.e || args.env || args.environment || 'dev';
const IS_DEV = ENV === 'dev';
const IS_PROD = ENV === 'prod';

let entry = ['babel-polyfill', path.join(__dirname, 'src', 'Store.js')];

let output = {
  path: PATH_DIST,
  filename: 'index.js',
  library: 'ES6Store'
};

module.exports = {
  entry,

  devtool: IS_DEV ? 'cheap-inline-module-source-map' : '',

  watch: IS_DEV,

  watchOptions: {
    aggregateTimeout: 100
  },

  output,

  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
  },

  module: {
    preLoaders: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      loader: "eslint-loader"
    }],
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }]
  },

  eslint: {
    configFile: path.join(__dirname, '.eslintrc.js')
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      IS_DEV: JSON.stringify(IS_DEV),
      IS_PROD: JSON.stringify(IS_PROD)
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html'
    })
  ],

  devServer: {
    contentBase: PATH_DIST,
    host: 'localhost', // default
    port: 8080, // default
    hot: true,
    historyApiFallback: {
      index: '/index.html'
    }
  }
};

if (IS_PROD) {
  process.env.NODE_ENV = 'production';

  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      comments: false
    })
  );
}
