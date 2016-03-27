'use strict';

const ipc = require('electron').ipcRenderer;

class RPCRenderer {
  constructor(clientName) {
    this.clientName = clientName;
    this._incrId = 0;
  }

  _allocateId() {
    this._incrId++;
    if (this._incrId > 99999999) {
      this._incrId = 0;
    }
    return this._incrId;
  }

  connect() {
    ipc.send('__connect', this.clientName);
  }

  on(channel, func) {
    ipc.on(channel, func);
  }

  send(channel, args) {
    ipc.send(channel, args);
  }

  call(funcName, params) {
    const id = this._allocateId();
    const promise = new Promise((resolve, reject) => {
      ipc.once(`__rpc_${id}`, (evt, err, ret) => {
        if (err)
          return reject(err);
        return resolve(ret);
      });
      ipc.send('__rpc_call', { funcName, id, params });
    });
    return promise;
  }
}

module.exports = RPCRenderer;
