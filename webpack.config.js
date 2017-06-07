const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');

module.exports = (env={}) => ({
  context: srcDir,

  entry: {
    events: './events',
    'find-api-token': './find-api-token',
    popup: './popup',
    vendor: [
      'mixpanel-browser',
      'moment',
      'vue',
      'vue-router',
      'vuex',
    ],
  },

  output: {
    path: distDir,
    filename: '[name].js',
  },

  resolve: {
    alias: {
      '@': srcDir,
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: srcDir,
        loader: 'babel-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          cssModules: {
            localIdentName: '[local]--[hash:base64:5]',
            camelCase: true,
          },
          postcss: [autoprefixer],
        },
      },
      {
        // Disable ejs for HtmlWebpackPlugin to speed up builds.
        test: /\.html$/,
        include: srcDir,
        loader: 'html-loader',
      },
    ],
  },

  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),  // exclude i18n
    new webpack.DefinePlugin({
      MIXPANEL_TOKEN: '6cc73b1df12b2e1ba0892da5da2a7216',
      DEBUG: !env.production,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['popup'],
    }),
    new CopyWebpackPlugin([{
      context: __dirname,
      from: 'manifest.json',
    }]),
    new HtmlWebpackPlugin({
      chunks: ['vendor', 'popup'],
      template: 'popup/index.html',
      filename: 'popup.html',
      title: 'Linkhunter',
    }),
  ].concat(env.production ? [new UglifyJsWebpackPlugin()] : []),

  devtool: env.production ? false : 'source-map',
  target: 'web',
});