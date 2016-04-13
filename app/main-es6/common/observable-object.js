'use strict';

const EventEmitter = require('events');
const lo_get = require('lodash.get');

class ObservableObject extends EventEmitter {
  constructor(obj) {
    super();
    this.obj = obj || {};
  }

  update(obj) {
    this.obj = obj;
    this.emit('update', obj);
  }

  get(path) {
    if (path === undefined)
      return this.obj;
    return lo_get(this.obj, path);
  }
}

module.exports = ObservableObject;
