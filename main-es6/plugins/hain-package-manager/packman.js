'use strict';

const co = require('co');
const fs = require('fs');
const path = require('path');
const packageControl = require('./package-control');
const util = require('./package-control.util');

class Packman {
  constructor(repoDir, tempDir) {
    this.repoDir = repoDir;
    this.tempDir = tempDir;
  }
  * listPackages() {
    const files = yield new Promise((resolve, reject) => {
      fs.readdir(this.repoDir, (err, _files) => {
        if (err) {
          return reject(err);
        }
        return resolve(_files);
      });
    });
    return files;
  }
  hasPackage(packageName) {
    const saveDir = path.join(this.repoDir, packageName);
    return fs.existsSync(saveDir);
  }
  * installPackage(packageName, versionRange) {
    if (this.hasPackage(packageName)) {
      throw 'installed package';
    }
    const saveDir = path.join(this.repoDir, packageName);
    yield* packageControl.installPackage(packageName, versionRange, saveDir, this.tempDir);
  }
  * updatePackage(packageName, versionRange) {

  }
  * removePackage(packageName) {
    if (!this.hasPackage(packageName)) {
      throw 'not-installed package';
    }
    const saveDir = path.join(this.repoDir, packageName);
    yield util.remove(saveDir);
  }
}

module.exports = Packman;
