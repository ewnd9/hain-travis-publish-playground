'use strict';

const webpack = require('webpack');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
const path = require('path');

const options = {
  bail: true,
  entry: {
    app: './app/renderer/app.jsx'
  },
  output: {
    path: path.join(__dirname, 'app', 'dist'),
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
};

options.target = webpackTargetElectronRenderer(options);

module.exports = options;
