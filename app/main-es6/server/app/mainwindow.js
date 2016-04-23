'use strict';

const electron = require('electron');
const shell = electron.shell;
const BrowserWindow = electron.BrowserWindow;

const platformUtil = require('../../../platform-util');
const rpc = require('../rpc-server');

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

  browserWindow.webContents.on('new-window', (evt, url) => {
    shell.openExternal(encodeURI(url));
    evt.preventDefault();
  });
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

function setQuery(query) {
  rpc.send('mainwindow', 'set-query', query);
}

function hideAndRefreshWindow(dontRestoreFocus) {
  if (browserWindow === null)
    return;

  browserWindow.hide();

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

function isVisible() {
  return browserWindow.isVisible();
}

module.exports = {
  createWindow,
  showWindowOnCenter,
  setQuery,
  hideAndRefreshWindow,
  toggleWindow,
  isContentLoading,
  isVisible
};
