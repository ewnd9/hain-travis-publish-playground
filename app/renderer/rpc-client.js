'use strict';

const ipc = require('electron').ipcRenderer;

let incrId = 0;
const self = {};

function allocateId() {
  incrId++;
  if (incrId > 99999999) {
    incrId = 0;
  }
  return incrId;
}

self.connect = () => {
  ipc.send('__connect', null);
};

self.on = (channel, func) => {
  ipc.on(channel, func);
};

self.send = (channel, args) => {
  ipc.send(channel, args);
};

self.call = (funcName, params) => {
  const id = allocateId();
  const promise = new Promise((resolve, reject) => {
    ipc.once(`__rpc_${id}`, (evt, err, ret) => {
      if (err) {
        return reject(err);
      }
      return resolve(ret);
    });
    ipc.send('__rpc_call', {
      funcName: funcName,
      id: id,
      params: params
    });
  });
  return promise;
};

module.exports = self;
