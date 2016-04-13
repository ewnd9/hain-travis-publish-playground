'use strict';

const lo_assign = require('lodash.assign');

const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const electronApp = require('electron').app;

const rpc = require('./rpc-server');
const proxyHandler = require('./server-proxyhandler');
const app = require('./app/app');
const pref = require('./pref');
const asyncutil = require('../utils/asyncutil');

let workerProcess = null;
let isPluginsReady = false;

let workerHandlers = {
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

function mergeWorkerHandlers(handlers) {
  workerHandlers = lo_assign(workerHandlers, handlers);
}

function handleWorkerMessage(msg) {
  const handler = workerHandlers[msg.type];
  if (handler === undefined)
    throw new Error('can\'t find a worker handler');
  handler(msg.payload);
}

const _preMsgQueue = [];
let _readyToSendmsg = false;

function waitForSendmsgReady() {
  asyncutil.runWhen(() => (workerProcess !== null && workerProcess.connected), () => {
    _readyToSendmsg = true;
    while (_preMsgQueue.length > 0) {
      const msg = _preMsgQueue.shift();
      workerProcess.send(msg);
    }
  });
}

function sendmsg(type, payload) {
  if (!_readyToSendmsg) {
    _preMsgQueue.push({ type, payload });
    return;
  }
  workerProcess.send({ type, payload });
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

  const initialGlobalPref = pref.get();
  sendmsg('initialize', { initialGlobalPref });
  waitForSendmsgReady();

  electronApp.on('quit', () => {
    try {
      if (workerProcess)
        workerProcess.kill();
    } catch (e) { }
  });
}

const appPrefId = 'Hain';
const workerPrefHandlers = {
  'on-get-plugin-pref-ids': (payload) => {
    const pluginPrefIds = payload;
    const appPrefItem = {
      id: appPrefId,
      group: 'Application'
    };
    const pluginPrefItems = pluginPrefIds.map(x => ({
      id: x,
      group: 'Plugins'
    }));
    const prefItems = [appPrefItem].concat(pluginPrefItems);
    rpc.send('prefwindow', 'on-get-pref-items', prefItems);
  },
  'on-get-preferences': (payload) => {
    const { prefId, schema, model } = payload;
    rpc.send('prefwindow', 'on-get-preferences', { prefId, schema, model });
  }
};
mergeWorkerHandlers(workerPrefHandlers);

// Preferences
rpc.on('getPrefItems', (evt, msg) => {
  sendmsg('getPluginPrefIds');
});

rpc.on('getPreferences', (evt, msg) => {
  const prefId = msg;
  if (prefId === appPrefId) {
    const schema = JSON.stringify(pref.schema);
    const model = pref.get();
    rpc.send('prefwindow', 'on-get-preferences', { prefId, schema, model });
    return;
  }
  sendmsg('getPreferences', prefId);
});

rpc.on('updatePreferences', (evt, msg) => {
  const { prefId, model } = msg;
  if (prefId === appPrefId) {
    pref.update(model);
    return;
  }
  sendmsg('updatePreferences', msg);
});

rpc.on('resetPreferences', (evt, msg) => {
  const prefId = msg;
  if (prefId === appPrefId) {
    const schema = JSON.stringify(pref.schema);
    const model = pref.reset();
    rpc.send('prefwindow', 'on-get-preferences', { prefId, schema, model });
    return;
  }
  sendmsg('resetPreferences', prefId);
});

function commitPreferences() {
  sendmsg('commitPreferences');

  if (pref.isDirty) {
    const globalPref = pref.get();
    sendmsg('updateGlobalPreferences', globalPref);
    pref.commit();
  }
}

rpc.on('search', (evt, msg) => {
  const { ticket, query } = msg;
  sendmsg('searchAll', { ticket, query });
});

rpc.define('execute', function* (params) {
  const { pluginId, id, payload } = params;
  sendmsg('execute', { pluginId, id, payload });
});

rpc.on('renderPreview', (evt, msg) => {
  const { ticket, pluginId, id, payload } = msg;
  sendmsg('renderPreview', { ticket, pluginId, id, payload });
});

rpc.define('close', function* () {
  app.close();
});

module.exports = {
  initialize,
  commitPreferences,
  get isLoaded() { return (workerProcess !== null && workerProcess.connected && isPluginsReady); }
};
