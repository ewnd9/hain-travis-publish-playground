'use strict';

const _ = require('lodash');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const electronApp = require('electron').app;

const rpc = require('./rpc-server');
const proxyHandler = require('./server-proxyhandler');
const app = require('./app/app');

let workerProcess = null;
let isPluginsReady = false;

const workerHandlers = {
  error: (payload) => logger.log(`Unhandled Plugin Error: ${payload}`),
  ready: (payload) => (isPluginsReady = true),
  proxy: (payload) => {
    const { service, func, args } = payload;
    proxyHandler.handle(service, func, args);
  },
  'on-ipc-pipe': (payload) => {
    const { target, channel, msg } = payload;
    rpc.send(target, channel, msg);
  }
};

function handleWorkerMessage(msg) {
  const handler = workerHandlers[msg.type];
  if (handler === undefined)
    throw new Error('can\'t find a worker handler');
  handler(msg.payload);
}

function initialize() {
  const workerPath = path.join(__dirname, '../worker/worker.js');
  if (!fs.existsSync(workerPath))
    throw new Error('can\'t execute plugin process');

  workerProcess = cp.fork(workerPath, [], {
    silent: true
  });
  workerProcess.on('message', (msg) => {
    handleWorkerMessage(msg);
  });
  electronApp.on('quit', () => {
    try {
      if (workerProcess)
        workerProcess.kill();
    } catch (e) { }
  });
}

function sendmsg(type, payload) {
  workerProcess.send({ type, payload });
}

rpc.on('search', (evt, msg) => {
  const { ticket, query } = msg;
  sendmsg('searchAll', { ticket, query });
});

rpc.define('worker-pipe', function* (params) {
  const { type, payload } = params;
  sendmsg(type, payload);
});

rpc.define('execute', function* (params) {
  const { pluginId, id, payload } = params;
  sendmsg('execute', { pluginId, id, payload });
});

rpc.define('close', function* () {
  app.close();
});

module.exports = {
  initialize,
  get isLoaded() { return (workerProcess !== null && workerProcess.connected && isPluginsReady); }
};
