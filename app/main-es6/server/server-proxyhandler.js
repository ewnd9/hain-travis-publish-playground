'use strict';

const shell = require('electron').shell;
const app = require('./app/app');
const rpc = require('./rpc-server');
const toast = require('./toast');
const clientLogger = require('./client-logger');

const proxyHandlers = {};

function handle(service, func, args) {
  const handler = proxyHandlers[service];
  const _func = handler[func];
  _func(args);
}

proxyHandlers.app = {
  restart: () => app.restart(),
  quit: () => app.quit(),
  close: () => app.close(),
  setInput: (text) => {
    rpc.send('set-input', text);
  }
};

proxyHandlers.toast = {
  enqueue: (args) => {
    const { message, duration } = args;
    toast.enqueue(message, duration);
  }
};

proxyHandlers.shell = {
  showItemInFolder: (fullPath) => shell.showItemInFolder(fullPath),
  openItem: (fullPath) => shell.openItem(fullPath),
  openExternal: (fullPath) => shell.openExternal(fullPath)
};

proxyHandlers.logger = {
  log: (msg) => clientLogger.log(msg)
};

module.exports = { handle };
