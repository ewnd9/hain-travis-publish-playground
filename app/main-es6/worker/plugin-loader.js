'use strict';

const _ = require('lodash');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const storage = require('node-persist');
const logger = require('../utils/logger');
const iconFmt = require('./icon-fmt');
const conf = require('./conf');

module.exports = (workerContext) => {
  function ensurePluginRepos() {
    for (const repo of conf.PLUGIN_REPOS) {
      fse.ensureDirSync(repo);
    }
  }

  function readPluginFiles() {
    ensurePluginRepos();

    let files = [];
    for (const repo of conf.PLUGIN_REPOS) {
      try {
        const _files = fs.readdirSync(repo);
        files = files.concat(_files.map((x) => path.join(repo, x)));
      } catch (e) {
        logger.log(e);
      }
    }
    return files;
  }

  function pickPluginModule(pluginFile) {
    let PluginModule = null;
    try {
      PluginModule = require(`${pluginFile}`);
    } catch (e) {
      logger.log(`error on loading: ${pluginFile}`);
      logger.log(e.stack);
    }

    if (!_.isFunction(PluginModule)) {
      logger.log(`plugin not function: ${pluginFile}`);
      return null;
    }
    return PluginModule;
  }

  function parsePluginConfig(pluginId, pluginFile) {
    let pluginConfig = {};
    try {
      const packageJson = require(path.join(pluginFile, 'package.json'));
      const hainProps = packageJson.hain;
      if (hainProps) {
        pluginConfig = _.assign(pluginConfig, hainProps);
        pluginConfig.usage = pluginConfig.usage || pluginConfig.prefix;
        pluginConfig.icon = iconFmt.parseIconUrl(pluginFile, pluginConfig.icon);
        pluginConfig.group = pluginConfig.group || pluginId;
      }
      pluginConfig.name = packageJson.name;
      pluginConfig.version = packageJson.version;
    } catch (e) {
      logger.log(`${pluginId} package.json error`);
      return null;
    }
    return pluginConfig;
  }

  function createPluginLocalStorage(pluginId) {
    const localStorageDir = `${conf.LOCAL_STORAGE_DIR}/${pluginId}`;
    fse.ensureDirSync(localStorageDir);

    const localStorage = storage.create({
      dir: localStorageDir
    });
    localStorage.initSync();
    return localStorage;
  }

  function loadPlugins(context) {
    const pluginFiles = readPluginFiles();

    const plugins = {};
    const pluginConfigs = {};
    for (const pluginFile of pluginFiles) {
      if (plugins[pluginFile] !== undefined) {
        logger.log(`conflict: ${pluginFile} is already loaded`);
        continue;
      }

      const PluginModule = pickPluginModule(pluginFile);
      if (PluginModule === null)
        continue;

      const pluginId = path.basename(pluginFile);
      const pluginConfig = parsePluginConfig(pluginId, pluginFile);
      if (pluginConfig === null)
        continue;

      const pluginLocalStorage = createPluginLocalStorage(pluginId);
      const finalPluginContext = _.assign(context, {
        localStorage: pluginLocalStorage
      });

      try {
        const pluginInstance = PluginModule(finalPluginContext);
        plugins[pluginId] = pluginInstance;
        pluginConfigs[pluginId] = pluginConfig;
        logger.log(`${pluginId} loaded`);
      } catch (e) {
        logger.log(`${pluginId} could'nt be created: ${e}`);
      }
    }
    return { plugins, pluginConfigs };
  }

  return { loadPlugins };
};
