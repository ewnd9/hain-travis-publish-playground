'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

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
    return _.get(this.obj, path);
  }
}

module.exports = ObservableObject;
