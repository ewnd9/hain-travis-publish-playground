'use strict';

const _ = require('lodash');
const co = require('co');
const electron = require('electron');
const ipc = electron.ipcMain;

const window = require('./window');
const plugins = require('./plugins');
const rpc = require('./rpc-server');

const logger = require('./logger').create('server');

ipc.on('search', (evt, params) => {
  const { ticket, query } = params;
  const sender = evt.sender;
  plugins.searchAll(query, (ret) => {
    sender.send('on-result', { ticket, ret });
  }).then((ret) => {
  }).catch((err) => {
    logger.log(err);
  });
});

rpc.define('execute', function* (params) {
  const { pluginId, id, payload } = params;
  const ret = yield plugins.execute(pluginId, id, payload);
  if (ret === undefined || ret === null) {
    window.hideAndRefreshWindow();
  }
  return ret;
});

rpc.define('close', function* () {
  window.hideAndRefreshWindow();
});

let ready = false;
function* start() {
  yield plugins.start();
  ready = true;
  logger.log('ready');
}

function isLoading() {
  return !ready;
}

module.exports = {
  start: co.wrap(start),
  isLoading: isLoading
};
