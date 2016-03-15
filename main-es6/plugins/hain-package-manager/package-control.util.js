'use strict';

const fs = require('fs-extra');
const got = require('got');
const tarball = require('tarball-extract');

const self = {};

self.downloadFile = function (url, destPath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destPath);
    fileStream.on('error', (err) => {
      reject(err);
    });
    fileStream.on('finish', () => {
      resolve();
    });
    got.stream(url).pipe(fileStream);
  });
};

self.extractTarball = function (filePath, destPath) {
  return new Promise((resolve, reject) => {
    tarball.extractTarball(filePath, destPath, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

self.move = function (src, dst) {
  return new Promise((resolve, reject) => {
    fs.move(src, dst, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};

self.remove = function (path) {
  return new Promise((resolve, reject) => {
    fs.remove(path, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};

self.ensureDir = function (path) {
  return new Promise((resolve, reject) => {
    fs.ensureDir(path, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
};

module.exports = self;
