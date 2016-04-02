'use strict';

const jsonSchemaDefaults = require('json-schema-defaults');

const conf = require('../conf');
const schema = require('./preferences.json');

const SimpleStore = require('../utils/simple-store');
const prefStore = SimpleStore(conf.APP_PREF_DIR);

const PREF_KEY = 'hain';

if (!prefStore.has(PREF_KEY)) {
  reset();
}

function get() {
  return prefStore.get(PREF_KEY);
}

function update(model) {
  prefStore.set(PREF_KEY, model);
}

function reset() {
  const defaults = jsonSchemaDefaults(schema);
  prefStore.set(PREF_KEY, defaults);
  return defaults;
}

module.exports = { get, update, reset, schema };
