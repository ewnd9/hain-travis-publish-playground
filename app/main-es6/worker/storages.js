'use strict';

const fse = require('fs-extra');
const storage = require('node-persist');

const conf = require('../conf');

function createPluginLocalStorage(pluginId) {
  const localStorageDir = `${conf.LOCAL_STORAGE_DIR}/${pluginId}`;
  fse.ensureDirSync(localStorageDir);

  const localStorage = storage.create({
    dir: localStorageDir
  });
  localStorage.initSync();
  return localStorage;
}

module.exports = {
  createPluginLocalStorage
};
