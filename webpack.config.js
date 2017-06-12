/* eslint-disable comma-dangle */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATH_DIST = path.join(__dirname, 'dist');

module.exports = (env = {}) => {
  const ENV = env.e || env.env || env.environment || 'dev';
  const IS_LOC = ENV === 'loc';
  const IS_DEV = ENV === 'dev';
  const IS_PROD = ENV === 'prod';

  const config = {
    entry: path.join(__dirname, 'src', 'index.js'),

    output: {
      path: PATH_DIST,
      filename: `es6-store${IS_PROD ? '.min' : ''}.js`,
      library: 'ES6Store',
      libraryTarget: 'umd'
    },

    devtool: IS_DEV ? 'cheap-inline-module-source-map' : '',

    watch: IS_LOC,

    watchOptions: {
      aggregateTimeout: 100
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          enforce: 'pre',
          loader: 'eslint-loader',
          options: {
            configFile: path.join(__dirname, '.eslintrc.js')
          }
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader'
        }
      ]
    },

    plugins: [],

    devServer: {
      contentBase: PATH_DIST,
      host: 'localhost', // default
      port: 8080, // default,
      watchContentBase: true
    }
  };

  if (IS_LOC) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        filename: 'index.html'
      })
    );
  }

  if (IS_PROD) {
    process.env.NODE_ENV = 'production';

    config.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    );
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
  }

  return config;
};
