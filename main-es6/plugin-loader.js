'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const LocalStorage = require('node-localstorage').LocalStorage;

const Logger = require('./Logger');
const logger = Logger.create('plugin-loader');

const LOCAL_STORAGE_DIR = './_localStorage';

const pluginRepos = [];
pluginRepos.push(path.join(__dirname, 'plugins'));
pluginRepos.push(path.resolve('./plugins'));

function ensureLocalStorageDir() {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR);
  }
}
ensureLocalStorageDir();

const matcher = require('./services/matcher');
const toast = require('./services/toast');

const PLUGIN_ARGS = { matcher, toast };

function parseIconUrl(baseDir, url) {
  if (url === undefined || url.length === 0)
    return '#fa fa-heart';
  if (url.startsWith('#'))
    return url;
  if (/^https?:/i.test(url))
    return url;
  return `file:///${path.join(baseDir, url)}`;
}

function loadPlugins() {
  let files = [];
  for (const repo of pluginRepos) {
    try {
      const _files = fs.readdirSync(repo);
      files = files.concat(_files.map((x) => path.join(repo, x)));
    } catch (e) {
      console.log(e);
    }
  }

  const plugins = {};
  const pluginConfigs = {};
  for (const pluginFile of files) {
    let PluginModule = null;
    try {
      PluginModule = require(`${pluginFile}`);
    } catch (e) {
      logger.log(`error on loading: ${pluginFile}`);
      logger.log(e.stack);
    }

    if (!_.isFunction(PluginModule)) {
      logger.log(`plugin not function: ${pluginFile}`);
      continue;
    }

    const pluginId = path.basename(pluginFile);
    let pluginConfig = {};
    try {
      const baseDir = pluginFile;
      const packageJson = require(path.join(baseDir, 'package.json'));
      const hainProps = packageJson.hain;
      if (hainProps) {
        pluginConfig = _.assign(pluginConfig, hainProps);
        pluginConfig.usage = pluginConfig.usage || pluginConfig.prefix;
        pluginConfig.icon = parseIconUrl(baseDir, pluginConfig.icon);
      }
      pluginConfig.name = packageJson.name;
      pluginConfig.version = packageJson.version;
    } catch (e) {
      logger.log(`${pluginId} package.json error`);
      continue;
    }

    const _logger = Logger.create(pluginId);
    const _localStorage = new LocalStorage(`${LOCAL_STORAGE_DIR}/${pluginId}`);

    const context = _.assign(PLUGIN_ARGS, {
      logger: _logger,
      localStorage: _localStorage
    });

    const pluginInstance = PluginModule(context);
    plugins[pluginId] = pluginInstance;
    pluginConfigs[pluginId] = pluginConfig;
    logger.log(`${pluginId} loaded`);
  }
  return { plugins, pluginConfigs };
}

module.exports = {
  loadPlugins
};
