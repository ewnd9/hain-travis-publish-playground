'use strict';

const co = require('co');
const Registry = require('winreg');
const regKey = new Registry({
  hive: Registry.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

const VALUE_NAME = 'Hain';

function activate() {
  return new Promise((resolve, reject) => {
    regKey.set(VALUE_NAME, Registry.REG_SZ, `"${process.execPath}"`, (err) => {
      if (err)
        return reject(err);
      return resolve();
    });
  });
}

function deactivate() {
  return new Promise((resolve, reject) => {
    regKey.remove(VALUE_NAME, (err) => {
      if (err)
        return reject(err);
      return resolve();
    });
  });
}

function isActivated() {
  return new Promise((resolve, reject) => {
    regKey.get(VALUE_NAME, (err, item) => {
      return resolve(item !== null);
    });
  });
}

function* toggle() {
  const activated = yield isActivated();
  if (activated) {
    yield deactivate();
  } else {
    yield activate();
  }
}

module.exports = {
  activate,
  deactivate,
  isActivated,
  toggle: co.wrap(toggle)
};
