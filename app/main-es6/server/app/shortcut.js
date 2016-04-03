'use strict';

const electron = require('electron');
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;

const pref = require('../pref');
const mainWindow = require('./mainwindow');

function _registerShortcut(shortcut) {
  globalShortcut.register(shortcut, () => {
    if (mainWindow.isContentLoading())
      return;
    mainWindow.toggleWindow();
  });
}

function registerShortcutByPref() {
  const shortcut = pref.get().shortcut;
  try {
    _registerShortcut(shortcut);
  } catch (e) {
    dialog.showErrorBox('Hain', `Failed to register shortcut: ${shortcut}`);
  }
}

function clearShortcut() {
  globalShortcut.unregisterAll();
}

function onUpdatePreferences() {
  clearShortcut();
  registerShortcutByPref();
}

function initializeAndRegisterShortcut() {
  registerShortcutByPref();
  pref.on('update', onUpdatePreferences);
}

module.exports = {
  initializeAndRegisterShortcut,
  clearShortcut
};
