'use strict';

const _ = require('lodash');
const electron = require('electron');
const ipc = electron.ipcMain;

const rpc = require('./rpc-server');
const logger = require('./logger').create('server');

module.exports = (context) => {
  let _delayedSearch = 0;

  function searchAll(sender, ticket, query) {
    context.plugins.searchAll(query, (ret) => {
      sender.send('on-result', { ticket, ret });
    });
  }

  ipc.on('search', (evt, params) => {
    const { ticket, query } = params;
    const sender = evt.sender;

    clearInterval(_delayedSearch);
    if (context.plugins === null) {
      // wait
      _delayedSearch = setInterval(() => {
        logger.log('waiting plugins...');
        if (context.plugins !== null) {
          searchAll(sender, ticket, query);
          clearInterval(_delayedSearch);
        }
      }, 500);
      return;
    }
    searchAll(sender, ticket, query);
  });

  rpc.define('execute', function* (params) {
    const { pluginId, id, payload } = params;
    const ret = yield context.plugins.execute(pluginId, id, payload);
    if (ret === undefined || ret === null) {
      context.app.closeWindow();
    }
    return ret;
  });

  rpc.define('close', function* () {
    context.app.closeWindow();
  });
  return this;
};
