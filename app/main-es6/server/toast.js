'use strict';

const textutil = require('../utils/textutil');
const rpc = require('./rpc-server');

function enqueue(message, duration) {
  rpc.send('on-toast', {
    message: textutil.sanitize(message),
    duration
  });
}

module.exports = { enqueue };
