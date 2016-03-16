'use strict';

const rpc = require('./rpc-server');
const textutil = require('./utils/textutil');

module.exports = function (message, duration) {
  rpc.send('on-toast', {
    message: textutil.sanitize(message),
    duration
  });
};
