'use strict';

const ipc = require('electron').ipcMain;
const co = require('co');
const logger = require('../utils/logger');

const funcs = {};
const clients = {};
const msgQueuePerClients = {};

function define(funcName, func) {
  funcs[funcName] = func;
}

function send(clientName, channel, msg) {
  let msgQueue = msgQueuePerClients[clientName];
  if (msgQueue === undefined) {
    msgQueue = [];
    msgQueuePerClients[clientName] = msgQueue;
  }
  msgQueue.push({ clientName, channel, msg });
}

function on(channel, func) {
  ipc.on(channel, func);
}

function startProcessingQueue() {
  setInterval(() => {
    for (const clientName in msgQueuePerClients) {
      const client = clients[clientName];
      if (client === undefined)
        continue;

      const msgQueue = msgQueuePerClients[clientName];
      while (msgQueue.length > 0) {
        const item = msgQueue.shift();
        client.send(item.channel, item.msg);
      }
    }
  }, 5);
}

ipc.on('__connect', (evt, msg) => {
  const clientName = msg;
  clients[clientName] = evt.sender;
});

ipc.on('__rpc_call', (evt, msg) => {
  const { funcName, id, params } = msg;
  const replyChannel = `__rpc_${id}`;

  const generator = funcs[funcName];
  if (generator === undefined) {
    evt.sender.send(replyChannel, 'undefined function', null);
    return;
  }

  co(generator(params)).then((ret) => {
    evt.sender.send(replyChannel, null, ret);
  }).catch((err) => {
    logger.log(err);
    evt.sender.send(replyChannel, err, null);
  });
});

module.exports = {
  define, send, on, startProcessingQueue
};
