'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

class PrefObj extends EventEmitter {
  constructor(pref) {
    super();
    this.pref = pref || {};
  }

  update(pref) {
    this.pref = pref;
    this.emit('update', pref);
  }

  get(path) {
    if (path === undefined)
      return this.pref;
    return _.get(this.pref, path);
  }
}

module.exports = PrefObj;
