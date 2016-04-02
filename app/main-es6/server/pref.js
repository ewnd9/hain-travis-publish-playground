'use strict';

const _ = require('lodash');

const schemaDefaults = require('../../utils/schema-defaults');

const conf = require('../conf');
const schema = require('./preferences.json');

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
  const defaults = schemaDefaults(schema);
  update(defaults);
  return defaults;
}

function commit() {
  prefStore.set(PREF_KEY, tempPref);
  _isDirty = false;
}

if (!prefStore.has(PREF_KEY)) {
  reset();
} else {
  tempPref = prefStore.get(PREF_KEY);
}

module.exports = {
  schema,
  get,
  update,
  reset,
  commit,
  get isDirty() {
    return _isDirty;
  }
};
