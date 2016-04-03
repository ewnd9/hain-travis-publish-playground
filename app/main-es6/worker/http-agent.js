'use strict';

const tunnel = require('tunnel');
const logger = require('../utils/logger');

let _prefObj = null;
let httpProxyAgent = null;

function createHttpProxyAgent() {
  const proxyPref = _prefObj.get('proxy');
  if (!proxyPref.useProxy)
    return null;

  logger.log('createHttpProxyAgent:');
  logger.log(proxyPref);

  const host = proxyPref.host;
  const port = proxyPref.port;
  return tunnel.httpOverHttp({
    proxy: { host, port }
  });
}

function updateAgents() {
  httpProxyAgent = createHttpProxyAgent();
}

function onPrefUpdate() {
  updateAgents();
}

function initialize(globalPrefObj) {
  _prefObj = globalPrefObj;
  globalPrefObj.on('update', onPrefUpdate);
  updateAgents();
}

module.exports = {
  initialize,
  getHttpProxyAgent: () => httpProxyAgent
};
