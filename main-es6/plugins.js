/* global process */
'use strict';

const _ = require('lodash');
const co = require('co');

const matcher = require('./services/matcher');
const textutil = require('./utils/textutil');

const logger = require('./logger').create('plugins');
const pluginLoader = require('./plugin-loader');

let plugins = null;
let pluginConfigs = null;

function* _startup() {
  const _gens = [];
  logger.log('startup: begin');
  for (const prop in plugins) {
    logger.log(`startup: ${prop}`);
    const startupFunc = plugins[prop].startup;
    if (!_.isFunction(startupFunc)) {
      logger.log('startup property should be a Function');
      continue;
    }
    const promise = startupFunc();
    _gens.push(promise);
  }
  yield _gens;
  logger.log('startup: end');
}

function computePluginScore(pluginConfig) {
  if (pluginConfig.prefix) {
    return pluginConfig.prefix.length;
  }
  return 0;
}

function _createReplyFuncForPlugin(pluginId, pluginScore, pluginConfig, reply) {
  return (ret) => {
    let wrapped = ret;
    if (_.isArray(ret)) {
      const lengthScore = Math.max(0, 100 - ret.length);
      wrapped = ret.map((x) => {
        const _icon = x.icon;
        const _title = textutil.sanitize(x.title);
        const _desc = textutil.sanitize(x.desc);
        const injectedProps = {
          pluginId: pluginId,
          title: _title,
          desc: _desc,
          score: pluginScore + lengthScore,
          icon: _icon || pluginConfig.icon
        };
        return _.assign(x, injectedProps);
      });
    } else if (_.isObject(ret)) {
      wrapped.pluginId = pluginId;
    }
    reply(wrapped);
  };
}

function _makeIntroHelp(pluginConfig) {
  const usage = pluginConfig.usage || 'please fill usage';
  return [{
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
      id: pluginConfig.prefix,
      payload: '__sys__change__input__',
      title: textutil.sanitize(matcher.makeStringBoldHtml(x.elem, x.matches)),
      desc: textutil.sanitize(pluginConfig.name),
      icon: pluginConfig.icon
    };
  });
}

function* start() {
  const ret = pluginLoader.loadPlugins();
  plugins = ret.plugins;
  pluginConfigs = ret.pluginConfigs;
  yield* _startup();
}

function* searchAll(query, reply) {
  for (const prop in plugins) {
    const pluginId = prop;
    const plugin = plugins[pluginId];
    const pluginConfig = pluginConfigs[pluginId];

    const pluginScore = computePluginScore(pluginConfig);
    const _replyFunc = _createReplyFuncForPlugin(pluginId, pluginScore, pluginConfig, reply);

    if (query.length === 0) {
      const help = _makeIntroHelp(pluginConfig);
      if (help && help.length > 0) {
        _replyFunc(help);
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
          _replyFunc(prefixHelp);
        }
        continue;
      }
      _query = _query.substring(_prefix.length);
    }

    plugin.search(_query, _replyFunc).then((ret) => {
      if (ret === null || ret === undefined) {
        return;
      }
      _replyFunc(ret);
    }).catch((err) => {
      logger.log(err);
    });
  }
}

function* execute(pluginId, id, payload) {
  if (payload === '__sys__change__input__')
    return id;

  const executeFunc = plugins[pluginId].execute;
  if (executeFunc === undefined)
    return;
  const ret = yield executeFunc(id, payload);
  return ret;
}

module.exports = {
  start: co.wrap(start),
  searchAll: co.wrap(searchAll),
  execute: co.wrap(execute)
};
