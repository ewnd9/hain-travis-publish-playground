'use strict';

const _ = require('lodash');
const electron = require('electron');
const cp = require('child_process');

const dialog = electron.dialog;
const app = electron.app;
const globalShortcut = electron.globalShortcut;

const logger = require('./logger').create('main');

const window = require('./window');
const server = require('./server');
const iconProtocol = require('./icon-protocol');
const toast = require('./services/toast');
const autolaunch = require('./autolaunch');

function registerShortcut() {
  globalShortcut.register('alt+space', () => {
    if (window.isContentLoading() || server.isLoading()) {
      logger.log('please wait a seconds, you can use shortcut after loaded');
      return;
    }
    window.showWindowOnCenter();
  });
}

let _isRestarting = false;

const shouldSetAutolaunch = (_.includes(process.argv, '--setautolaunch'));
if (shouldSetAutolaunch) {
  autolaunch.activate();
}

const isRestarted = (_.includes(process.argv, '--restarted'));
const shouldQuit = app.makeSingleInstance((cmdLine, workingDir) => {
  if (_isRestarting)
    return;
  window.showWindowOnCenter();
});

if (shouldQuit && !isRestarted) {
  app.quit();
} else {
  app.on('ready', () => {
    window.createTray();
    server.start().then(() => {
      registerShortcut();
      window.createWindow(() => {
        if (isRestarted) {
          window.showWindowOnCenter();
          toast('restarted');
        }
      });
    }).catch((err) => {
      logger.log(err);
      dialog.showErrorBox('unhandled error occured!', err);
      app.quit();
    });
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    window.destroyRefs();
  });

  iconProtocol.register();
}

function restart() {
  if (_isRestarting)
    return;
  _isRestarting = true;

  const argv = [].concat(process.argv);
  if (!_.includes(argv, '--restarted')) {
    argv.push('--restarted');
  }
  cp.exec(argv.join(' '));
  setTimeout(() => app.quit(), 500);
}

module.exports = {
  restart: restart
};
