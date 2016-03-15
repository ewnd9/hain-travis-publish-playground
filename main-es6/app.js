'use strict';

const _ = require('lodash');
const electron = require('electron');
const cp = require('child_process');

const dialog = electron.dialog;
const electronApp = electron.app;
const globalShortcut = electron.globalShortcut;

const logger = require('./logger').create('app');

const window = require('./window');
const iconProtocol = require('./iconprotocol');

const toast = require('./services/toast');

module.exports = (context) => {
  let _isRestarting = false;

  function registerShortcut() {
    globalShortcut.register('alt+space', () => {
      if (window.isContentLoading() && !context.isPluginsLoaded()) {
        logger.log('please wait a seconds, you can use shortcut after loaded');
        return;
      }
      window.showWindowOnCenter();
    });
  }

  const isRestarted = (_.includes(process.argv, '--restarted'));
  const shouldQuit = electronApp.makeSingleInstance((cmdLine, workingDir) => {
    if (_isRestarting)
      return;
    window.showWindowOnCenter();
  });

  if (shouldQuit && !isRestarted) {
    electronApp.quit();
    return;
  }

  electronApp.on('ready', () => {
    window.createTray();
    registerShortcut();
    window.createWindow(() => {
      if (isRestarted) {
        window.showWindowOnCenter();
        toast('restarted');
      }
    });
  });

  electronApp.on('will-quit', () => {
    globalShortcut.unregisterAll();
    window.destroyRefs();
  });
  iconProtocol.register();

  function restart() {
    if (_isRestarting)
      return;
    _isRestarting = true;

    const argv = [].concat(process.argv);
    if (!_.includes(argv, '--restarted')) {
      argv.push('--restarted');
    }
    cp.exec(argv.join(' '));
    setTimeout(() => electronApp.quit(), 500);
  }

  function quit() {
    electronApp.quit();
  }

  return { restart, quit };
};
