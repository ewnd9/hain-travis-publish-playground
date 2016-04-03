/* global process */
'use strict';

const logger = require('../utils/logger');
const ObservableObject = require('../common/observable-object');
const httpAgent = require('./http-agent');

function send(type, payload) {
  process.send({ type, payload });
}

function proxyFunc(srcServiceName, funcName, args) {
  send('proxy', {
    service: srcServiceName,
    func: funcName,
    args
  });
}

function ipcPipe(target, channel, msg) {
  send('on-ipc-pipe', { target, channel, msg });
}

const appProxy = {
  restart: () => proxyFunc('app', 'restart'),
  quit: () => proxyFunc('app', 'quit'),
  close: (dontRestoreFocus) => proxyFunc('app', 'close', dontRestoreFocus),
  setInput: (text) => proxyFunc('app', 'setInput', text),
  openPreferences: () => proxyFunc('app', 'openPreferences')
};

const toastProxy = {
  enqueue: (message, duration) => proxyFunc('toast', 'enqueue', { message, duration })
};

const shellProxy = {
  showItemInFolder: (fullPath) => proxyFunc('shell', 'showItemInFolder', fullPath),
  openItem: (fullPath) => proxyFunc('shell', 'openItem', fullPath),
  openExternal: (fullPath) => proxyFunc('shell', 'openExternal', fullPath)
};

const loggerProxy = {
  log: (msg) => {
    logger.log(msg);
    proxyFunc('logger', 'log', msg);
  }
};

const globalPrefObj = new ObservableObject({});

const workerContext = {
  app: appProxy,
  toast: toastProxy,
  shell: shellProxy,
  logger: loggerProxy,
  globalPreferences: globalPrefObj,
  httpAgent
};

let plugins = null;

function handleProcessMessage(msg) {
  try {
    const { type, payload } = msg;
    const msgHandler = msgHandlers[type];
    msgHandler(payload);
  } catch (e) {
    const err = e.stack || e;
    send('error', err);
    logger.log(err);
  }
}

function handleExceptions() {
  process.on('uncaughtException', (err) => {
    logger.log(err);
  });
}

function initialize(initialGlobalPref) {
  try {
    handleExceptions();
    globalPrefObj.update(initialGlobalPref);

    httpAgent.initialize(globalPrefObj);

    plugins = require('./plugins')(workerContext);
    plugins.initialize();
    send('ready');
  } catch (e) {
    const err = e.stack || e;
    send('error', err);
    logger.log(err);
  }
}

const msgHandlers = {
  initialize: (payload) => {
    const { initialGlobalPref } = payload;
    initialize(initialGlobalPref);
  },
  searchAll: (payload) => {
    const { query, ticket } = payload;
    const res = (obj) => {
      const pipeMsg = {
        ticket,
        type: obj.type,
        payload: obj.payload
      };
      ipcPipe('mainwindow', 'on-result', pipeMsg);
    };
    plugins.searchAll(query, res);
  },
  execute: (_payload) => {
    const { pluginId, id, payload } = _payload;
    plugins.execute(pluginId, id, payload);
  },
  getPluginPrefIds: (payload) => {
    const prefIds = plugins.getPrefIds();
    send('on-get-plugin-pref-ids', prefIds);
  },
  getPreferences: (payload) => {
    const prefId = payload;
    const pref = plugins.getPreferences(prefId);
    send('on-get-preferences', pref);
  },
  updatePreferences: (payload) => {
    const { prefId, model } = payload;
    plugins.updatePreferences(prefId, model);
  },
  commitPreferences: (payload) => {
    plugins.commitPreferences();
  },
  resetPreferences: (payload) => {
    const prefId = payload;
    const pref = plugins.resetPreferences(prefId);
    send('on-get-preferences', pref);
  },
  updateGlobalPreferences: (payload) => {
    const model = payload;
    globalPrefObj.update(model);
  }
};

process.on('message', handleProcessMessage);
