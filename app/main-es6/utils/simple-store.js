'use strict';

const fse = require('fs-extra');
const storage = require('node-persist');

function createStorage(dir) {
  fse.ensureDirSync(dir);
  const localStorage = storage.create({ dir });
  localStorage.initSync();
  return localStorage;
}

module.exports = (dir) => {
  const localStorage = createStorage(dir);

  function get(id) {
    return localStorage.getItemSync(id);
  }

  function set(id, obj) {
    localStorage.setItemSync(id, obj);
  }

  function has(id) {
    return (get(id) !== undefined);
  }

  return { get, set, has };
};
