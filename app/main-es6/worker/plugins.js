/* global process */
'use strict';

const lo_isNumber = require('lodash.isnumber');
const lo_isArray = require('lodash.isarray');
const lo_assign = require('lodash.assign');
const lo_isPlainObject = require('lodash.isplainobject');
const lo_isFunction = require('lodash.isfunction');
const lo_reject = require('lodash.reject');
const lo_keys = require('lodash.keys');

const co = require('co');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const fileutil = require('../utils/fileutil');

const schemaDefaults = require('../../utils/schema-defaults');

const matchutil = require('../utils/matchutil');
const textutil = require('../utils/textutil');
const prefStore = require('./pref-store');
const ObservableObject = require('../common/observable-object');
const storages = require('./storages');

const conf = require('../conf');

function createSanitizeSearchResultFunc(pluginId, pluginConfig) {
  return (x) => {
    const defaultScore = 0.5;
    let _score = x.score;
    if (!lo_isNumber(_score))
      _score = defaultScore;
    _score = Math.max(0, Math.min(_score, 1)); // clamp01(x.score)

    const _icon = x.icon;
    const _title = textutil.sanitize(x.title);
    const _desc = textutil.sanitize(x.desc);
    const _group = x.group;
    const _preview = x.preview;
    const sanitizedProps = {
      pluginId: pluginId,
      title: _title,
      desc: _desc,
      score: _score,
      icon: _icon || pluginConfig.icon,
      group: _group || pluginConfig.group,
      preview: _preview || false
    };
    return lo_assign(x, sanitizedProps);
  };
}

function createResponseObject(resFunc, pluginId, pluginConfig) {
  const sanitizeSearchResult = createSanitizeSearchResultFunc(pluginId, pluginConfig);
  return {
    add: (result) => {
      let searchResults = [];
      if (lo_isArray(result)) {
        searchResults = result.map(sanitizeSearchResult);
      } else if (lo_isPlainObject(result)) {
        searchResults = [sanitizeSearchResult(result)];
      } else {
        throw new Error('argument must be an array or an object');
      }
      if (searchResults.length <= 0)
        return;
      resFunc({
        type: 'add',
        payload: searchResults
      });
    },
    remove: (id) => {
      resFunc({
        type: 'remove',
        payload: { id, pluginId }
      });
    }
  };
}

function _makeIntroHelp(pluginConfig) {
  const usage = pluginConfig.usage || 'please fill usage in package.json';
  return [{
    redirect: pluginConfig.redirect || pluginConfig.prefix,
    title: textutil.sanitize(usage),
    desc: textutil.sanitize(pluginConfig.name),
    icon: pluginConfig.icon,
    group: 'Plugins',
    score: Math.random()
  }];
}

function _makePrefixHelp(pluginConfig, query) {
  if (!pluginConfig.prefix) return;
  const candidates = [pluginConfig.prefix];
  const filtered = matchutil.head(candidates, query, (x) => x);
  return filtered.map((x) => {
    return {
      redirect: pluginConfig.redirect || pluginConfig.prefix,
      title: textutil.sanitize(matchutil.makeStringBoldHtml(x.elem, x.matches)),
      desc: textutil.sanitize(pluginConfig.name),
      group: 'Plugin Commands',
      icon: pluginConfig.icon,
      score: 0.5
    };
  });
}

module.exports = (workerContext) => {
  const pluginLoader = require('./plugin-loader')(workerContext);
  const logger = workerContext.logger;

  let plugins = null;
  let pluginConfigs = null;
  let pluginPrefIds = null;

  const pluginContextBase = {
    // Plugin Configurations
    MAIN_PLUGIN_REPO: conf.MAIN_PLUGIN_REPO,
    DEV_PLUGIN_REPO: conf.DEV_PLUGIN_REPO,
    INTERNAL_PLUGIN_REPO: conf.INTERNAL_PLUGIN_REPO,
    __PLUGIN_PREINSTALL_DIR: conf.__PLUGIN_PREINSTALL_DIR,
    __PLUGIN_PREUNINSTALL_FILE: conf.__PLUGIN_PREUNINSTALL_FILE,
    CURRENT_API_VERSION: conf.CURRENT_API_VERSION,
    COMPATIBLE_API_VERSIONS: conf.COMPATIBLE_API_VERSIONS,
    // Utilities
    app: workerContext.app,
    toast: workerContext.toast,
    shell: workerContext.shell,
    logger: workerContext.logger,
    matchutil,
    // Preferences
    globalPreferences: workerContext.globalPreferences
  };

  function generatePluginContext(pluginId, pluginConfig) {
    const localStorage = storages.createPluginLocalStorage(pluginId);
    let preferences = undefined;

    const hasPreferences = (pluginConfig.prefSchema !== null);
    if (hasPreferences) {
      const defaults = schemaDefaults(pluginConfig.prefSchema);
      const saved = prefStore.get(pluginId) || {};
      prefStore.set(pluginId, lo_assign(defaults, saved));

      const initialPref = prefStore.get(pluginId);
      preferences = new ObservableObject(initialPref);
    }
    return lo_assign({}, pluginContextBase, { localStorage, preferences });
  }

  function _startup() {
    logger.log('startup: begin');
    for (const prop in plugins) {
      logger.log(`startup: ${prop}`);
      const startupFunc = plugins[prop].startup;
      if (!lo_isFunction(startupFunc)) {
        logger.log(`${prop}: startup property should be a Function`);
        continue;
      }
      try {
        startupFunc();
      } catch (e) {
        logger.log(e);
        if (e.stack)
          logger.log(e.stack);
      }
    }
    logger.log('startup: end');
  }

  function removeUninstalledPlugins() {
    const listFile = conf.__PLUGIN_PREUNINSTALL_FILE;
    if (!fs.existsSync(listFile))
      return;

    try {
      const contents = fs.readFileSync(listFile, { encoding: 'utf8' });
      const targetPlugins = contents.split('\n').filter((val) => (val && val.trim().length > 0));
      const repoDir = conf.MAIN_PLUGIN_REPO;

      for (const packageName of targetPlugins) {
        const packageDir = path.join(repoDir, packageName);
        fse.removeSync(packageDir);
        logger.log(`${packageName} has uninstalled successfully`);
      }
      fse.removeSync(listFile);
    } catch (e) {
      logger.log(`plugin uninstall error: ${e.stack || e}`);
    }
  }

  function movePreinstalledPlugins() {
    return co(function* () {
      const preinstallDir = conf.__PLUGIN_PREINSTALL_DIR;
      if (!fs.existsSync(preinstallDir))
        return;

      const packageDirs = fs.readdirSync(preinstallDir);
      const repoDir = conf.MAIN_PLUGIN_REPO;
      for (const packageName of packageDirs) {
        const srcPath = path.join(preinstallDir, packageName);
        const destPath = path.join(repoDir, packageName);
        yield fileutil.move(srcPath, destPath);
        logger.log(`${packageName} has installed successfully`);
      }
    }).catch((err) => {
      logger.log(`plugin uninstall error: ${err.stack || err}`);
    });
  }

  function* initialize() {
    removeUninstalledPlugins();
    yield movePreinstalledPlugins();

    const ret = pluginLoader.loadPlugins(generatePluginContext);
    plugins = ret.plugins;
    pluginConfigs = ret.pluginConfigs;
    pluginPrefIds = lo_reject(lo_keys(pluginConfigs), x => pluginConfigs[x].prefSchema === null);

    _startup();
  }

  function searchAll(query, res) {
    let sysResults = [];

    for (const prop in plugins) {
      const pluginId = prop;
      const plugin = plugins[pluginId];
      const pluginConfig = pluginConfigs[pluginId];

      if (query.length === 0) {
        const help = _makeIntroHelp(pluginConfig);
        if (help && help.length > 0)
          sysResults = sysResults.concat(help);
        continue;
      }

      let _query = query;
      const _query_lower = query.toLowerCase();
      const _prefix = pluginConfig.prefix;

      if (_prefix /* != null || != undefined */) {
        const prefix_lower = _prefix.toLowerCase();
        if (_query_lower.startsWith(prefix_lower) === false) {
          const prefixHelp = _makePrefixHelp(pluginConfig, query);
          if (prefixHelp && prefixHelp.length > 0)
            sysResults = sysResults.concat(prefixHelp);
          continue;
        }
        _query = _query.substring(_prefix.length);
      }

      const pluginResponse = createResponseObject(res, pluginId, pluginConfig);
      try {
        plugin.search(_query, pluginResponse);
      } catch (e) {
        logger.log(e);
        if (e.stack)
          logger.log(e.stack);
      }
    }

    // Send System-generated Results
    if (sysResults.length > 0)
      res({ type: 'add', payload: sysResults });
  }

  function execute(pluginId, id, payload) {
    if (plugins[pluginId] === undefined)
      return;
    const executeFunc = plugins[pluginId].execute;
    if (executeFunc === undefined)
      return;
    try {
      executeFunc(id, payload);
    } catch (e) {
      logger.log(e.stack || e);
    }
  }

  function renderPreview(pluginId, id, payload, render) {
    if (plugins[pluginId] === undefined)
      return;
    const renderPreviewFunc = plugins[pluginId].renderPreview;
    if (renderPreviewFunc === undefined)
      return;
    try {
      renderPreviewFunc(id, payload, render);
    } catch (e) {
      logger.log(e.stack || e);
    }
  }

  function getPrefIds() {
    return pluginPrefIds;
  }

  let tempPrefs = {};
  function getPreferences(prefId) {
    const prefSchema = pluginConfigs[prefId].prefSchema;
    const tempPref = tempPrefs[prefId];
    return {
      prefId,
      schema: JSON.stringify(prefSchema),
      model: tempPref || prefStore.get(prefId)
    };
  }

  function updatePreferences(prefId, prefModel) {
    tempPrefs[prefId] = prefModel;
  }

  function commitPreferences() {
    for (const prefId in tempPrefs) {
      const prefModel = tempPrefs[prefId];
      const pluginInstance = plugins[prefId];
      const pluginContext = pluginInstance.__pluginContext;

      pluginContext.preferences.update(prefModel);
      prefStore.set(prefId, prefModel);
    }
    tempPrefs = {};
  }

  function resetPreferences(prefId) {
    const prefSchema = pluginConfigs[prefId].prefSchema;
    const pref = schemaDefaults(prefSchema);
    updatePreferences(prefId, pref);
    return getPreferences(prefId);
  }

  return {
    initialize,
    searchAll,
    execute,
    renderPreview,
    getPrefIds,
    getPreferences,
    updatePreferences,
    commitPreferences,
    resetPreferences
  };
};
