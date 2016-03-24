'use strict';

const _ = require('lodash');
const co = require('co');
const path = require('path');
const packageControl = require('./package-control');
const fileutil = require('./fileutil');

function _createPackegeInfo(name, data) {
  return {
    name,
    version: data.version || 'none',
    desc: data.description || '',
    author: data.author || '',
    homepage: data.homepage || ''
  };
}

class Packman {

  constructor(repoDir, tempDir) {
    this.repoDir = repoDir;
    this.tempDir = tempDir;
    this.packages = [];
  }

  readPackages() {
    const self = this;
    this.packages = [];
    return co(function* () {
      yield fileutil.ensureDir(self.repoDir);
      const packageDirs = yield fileutil.readdir(self.repoDir);
      for (const _packageDir of packageDirs) {
        const packageJsonFile = path.join(self.repoDir, _packageDir, 'package.json');
        try {
          const fileContents = yield fileutil.readFile(packageJsonFile);
          const pkgJson = JSON.parse(fileContents.toString());
          const pkgInfo = _createPackegeInfo(_packageDir, pkgJson);
          self.packages.push(pkgInfo);
        } catch (e) {
          console.log(e);
          continue;
        }
      }
    });
  }

  listPackages() {
    return this.packages;
  }

  hasPackage(packageName) {
    return (_.findIndex(this.packages, x => x.name === packageName) >= 0);
  }

  installPackage(packageName, versionRange) {
    const self = this;
    return co(function* () {
      if (self.hasPackage(packageName)) {
        throw `Installed package: ${packageName}`;
      }
      const saveDir = path.join(self.repoDir, packageName);
      const data = yield packageControl.installPackage(packageName, versionRange, saveDir, self.tempDir);
      self.packages.push(_createPackegeInfo(packageName, data));
    });
  }

  removePackage(packageName) {
    const self = this;
    return co(function* () {
      if (!self.hasPackage(packageName)) {
        throw `Can't find a package: ${packageName}`;
      }
      const saveDir = path.join(self.repoDir, packageName);
      yield fileutil.remove(saveDir);
      _.remove(self.packages, x => x.name === packageName);
    });
  }

}

module.exports = Packman;
