'use strict';

const _ = require('lodash');
const cp = require('child_process');

const electron = require('electron');
const electronApp = electron.app;
const globalShortcut = electron.globalShortcut;

const asyncutil = require('../../utils/asyncutil');
const logger = require('../../utils/logger');
const firstLaunch = require('./firstlaunch');
const autolaunch = require('./autolaunch');

const mainWindow = require('./mainwindow');
const prefWindow = require('./prefwindow');
const iconProtocol = require('./iconprotocol');
const toast = require('../toast');
const pref = require('../pref');

let _isRestarting = false;

function registerShortcut() {
  const shortcut = pref.get().shortcut;
  globalShortcut.register(shortcut, () => {
    if (_isRestarting)
      return;
    if (mainWindow.isContentLoading()) {
      logger.log('please wait a seconds, you can use shortcut after loaded');
      return;
    }
    mainWindow.showWindowOnCenter();
  });
}

function launch() {
  const server = require('../server');
  const tray = require('./tray');

  if (firstLaunch.isFirstLaunch) {
    autolaunch.activate();
  }

  const isRestarted = (_.includes(process.argv, '--restarted'));
  const silentLaunch = (_.includes(process.argv, '--silent'));
  const shouldQuit = electronApp.makeSingleInstance((cmdLine, workingDir) => {
    if (_isRestarting)
      return;
    mainWindow.showWindowOnCenter();
  });

  if (shouldQuit && !isRestarted) {
    electronApp.quit();
    return;
  }

  electronApp.on('ready', () => {
    tray.createTray(this).catch(err => logger.log(err));
    registerShortcut();
    mainWindow.createWindow(() => {
      if (!silentLaunch || isRestarted) {
        asyncutil.runWhen(() => (!mainWindow.isContentLoading() && server.isLoaded),
          () => mainWindow.showWindowOnCenter(), 100);
      }
      if (isRestarted)
        toast.enqueue('Restarted');
    });
  });

  electronApp.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
  iconProtocol.register();
}

function close() {
  mainWindow.hideAndRefreshWindow();
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

function openPreferences() {
  prefWindow.show();
}

module.exports = { launch, close, restart, quit, openPreferences };
