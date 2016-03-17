/* global process */
'use strict';

const _ = require('lodash');

const matcher = require('../utils/matcher');
const textutil = require('../utils/textutil');

const logger = require('../logger').create('plugins');
const pluginLoader = require('./plugin-loader');

function createSanitizeSearchResultFunc(pluginId, pluginConfig) {
  return (x) => {
    const _icon = x.icon;
    const _score = x.score || 0;
    const _title = textutil.sanitize(x.title);
    const _desc = textutil.sanitize(x.desc);
    const sanitizedProps = {
      pluginId: pluginId,
      title: _title,
      desc: _desc,
      score: _score,
      icon: _icon || pluginConfig.icon
    };
    return _.assign(x, sanitizedProps);
  };
}

function createResponseObject(resFunc, pluginId, pluginConfig) {
  const sanitizeSearchResult = createSanitizeSearchResultFunc(pluginId, pluginConfig);
  return {
    add: (result) => {
      let searchResults = [];
      if (_.isArray(result)) {
        searchResults = result.map(sanitizeSearchResult);
      } else if (_.isPlainObject(result)) {
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
    redirect: pluginConfig.prefix,
    title: textutil.sanitize(usage),
    desc: textutil.sanitize(pluginConfig.name),
    icon: pluginConfig.icon
  }];
}

function _makePrefixHelp(pluginConfig, query) {
  if (!pluginConfig.prefix) return;
  const candidates = [pluginConfig.prefix];
  const filtered = matcher.head(candidates, query, (x) => x);
  return filtered.map((x) => {
    return {
      redirect: pluginConfig.prefix,
      title: textutil.sanitize(matcher.makeStringBoldHtml(x.elem, x.matches)),
      desc: textutil.sanitize(pluginConfig.name),
      icon: pluginConfig.icon
    };
  });
}

module.exports = (workerContext) => {
  let plugins = null;
  let pluginConfigs = null;

  const pluginContext = {
    app: workerContext.app,
    toast: workerContext.toast,
    shell: workerContext.shell,
    matcher
  };

  function _startup() {
    logger.log('startup: begin');
    for (const prop in plugins) {
      logger.log(`startup: ${prop}`);
      const startupFunc = plugins[prop].startup;
      if (!_.isFunction(startupFunc)) {
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

  function initialize() {
    const ret = pluginLoader.loadPlugins(pluginContext);
    plugins = ret.plugins;
    pluginConfigs = ret.pluginConfigs;
    _startup();
  }

  function searchAll(query, res) {
    for (const prop in plugins) {
      const pluginId = prop;
      const plugin = plugins[pluginId];
      const pluginConfig = pluginConfigs[pluginId];

      const sysResponse = createResponseObject(res, '*', pluginConfig);
      if (query.length === 0) {
        const help = _makeIntroHelp(pluginConfig);
        if (help && help.length > 0) {
          sysResponse.add(help);
        }
        continue;
      }

      let _query = query;
      const _query_lower = query.toLowerCase();
      const _prefix = pluginConfig.prefix;

      if (_prefix /* != null || != undefined */) {
        const prefix_lower = _prefix.toLowerCase();
        if (_query_lower.startsWith(prefix_lower) === false) {
          const prefixHelp = _makePrefixHelp(pluginConfig, query);
          if (prefixHelp && prefixHelp.length > 0) {
            sysResponse.add(prefixHelp);
          }
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
      logger.log(e);
      if (e.stack)
        logger.log(e.stack);
    }
  }

  return {
    initialize,
    searchAll,
    execute
  };
};
