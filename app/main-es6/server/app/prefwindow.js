'use strict';

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

let browserWindow = null;

function show() {
  if (browserWindow !== null)
    return;
  browserWindow = new BrowserWindow({
    width: 800,
    height: 510,
    center: true,
    show: false,
    maximizable: false
  });
  browserWindow.loadURL(`file://${__dirname}/../../../dist/preferences.html`);
  browserWindow.on('close', () => (browserWindow = null));
  browserWindow.show();
}

module.exports = {
  show
};
