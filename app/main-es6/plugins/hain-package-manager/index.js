'use strict';

const _ = require('lodash');
const co = require('co');
const got = require('got');
const path = require('path');
const semver = require('semver');

const Packman = require('./packman');

const COMMANDS_RE = / (install|update|uninstall|list)(\s+([^\s]+))?/i;
const NAME = 'hain-package-manager (experimental)';
const PREFIX = '/hpm';

const COMMANDS = [`${PREFIX} install `, `${PREFIX} update `, `${PREFIX} uninstall `, `${PREFIX} list `];
const CACHE_DURATION_SEC = 5 * 60; // 5 mins
const QUERY_LIMIT = 500;

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
  const PLUGIN_API_VERSION = context.PLUGIN_API_VERSION;

  let currentStatus = null;
  let progressTimer = 0;
  let lastUpdatedTime = 0;
  let availablePackages = [];

  function getBackendUrl() {
    return context.preferences.get('backendUrl') || 'http://npmsearch.com';
  }

  function* searchPackages(query) {
    const backendUrl = getBackendUrl();
    const query_enc = query;
    const fields = 'name,rating,version,description,keywords,author';
    const url = `${backendUrl}/query?q=name:${query_enc}&fields=${fields}&default_operator=AND&sort=rating:desc&size=${QUERY_LIMIT}`;
    const res = yield got(url, { json: true });
    const packages = _.filter(res.body.results, x => {
      return (x.keywords && x.keywords.indexOf(PLUGIN_API_VERSION) >= 0);
    });
    return packages.map(x => {
      return {
        name: x.name[0],
        version: x.version[0],
        desc: x.description[0],
        author: x.author[0] || ''
      };
    });
  }

  function checkAvailablePackages() {
    const elapsed = (Date.now() - lastUpdatedTime) / 1000;
    if (elapsed <= CACHE_DURATION_SEC)
      return;
    lastUpdatedTime = Date.now();
    return co(function* () {
      availablePackages = yield searchPackages('hain-plugin');
    });
  }

  function getPackageInfo(packageName) {
    return _.find(pm.listPackages(), (x) => x.name === packageName);
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
    return {
      id: pkgInfo.name,
      payload: cmdType,
      title: `${customName || pkgInfo.name} ` +
             ` <span style='font-size: 9pt'>${pkgInfo.version}` +
             `${!pkgInfo.internal ? ` by <b>${pkgInfo.author}</b>` : ''}` +
             `</span>`,
      desc: `${pkgInfo.desc}`,
      group
    };
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
      return _fuzzy('install', packages, arg);
    }
    if (command === 'update') {
      const packages = availablePackages.filter(x => {
        const installedPackage = pm.getPackage(x.name);
        if (installedPackage === undefined)
          return false;
        return semver.gt(x.version, installedPackage.version);
      }).map(x => {
        const org = pm.getPackage(x.name);
        const _x = x;
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
