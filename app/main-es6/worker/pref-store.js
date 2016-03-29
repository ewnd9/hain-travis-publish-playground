'use strict';

const conf = require('../conf');
const SimpleStore = require('../utils/simple-store');

module.exports = SimpleStore(conf.PLUGIN_PREF_DIR);
