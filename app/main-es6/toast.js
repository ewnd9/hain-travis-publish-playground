'use strict';

const textutil = require('./utils/textutil');

module.exports = (context) => {
  const rpc = context.rpc;

  function enqueue(message, duration) {
    rpc.send('on-toast', {
      message: textutil.sanitize(message),
      duration
    });
  }

  return { enqueue };
};
