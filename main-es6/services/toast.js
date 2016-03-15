'use strict';

const rpc = require('../rpc-server');

module.exports = function (message) {
  rpc.send('on-toast', { message });
};
