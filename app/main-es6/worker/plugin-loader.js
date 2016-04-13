'use strict';

const lo_isFunction = require('lodash.isfunction');
const lo_assign = require('lodash.assign');

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
const iconFmt = require('./icon-fmt');
const conf = require('../conf');

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

    if (!lo_isFunction(PluginModule)) {
      logger.log(`plugin not function: ${pluginFile}`);
      return null;
    }
    return PluginModule;
  }

  function parsePluginConfig(pluginId, pluginFile) {
    let pluginConfig = {};
    try {
      const packageJson = require(path.join(pluginFile, 'package.json'));
      const prefSchemaPath = path.join(pluginFile, 'preferences.json');
      let prefSchema = null;
      if (fs.existsSync(prefSchemaPath))
        prefSchema = require(prefSchemaPath);

      const hainProps = packageJson.hain;
      if (hainProps) {
        pluginConfig = lo_assign(pluginConfig, hainProps);
        pluginConfig.usage = pluginConfig.usage || pluginConfig.prefix;
        pluginConfig.icon = iconFmt.parseIconUrl(pluginFile, pluginConfig.icon);
        pluginConfig.group = pluginConfig.group || pluginId;
      }
      pluginConfig.prefSchema = prefSchema;
      pluginConfig.name = packageJson.name;
      pluginConfig.version = packageJson.version;
    } catch (e) {
      logger.log(`${pluginId} package.json error`);
      return null;
    }
    return pluginConfig;
  }

  function loadPlugins(generateContextFunc) {
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

      try {
        const pluginContext = generateContextFunc(pluginId, pluginConfig);
        const pluginInstance = PluginModule(pluginContext);
        pluginInstance.__pluginContext = pluginContext;
        plugins[pluginId] = pluginInstance;
        pluginConfigs[pluginId] = pluginConfig;
        logger.log(`${pluginId} loaded`);
      } catch (e) {
        const err = e.stack || e;
        logger.log(`${pluginId} could'nt be created: ${err}`);
      }
    }
    return { plugins, pluginConfigs };
  }

  return { loadPlugins };
};
