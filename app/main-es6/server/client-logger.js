'use strict';

const rpc = require('./rpc-server');

function log(msg) {
  rpc.send('mainwindow', 'on-log', { msg });
}

module.exports = { log };
