'use strict';

const _ = require('lodash');
const co = require('co');
const path = require('path');
const packageControl = require('./package-control');
const fileutil = require('../../utils/fileutil');
const fs = require('fs');

function _createPackegeInfo(name, data, internal) {
  return {
    name,
    version: data.version || 'none',
    desc: data.description || '',
    author: data.author || '',
    homepage: data.homepage || '',
    internal: !!internal
  };
}

class Packman {

  constructor(opts) {
    this.repoDir = opts.mainRepo;
    this.internalRepoDir = opts.internalRepo;
    this.tempDir = opts.tempDir;
    this.installDir = opts.installDir;
    this.uninstallFile = opts.uninstallFile;

    this.packages = [];
    this.internalPackages = [];
  }

  readPackages() {
    const self = this;
    co(function* () {
      self.packages = [];
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

      self.internalPackages = [];
      const internalPackageDirs = yield fileutil.readdir(self.internalRepoDir);
      for (const _packageDir of internalPackageDirs) {
        const packageJsonFile = path.join(self.internalRepoDir, _packageDir, 'package.json');
        try {
          const fileContents = yield fileutil.readFile(packageJsonFile);
          const pkgJson = JSON.parse(fileContents.toString());
          const pkgInfo = _createPackegeInfo(_packageDir, pkgJson, true);
          self.internalPackages.push(pkgInfo);
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

  listInternalPackages() {
    return this.internalPackages;
  }

  getPackage(packageName) {
    return _.find(this.packages, (x) => x.name === packageName);
  }

  hasPackage(packageName) {
    return (this.getPackage(packageName) !== undefined);
  }

  installPackage(packageName, versionRange, proxyAgent) {
    const self = this;
    return co(function* () {
      if (self.hasPackage(packageName))
        throw `Installed package: ${packageName}`;

      const saveDir = path.join(self.installDir, packageName);
      const data = yield packageControl.installPackage(packageName, versionRange, saveDir, self.tempDir);

      self.packages.push(_createPackegeInfo(packageName, data));
    });
  }

  removePackage(packageName) {
    if (!this.hasPackage(packageName))
      throw `Can't find a package: ${packageName}`;

    fs.appendFileSync(this.uninstallFile, `${packageName}\n`);
    _.remove(this.packages, x => x.name === packageName);
  }

}

module.exports = Packman;
