'use strict';

const _ = require('lodash');
const electron = require('electron');
const ipc = electron.ipcMain;

const window = require('./window');
const rpc = require('./rpc-server');

const logger = require('./logger').create('server');

module.exports = () => {
  let _plugins = null;
  let _delayedSearch = 0;

  function searchAll(sender, ticket, query) {
    _plugins.searchAll(query, (ret) => {
      sender.send('on-result', { ticket, ret });
    });
  }

  ipc.on('search', (evt, params) => {
    const { ticket, query } = params;
    const sender = evt.sender;

    clearInterval(_delayedSearch);
    if (_plugins === null) {
      // wait
      _delayedSearch = setInterval(() => {
        logger.log('waiting plugins...');
        if (_plugins !== null) {
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
    const ret = yield _plugins.execute(pluginId, id, payload);
    if (ret === undefined || ret === null) {
      window.hideAndRefreshWindow();
    }
    return ret;
  });

  rpc.define('close', function* () {
    window.hideAndRefreshWindow();
  });

  function injectPlugins(plugins) {
    _plugins = plugins;
  }

  return { injectPlugins };
};
