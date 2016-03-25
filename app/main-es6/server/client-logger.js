'use strict';

const rpc = require('./rpc-server');

function log(msg) {
  rpc.send('on-log', { msg });
}

module.exports = { log };
