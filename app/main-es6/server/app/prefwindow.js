'use strict';

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

let browserWindow = null;

function show() {
  if (browserWindow !== null)
    return;
  browserWindow = new BrowserWindow({
    width: 800,
    height: 650,
    center: true,
    show: false,
    maximizable: false
  });
  browserWindow.loadURL(`file://${__dirname}/../../../dist/preferences.html`);
  browserWindow.on('close', () => {
    browserWindow = null;

    const server = require('../server');
    server.commitPreferences();
  });
  browserWindow.setMenuBarVisibility(false);
  browserWindow.show();
}

module.exports = {
  show
};
