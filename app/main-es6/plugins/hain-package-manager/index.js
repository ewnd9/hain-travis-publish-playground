'use strict';

const lo_find = require('lodash.find');
const lo_assign = require('lodash.assign');
const lo_reject = require('lodash.reject');
const lo_orderBy = require('lodash.orderby');

const co = require('co');
const path = require('path');
const semver = require('semver');

const Packman = require('./packman');
const searchClient = require('./search-client');

const COMMANDS_RE = / (install|update|uninstall|list)(\s+([^\s]+))?/i;
const NAME = 'hain-package-manager (experimental)';
const PREFIX = '/hpm';

const COMMANDS = [`${PREFIX} install `, `${PREFIX} update `, `${PREFIX} uninstall `, `${PREFIX} list `];
const CACHE_DURATION_SEC = 5 * 60; // 5 mins

module.exports = (context) => {
  const packmanOpts = {
    mainRepo: context.MAIN_PLUGIN_REPO,
    internalRepo: context.INTERNAL_PLUGIN_REPO,
    tempDir: path.resolve('./_temp'),
    installDir: context.__PLUGIN_PREINSTALL_DIR,
    uninstallFile: context.__PLUGIN_PREUNINSTALL_FILE
  };
  const pm = new Packman(packmanOpts);
  const toast = context.toast;
  const logger = context.logger;
  const shell = context.shell;
  const matchutil = context.matchutil;
  const app = context.app;

  let isSearching = false;
  let currentStatus = null;
  let progressTimer = 0;
  let lastUpdatedTime = 0;
  let availablePackages = [];

  function getBackendUrl() {
    return context.preferences.get('backendUrl') || 'http://npmsearch.com';
  }

  function checkAvailablePackages() {
    const elapsed = (Date.now() - lastUpdatedTime) / 1000;
    if (elapsed <= CACHE_DURATION_SEC || isSearching)
      return;

    isSearching = true;
    searchClient.findCompatiblePackagesWithDownloads(getBackendUrl(), context.COMPATIBLE_API_VERSIONS).then(ret => {
      availablePackages = ret || [];
      availablePackages = lo_orderBy(availablePackages, 'downloads', ['desc']);
      lastUpdatedTime = Date.now();
      isSearching = false;
    }, (err) => {
      isSearching = false;
    });
  }

  function getPackageInfo(packageName) {
    return lo_find(pm.listPackages(), (x) => x.name === packageName);
  }

  function startup() {
    pm.readPackages();
    checkAvailablePackages();
  }

  function search(query, res) {
    if (currentStatus === null)
      checkAvailablePackages();

    clearTimeout(progressTimer);
    if (currentStatus) {
      res.add({
        id: '**',
        title: currentStatus,
        desc: NAME,
        icon: '#fa fa-spinner fa-spin'
      });
      progressTimer = setInterval(() => {
        if (!currentStatus) {
          res.remove('**');
          res.add(parseCommands(query));
          return clearTimeout(progressTimer);
        }
      }, 500);
      return;
    }
    res.add(parseCommands(query));
  }

  function _toSearchResult(cmdType, pkgInfo, customName, group) {
    const result = {
      id: pkgInfo.name,
      payload: cmdType,
      title: `${customName || pkgInfo.name} ` +
             ` <span style='font-size: 9pt'>${pkgInfo.version}` +
             `${!pkgInfo.internal ? ` by <b>${pkgInfo.author}</b>` : ''}` +
             `</span>`,
      desc: `${pkgInfo.desc}`,
      group
    };
    if (pkgInfo.downloads !== undefined && pkgInfo.modified !== undefined)
      result.desc = `${pkgInfo.downloads} Downloads / ${pkgInfo.desc}`;
    return result;
  }

  function _toSearchResults(cmdType, packages, group) {
    return packages.map(x => _toSearchResult(cmdType, x, undefined, group));
  }

  function _fuzzy(cmdType, packages, keyword) {
    if (keyword.length <= 0)
      return packages.map(x => _toSearchResult(cmdType, x));
    return matchutil.fuzzy(packages, keyword.trim(), x => x.name).map(x => {
      const m = matchutil.makeStringBoldHtml(x.elem.name, x.matches);
      return _toSearchResult(cmdType, x.elem, m);
    });
  }

  function parseCommands(query) {
    const parsed = COMMANDS_RE.exec(query.toLowerCase());
    if (!parsed) {
      return _makeCommandsHelp(query);
    }
    const command = parsed[1];
    const arg = parsed[2] || '';
    if (command === 'install') {
      if (availablePackages.length <= 0) {
        return {
          title: 'Sorry, fetching available packages...',
          desc: NAME,
          icon: '#fa fa-spinner fa-spin'
        };
      }
      const packages = availablePackages.filter(x => {
        return !pm.hasPackage(x.name);
      });

      // if there is a query, then return fuzzy matched results
      if (arg.length > 0)
        return _fuzzy('install', packages, arg);

      // split packages into newest and popular
      const newestPackages = lo_orderBy(packages, 'modified', ['desc']).slice(0, 3);
      const newestPkgNames = newestPackages.map(x => x.name);
      const popularPackages = lo_reject(packages, x => newestPkgNames.indexOf(x.name) >= 0);

      const popularResults = _toSearchResults('install', popularPackages, 'Popular (Monthly)');
      const newestResults = _toSearchResults('install', newestPackages, 'Newest');
      return newestResults.concat(popularResults);
    }
    if (command === 'update') {
      const packages = availablePackages.filter(x => {
        const installedPackage = pm.getPackage(x.name);
        if (installedPackage === undefined)
          return false;
        return semver.gt(x.version, installedPackage.version);
      }).map(x => {
        const org = pm.getPackage(x.name);
        const _x = lo_assign({}, x); // clone
        _x.version = `${org.version} => ${_x.version}`;
        return _x;
      });
      if (packages.length <= 0) {
        return {
          title: 'Everthing is up-to-date',
          desc: NAME
        };
      }
      return _fuzzy('update', packages, arg);
    }
    if (command === 'uninstall') {
      const packages = pm.listPackages();
      return _fuzzy('uninstall', packages, arg);
    }
    if (command === 'list') {
      const packages = pm.listPackages();
      const internalPackages = pm.listInternalPackages();
      return packages.map((x) => _toSearchResult('list', x))
        .concat(internalPackages.map((x) => _toSearchResult('list', x, null, 'Internal packages')));
    }
    return _makeCommandsHelp(query);
  }

  function _makeCommandsHelp(query) {
    const ret = matchutil.head(COMMANDS, `${PREFIX}${query}`, (x) => x).map((x) => {
      return {
        redirect: x.elem,
        title: matchutil.makeStringBoldHtml(x.elem, x.matches),
        desc: NAME
      };
    });
    return ret;
  }

  function resetInput() {
    app.setInput(`${PREFIX} `);
  }

  function execute(id, payload) {
    if (payload === 'install') {
      installPackage(id);
      resetInput();
    } else if (payload === 'update') {
      updatePackage(id);
      resetInput();
    } else if (payload === 'uninstall') {
      uninstallPackage(id);
      resetInput();
    } else if (payload === 'list') {
      const pkgInfo = getPackageInfo(id);
      if (pkgInfo.homepage)
        shell.openExternal(pkgInfo.homepage);
    }
  }

  function uninstallPackage(packageName) {
    try {
      pm.removePackage(packageName);
      toast.enqueue(`${packageName} has uninstalled, <b>Restart</b> Hain to take effect`, 3000);
    } catch (e) {
      toast.enqueue(e.toString());
    }
  }

  function installPackage(packageName) {
    co(function* () {
      logger.log(`Installing ${packageName}`);
      currentStatus = `Installing <b>${packageName}</b>`;
      try {
        yield pm.installPackage(packageName, 'latest');
        toast.enqueue(`${packageName} has installed, <b>Restart</b> Hain to take effect`, 3000);
        logger.log(`${packageName} has pre-installed`);
      } catch (e) {
        toast.enqueue(e.toString());
        logger.log(`${packageName} ${e}`);
        throw e;
      } finally {
        currentStatus = null;
      }
    });
  }

  function updatePackage(packageName) {
    co(function* () {
      logger.log(`Updating ${packageName}`);
      currentStatus = `Updating <b>${packageName}</b>`;
      try {
        pm.removePackage(packageName);
        yield pm.installPackage(packageName, 'latest');
        toast.enqueue(`${packageName} has updated, <b>Restart</b> Hain to take effect`, 3000);
        logger.log(`${packageName} has pre-installed (for update)`);
      } catch (e) {
        toast.enqueue(e.toString());
        logger.log(`${packageName} ${e}`);
        throw e;
      } finally {
        currentStatus = null;
      }
    });
  }

  return { startup, search, execute };
};
