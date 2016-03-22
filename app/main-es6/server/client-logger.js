'use strict';

module.exports = (context) => {
  const rpc = context.rpc;

  function log(msg) {
    rpc.send('on-log', { msg });
  }

  return { log };
};
