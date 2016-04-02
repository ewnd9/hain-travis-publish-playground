'use strict';

const electron = require('electron');
const Tray = electron.Tray;
const Menu = electron.Menu;

const co = require('co');
const path = require('path');
const autolaunch = require('./autolaunch');

let tray = null;

function* createTray() {
  const mainWindow = require('./mainwindow');
  const prefWindow = require('./prefwindow');
  const app = require('./app');

  const iconPath = path.normalize(`${__dirname}/../../../images/tray_16.ico`);
  const autoLaunchActivated = yield autolaunch.isActivated();
  tray = new Tray(iconPath);
  const menu = Menu.buildFromTemplate([
    {
      label: 'Hain', click: () => mainWindow.showWindowOnCenter()
    },
    {
      label: 'Auto-launch', type: 'checkbox', checked: autoLaunchActivated,
      click: () => autolaunch.toggle()
    },
    {
      type: 'separator'
    },
    {
      label: 'Preferences', click: () => prefWindow.show()
    },
    {
      label: 'Restart', click: () => app.restart()
    },
    {
      label: 'Quit', click: () => app.quit()
    }
  ]);
  tray.on('click', () => {
    mainWindow.showWindowOnCenter();
  });
  tray.setToolTip('Hain');
  tray.setContextMenu(menu);
}

module.exports = {
  createTray: co.wrap(createTray)
};
