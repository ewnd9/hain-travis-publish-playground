'use strict';

const _ = require('lodash');
const cp = require('child_process');
const path = require('path');

module.exports = (context) => {
  const rpc = context.rpc;
  const logger = context.logger.create('server');
  const proxyHandler = require('./server-proxyhandler')(context);

  let workerProcess = null;
  let _delayedSearch = 0;

  function searchAll(ticket, query) {
    workerProcess.send({
      type: 'searchAll',
      args: { ticket, query }
    });
  }

  function handleWorkerMessage(msg) {
    if (msg.type === 'on-result') {
      rpc.send('on-result', msg.args); /* ticket, type (add, remove), payload */
    } else if (msg.type === 'proxy') {
      const { service, func, args } = msg.args;
      proxyHandler.handle(service, func, args);
    }
  }

  function initialize() {
    workerProcess = cp.fork(path.join(__dirname, './plugin-worker/worker.js'));
    workerProcess.on('message', (msg) => {
      handleWorkerMessage(msg);
    });
  }

  rpc.on('search', (evt, params) => {
    const { ticket, query } = params;

    clearInterval(_delayedSearch);
    if (workerProcess === null || !workerProcess.connected) {
      _delayedSearch = setInterval(() => {
        logger.log('waiting plugins...');
        if (workerProcess !== null && workerProcess.connected) {
          searchAll(ticket, query);
          clearInterval(_delayedSearch);
        }
      }, 500);
      return;
    }
    searchAll(ticket, query);
  });

  rpc.define('execute', function* (params) {
    const { pluginId, id, payload } = params;
    workerProcess.send({
      type: 'execute',
      args: { pluginId, id, payload }
    });
  });

  rpc.define('close', function* () {
    context.app.close();
  });

  return {
    initialize,
    get isLoaded() { return (workerProcess !== null && workerProcess.connected); }
  };
};
