'use strict';

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

const platformUtil = require('../../../platform-util');
const pref = require('../pref');

let browserWindow = null;

function createWindow(cb) {
  browserWindow = new BrowserWindow({
    width: 800,
    height: 510,
    alwaysOnTop: true,
    center: true,
    frame: false,
    show: false,
    closable: false,
    minimizable: false,
    maximizable: false,
    moveable: false,
    resizable: false,
    skipTaskbar: true
  });

  if (cb) {
    browserWindow.webContents.on('did-finish-load', cb);
  }

  browserWindow.loadURL(`file://${__dirname}/../../../dist/index.html`);
  browserWindow.on('blur', () => {
    if (browserWindow.webContents.isDevToolsOpened())
      return;
    hideAndRefreshWindow(true);
  });
}

function _centerWindowOnSelectedScreen(window) {
  const screen = electron.screen;

  let selectedDisplay = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();
  const cursorPos = screen.getCursorScreenPoint();

  for (const display of displays) {
    const bounds = display.bounds;
    const [left, right, top, bottom] = [bounds.x, bounds.x + bounds.width, bounds.y, bounds.y + bounds.height];
    if (cursorPos.x < left || cursorPos.x > right)
      continue;
    if (cursorPos.y < top || cursorPos.y > bottom)
      continue;

    selectedDisplay = display;
    break;
  }

  const windowSize = window.getSize();
  const displayBounds = selectedDisplay.bounds;

  const centerPos = [displayBounds.x + displayBounds.width * 0.5, displayBounds.y + displayBounds.height * 0.5];
  centerPos[0] -= windowSize[0] * 0.5; // x
  centerPos[1] -= windowSize[1] * 0.5; // y

  window.setPosition(Math.round(centerPos[0]), Math.round(centerPos[1]));
}

function showWindowOnCenter() {
  if (browserWindow === null)
    return;

  platformUtil.saveFocus();
  _centerWindowOnSelectedScreen(browserWindow);
  browserWindow.show();
}

function hideAndRefreshWindow(dontRestoreFocus) {
  if (browserWindow === null)
    return;

  browserWindow.hide();

  const clearQuery = pref.get('clearQuery');
  if (clearQuery)
    browserWindow.webContents.executeJavaScript('clearQuery()');

  if (!dontRestoreFocus) {
    platformUtil.restoreFocus();
  }
}

function toggleWindow() {
  if (browserWindow === null)
    return;

  if (browserWindow.isVisible()) {
    hideAndRefreshWindow();
  } else {
    showWindowOnCenter();
  }
}

function isContentLoading() {
  return browserWindow.webContents.isLoading();
}

module.exports = {
  createWindow,
  showWindowOnCenter,
  hideAndRefreshWindow,
  toggleWindow,
  isContentLoading
};
