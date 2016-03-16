'use strict';

const fs = require('fs');
const isFirstLaunch = !fs.existsSync('./_launched_');

if (isFirstLaunch) {
  fs.writeFileSync('./_launched_', 'HELLO');
}

module.exports = { isFirstLaunch };
