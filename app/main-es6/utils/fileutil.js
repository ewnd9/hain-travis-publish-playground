'use strict';

const fs = require('fs-extra');
const tarball = require('tarball-extract');

const self = {};

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
    fs.move(src, dst, { clobber: true }, (err) => {
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

self.readdir = function (path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    });
  });
};

self.readFile = function (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, contents) => {
      if (err) return reject(err);
      return resolve(contents);
    });
  });
};

module.exports = self;
