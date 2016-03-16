'use strict';

process.noAsar = false;
require('babel-polyfill');

const co = require('co');
const dialog = require('electron').dialog;
const loggerFactory = require('./logger');
const logger = loggerFactory.create('main');
const electronApp = require('electron').app;

const appContext = {
  app: null,
  logger: null,
  plugins: null,
  server: null,
  toast: null
};

co(function* () {
  // has no-dependency
  appContext.logger = loggerFactory;
  appContext.toast = require('./toast');
  // has a dependency
  const server = require('./server')(appContext);
  const app = require('./app/app')(appContext);
  const plugins = require('./plugins')(appContext);

  appContext.server = server;
  appContext.app = app;
  appContext.plugins = plugins;

  yield plugins.initialize();
}).catch((err) => {
  logger.log(err);
  dialog.showErrorBox('Hain', `Unhandled Error: ${err}\n${err.stack}`);
  electronApp.quit();
});
