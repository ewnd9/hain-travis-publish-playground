'use strict';

const _ = require('lodash');
const EventEmitter = require('events');
const emitter = new EventEmitter();

const schemaDefaults = require('../../utils/schema-defaults');

const conf = require('../conf');
const appPrefSchema = require('./app-pref-schema');

const SimpleStore = require('../utils/simple-store');
const prefStore = SimpleStore(conf.APP_PREF_DIR);

const PREF_KEY = 'hain';

let tempPref = {};
let _isDirty = false;

function get() {
  return tempPref;
}

function update(pref) {
  if (_.isEqual(tempPref, pref))
    return;
  tempPref = pref;
  _isDirty = true;
}

function reset() {
  const defaults = schemaDefaults(appPrefSchema);
  update(defaults);
  return defaults;
}

function commit() {
  prefStore.set(PREF_KEY, tempPref);

  const copy = _.assign({}, tempPref);
  emitter.emit('update', copy);

  _isDirty = false;
}

function on(eventName, listener) {
  emitter.on(eventName, listener);
}

if (!prefStore.has(PREF_KEY)) {
  reset();
} else {
  tempPref = prefStore.get(PREF_KEY);
}

module.exports = {
  get schema() {
    return appPrefSchema;
  },
  get,
  update,
  reset,
  commit,
  on,
  get isDirty() {
    return _isDirty;
  }
};
