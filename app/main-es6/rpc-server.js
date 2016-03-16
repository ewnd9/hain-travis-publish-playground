'use strict';

const ipc = require('electron').ipcMain;
const co = require('co');

const self = {};
const funcs = {};
let _clientSender = null;

self.define = function (funcName, func) {
  funcs[funcName] = func;
};

self.send = function (channel, args) {
  if (!_clientSender) {
    throw 'can\'t find a client';
  }
  _clientSender.send(channel, args);
};

ipc.on('__connect', (evt, args) => {
  _clientSender = evt.sender;
});

ipc.on('__rpc_call', (evt, args) => {
  const funcName = args.funcName;
  const id = args.id;
  const params = args.params;
  const replyChannel = `__rpc_${id}`;

  const generator = funcs[funcName];
  if (generator === undefined) {
    evt.sender.send(replyChannel, 'undefined function', null);
    return;
  }

  co(generator(params)).then((ret) => {
    evt.sender.send(replyChannel, null, ret);
  }).catch((err) => {
    evt.sender.send(replyChannel, err, null);
  });
});

module.exports = self;
