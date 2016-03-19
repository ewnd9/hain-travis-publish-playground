'use strict';

require('babel-polyfill');

((function startup() {
  if (require('electron-squirrel-startup')) return;

  // workaround for fixing auto-launch cwd problem
  const path = require('path');
  const exeName = path.basename(process.execPath);
  if (!exeName.startsWith('electron')) {
    process.chdir(path.dirname(process.execPath));
  }

  const co = require('co');
  const dialog = require('electron').dialog;
  const loggerFactory = require('./logger')('main.log');
  const logger = loggerFactory.create('main');
  const electronApp = require('electron').app;

  const appContext = {
    app: null,
    logger: null,
    plugins: null,
    server: null,
    toast: null,
    rpc: null
  };

  co(function* () {
    appContext.logger = loggerFactory;
    appContext.rpc = require('./rpc-server');

    appContext.toast = require('./toast')(appContext);
    appContext.app = require('./app/app')(appContext);
    appContext.server = require('./server')(appContext);

    appContext.server.initialize();
  }).catch((err) => {
    logger.log(err);
    dialog.showErrorBox('Hain', `Unhandled Error: ${err}\n${err.stack}`);
    electronApp.quit();
  });
})());
