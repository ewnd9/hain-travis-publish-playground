'use strict';

const _ = require('lodash');
const electron = require('electron');
const cp = require('child_process');
const asyncutil = require('../../utils/asyncutil');
const logger = require('../../utils/logger');

const electronApp = electron.app;
const globalShortcut = electron.globalShortcut;
const firstLaunch = require('./firstlaunch');
const autolaunch = require('./autolaunch');

module.exports = (context) => {
  const window = require('./window')(context);
  const iconProtocol = require('./iconprotocol')(context);
  let _isRestarting = false;

  if (firstLaunch.isFirstLaunch) {
    autolaunch.activate();
  }

  function registerShortcut() {
    globalShortcut.register('alt+space', () => {
      if (_isRestarting)
        return;
      if (window.isContentLoading()) {
        logger.log('please wait a seconds, you can use shortcut after loaded');
        return;
      }
      window.toggleWindow();
    });
  }

  const isRestarted = (_.includes(process.argv, '--restarted'));
  const silentLaunch = (_.includes(process.argv, '--silent'));
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
    window.createTray().catch(err => logger.log(err));
    registerShortcut();
    window.createWindow(() => {
      if (!silentLaunch || isRestarted) {
        asyncutil.runWhen(() => (!window.isContentLoading() && context.server.isLoaded),
          () => window.showWindowOnCenter(), 100);
      }
      if (isRestarted)
        context.toast.enqueue('Restarted');
    });
  });

  electronApp.on('will-quit', () => {
    globalShortcut.unregisterAll();
    window.destroyRefs();
  });
  iconProtocol.register();

  function close() {
    window.hideAndRefreshWindow();
  }

  function restart() {
    if (_isRestarting)
      return;
    _isRestarting = true;

    const argv = [].concat(process.argv);
    if (!_.includes(argv, '--restarted')) {
      argv.push('--restarted');
    }
    if (!argv[0].startsWith('"')) {
      argv[0] = `"${argv[0]}"`;
    }
    cp.exec(argv.join(' '));
    setTimeout(() => electronApp.quit(), 500);
  }

  function quit() {
    electronApp.quit();
  }

  return { close, restart, quit };
};
