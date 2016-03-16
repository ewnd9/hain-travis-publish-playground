'use strict';

const fs = require('fs');
const _isFirstLaunch = fs.existsSync('./_launched_');

function isFirstLaunch() {
  return !_isFirstLaunch;
}

fs.writeFileSync('./_launched_', 'HELLO');

module.exports = { isFirstLaunch };
