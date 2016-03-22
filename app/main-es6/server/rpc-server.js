'use strict';

const ipc = require('electron').ipcMain;
const co = require('co');

const self = {};
const funcs = {};
const msgQueue = [];
let connectedClient = null;

self.define = (funcName, func) => {
  funcs[funcName] = func;
};

self.send = (channel, msg) => {
  msgQueue.push({ channel, msg });
};

setInterval(() => {
  if (connectedClient === null)
    return;
  while (msgQueue.length > 0) {
    const item = msgQueue.shift();
    connectedClient.send(item.channel, item.msg);
  }
}, 10);

self.on = (channel, func) => {
  ipc.on(channel, func);
};

ipc.on('__connect', (evt, args) => {
  connectedClient = evt.sender;
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
