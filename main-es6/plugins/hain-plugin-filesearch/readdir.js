'use strict';

const fs = require('original-fs');
const path = require('path');

function _readdir(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        return reject(err);
      }
      return resolve(files);
    });
  });
}

function _stat(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        return reject(err);
      }
      return resolve(stats);
    });
  });
}

function _realpath(filePath) {
  return new Promise((resolve, reject) => {
    fs.realpath(filePath, (err, _path) => {
      if (err) {
        return reject(err);
      }
      return resolve(_path);
    });
  });
}

function* readdir(dirPath, recursive, matcher) {
  const list = [];
  const pendingDirs = [dirPath];
  const scannedDirs = {};
  while (pendingDirs.length > 0) {
    const dir = pendingDirs.shift();
    const realdir = yield _realpath(dir);
    let files = [];

    if (scannedDirs[realdir]) {
      continue;
    }
    scannedDirs[realdir] = true;

    try {
      files = yield _readdir(realdir);
      for (const file of files) {
        const _path = path.join(realdir, file);
        try {
          const stat = yield _stat(_path);
          if (matcher(_path, stat)) {
            list.push(_path);
          }
          if (stat.isDirectory() && recursive) {
            pendingDirs.push(_path);
          }
        } catch (e) { }
      }
    } catch (e) { }
  }
  return list;
}

module.exports = readdir;
