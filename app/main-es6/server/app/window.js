'use strict';

const co = require('co');

const electron = require('electron');
const Tray = electron.Tray;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const platformUtil = require('../../../platform-util');

const autolaunch = require('./autolaunch');

module.exports = (context) => {
  let mainWindow = null;
  let tray = null;

  function createWindow(cb) {
    mainWindow = new BrowserWindow({
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
      mainWindow.webContents.on('did-finish-load', cb);
    }

    mainWindow.loadURL(`file://${__dirname}/../../../dist/index.html`);
    mainWindow.on('blur', () => {
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
      if (cursorPos.x < left || cursorPos.x > right) {
        continue;
      }
      if (cursorPos.y < top || cursorPos.y > bottom) {
        continue;
      }

      selectedDisplay = display;
      break;
    }

    const windowSize = window.getSize();
    const displayBounds = selectedDisplay.bounds;

    const centerPos = [displayBounds.x + displayBounds.width * 0.5, displayBounds.y + displayBounds.height * 0.5];
    centerPos[0] -= windowSize[0] * 0.5; // x
    centerPos[1] -= windowSize[1] * 0.5; // y

    window.setPosition(centerPos[0], centerPos[1]);
  }

  function showWindowOnCenter() {
    if (mainWindow === null) {
      return;
    }

    platformUtil.saveFocus();
    _centerWindowOnSelectedScreen(mainWindow);
    mainWindow.show();
  }

  function hideAndRefreshWindow(dontRestoreFocus) {
    if (mainWindow === null) {
      return;
    }

    mainWindow.hide();
    mainWindow.webContents.executeJavaScript('refresh()');

    if (!dontRestoreFocus) {
      platformUtil.restoreFocus();
    }
  }

  function* createTray() {
    const iconPath = path.normalize(`${__dirname}/../../../images/tray_16.ico`);
    const autoLaunchActivated = yield autolaunch.isActivated();
    tray = new Tray(iconPath);
    const menu = Menu.buildFromTemplate([
      {
        label: 'Hain', click: () => {
          showWindowOnCenter();
        }
      },
      {
        label: 'Auto-launch', type: 'checkbox', checked: autoLaunchActivated,
        click: () => autolaunch.toggle()
      },
      {
        type: 'separator'
      },
      {
        label: 'Restart', click: () => context.app.restart()
      },
      {
        label: 'Quit', click: () => context.app.quit()
      }
    ]);
    tray.on('click', () => {
      showWindowOnCenter();
    });
    tray.setToolTip('Hain');
    tray.setContextMenu(menu);
  }

  function isContentLoading() {
    return mainWindow.webContents.isLoading();
  }

  function destroyRefs() {
    mainWindow = null;
    tray = null;
  }

  return {
    createWindow,
    showWindowOnCenter,
    hideAndRefreshWindow,
    createTray: co.wrap(createTray),
    isContentLoading,
    destroyRefs
  };
};
