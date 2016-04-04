/* global process */
'use strict';

var _ = require('lodash');

var matchutil = require('../utils/matchutil');
var textutil = require('../utils/textutil');

var conf = require('./conf');

function createSanitizeSearchResultFunc(pluginId, pluginConfig) {
  return function (x) {
    var defaultScore = 0.5;
    var _icon = x.icon;
    var _score = Math.max(0, Math.min(x.score || defaultScore, 1)); // clamp01(x.score)
    var _title = textutil.sanitize(x.title);
    var _desc = textutil.sanitize(x.desc);
    var _group = x.group;
    var sanitizedProps = {
      pluginId: pluginId,
      title: _title,
      desc: _desc,
      score: _score,
      icon: _icon || pluginConfig.icon,
      group: _group || pluginConfig.group
    };
    return _.assign(x, sanitizedProps);
  };
}

function createResponseObject(resFunc, pluginId, pluginConfig) {
  var sanitizeSearchResult = createSanitizeSearchResultFunc(pluginId, pluginConfig);
  return {
    add: function add(result) {
      var searchResults = [];
      if (_.isArray(result)) {
        searchResults = result.map(sanitizeSearchResult);
      } else if (_.isPlainObject(result)) {
        searchResults = [sanitizeSearchResult(result)];
      } else {
        throw new Error('argument must be an array or an object');
      }
      if (searchResults.length <= 0) return;
      resFunc({
        type: 'add',
        payload: searchResults
      });
    },
    remove: function remove(id) {
      resFunc({
        type: 'remove',
        payload: { id: id, pluginId: pluginId }
      });
    }
  };
}

function _makeIntroHelp(pluginConfig) {
  var usage = pluginConfig.usage || 'please fill usage in package.json';
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
  var candidates = [pluginConfig.prefix];
  var filtered = matchutil.head(candidates, query, function (x) {
    return x;
  });
  return filtered.map(function (x) {
    return {
      redirect: pluginConfig.redirect || pluginConfig.prefix,
      title: textutil.sanitize(matchutil.makeStringBoldHtml(x.elem, x.matches)),
      desc: textutil.sanitize(pluginConfig.name),
      group: 'Plugin Commands',
      icon: pluginConfig.icon
    };
  });
}

module.exports = function (workerContext) {
  var pluginLoader = require('./plugin-loader')(workerContext);
  var logger = workerContext.logger;

  var plugins = null;
  var pluginConfigs = null;

  var pluginContext = {
    PLUGIN_API_VERSION: 'hain0',
    MAIN_PLUGIN_REPO: conf.MAIN_PLUGIN_REPO,
    app: workerContext.app,
    toast: workerContext.toast,
    shell: workerContext.shell,
    logger: workerContext.logger,
    matchutil: matchutil
  };

  function _startup() {
    logger.log('startup: begin');
    for (var prop in plugins) {
      logger.log('startup: ' + prop);
      var startupFunc = plugins[prop].startup;
      if (!_.isFunction(startupFunc)) {
        logger.log(prop + ': startup property should be a Function');
        continue;
      }
      try {
        startupFunc();
      } catch (e) {
        logger.log(e);
        if (e.stack) logger.log(e.stack);
      }
    }
    logger.log('startup: end');
  }

  function initialize() {
    var ret = pluginLoader.loadPlugins(pluginContext);
    plugins = ret.plugins;
    pluginConfigs = ret.pluginConfigs;
    _startup();
  }

  function searchAll(query, res) {
    for (var prop in plugins) {
      var pluginId = prop;
      var plugin = plugins[pluginId];
      var pluginConfig = pluginConfigs[pluginId];

      var sysResponse = createResponseObject(res, '*', pluginConfig);
      if (query.length === 0) {
        var help = _makeIntroHelp(pluginConfig);
        if (help && help.length > 0) {
          sysResponse.add(help);
        }
        continue;
      }

      var _query = query;
      var _query_lower = query.toLowerCase();
      var _prefix = pluginConfig.prefix;

      if (_prefix /* != null || != undefined */) {
          var prefix_lower = _prefix.toLowerCase();
          if (_query_lower.startsWith(prefix_lower) === false) {
            var prefixHelp = _makePrefixHelp(pluginConfig, query);
            if (prefixHelp && prefixHelp.length > 0) {
              sysResponse.add(prefixHelp);
            }
            continue;
          }
          _query = _query.substring(_prefix.length);
        }

      var pluginResponse = createResponseObject(res, pluginId, pluginConfig);
      try {
        plugin.search(_query, pluginResponse);
      } catch (e) {
        logger.log(e);
        if (e.stack) logger.log(e.stack);
      }
    }
  }

  function execute(pluginId, id, payload) {
    if (plugins[pluginId] === undefined) return;
    var executeFunc = plugins[pluginId].execute;
    if (executeFunc === undefined) return;
    try {
      executeFunc(id, payload);
    } catch (e) {
      logger.log(e);
      if (e.stack) logger.log(e.stack);
    }
  }

  return {
    initialize: initialize,
    searchAll: searchAll,
    execute: execute
  };
};
//# sourceMappingURL=data:application/json;base64,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QUFYLEVBRFU7QUFFVixVQUFJLEVBQUUsS0FBRixFQUNGLE9BQU8sR0FBUCxDQUFXLEVBQUUsS0FBRixDQUFYLENBREY7S0FGQTtHQVJKOztBQWVBLFNBQU87QUFDTCwwQkFESztBQUVMLHdCQUZLO0FBR0wsb0JBSEs7R0FBUCxDQXJHa0M7Q0FBbkIiLCJmaWxlIjoid29ya2VyL3BsdWdpbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgcHJvY2VzcyAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG5jb25zdCBtYXRjaHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy9tYXRjaHV0aWwnKTtcclxuY29uc3QgdGV4dHV0aWwgPSByZXF1aXJlKCcuLi91dGlscy90ZXh0dXRpbCcpO1xyXG5cclxuY29uc3QgY29uZiA9IHJlcXVpcmUoJy4vY29uZicpO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlU2FuaXRpemVTZWFyY2hSZXN1bHRGdW5jKHBsdWdpbklkLCBwbHVnaW5Db25maWcpIHtcclxuICByZXR1cm4gKHgpID0+IHtcclxuICAgIGNvbnN0IGRlZmF1bHRTY29yZSA9IDAuNTtcclxuICAgIGNvbnN0IF9pY29uID0geC5pY29uO1xyXG4gICAgY29uc3QgX3Njb3JlID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeC5zY29yZSB8fCBkZWZhdWx0U2NvcmUsIDEpKTsgLy8gY2xhbXAwMSh4LnNjb3JlKVxyXG4gICAgY29uc3QgX3RpdGxlID0gdGV4dHV0aWwuc2FuaXRpemUoeC50aXRsZSk7XHJcbiAgICBjb25zdCBfZGVzYyA9IHRleHR1dGlsLnNhbml0aXplKHguZGVzYyk7XHJcbiAgICBjb25zdCBfZ3JvdXAgPSB4Lmdyb3VwO1xyXG4gICAgY29uc3Qgc2FuaXRpemVkUHJvcHMgPSB7XHJcbiAgICAgIHBsdWdpbklkOiBwbHVnaW5JZCxcclxuICAgICAgdGl0bGU6IF90aXRsZSxcclxuICAgICAgZGVzYzogX2Rlc2MsXHJcbiAgICAgIHNjb3JlOiBfc2NvcmUsXHJcbiAgICAgIGljb246IF9pY29uIHx8IHBsdWdpbkNvbmZpZy5pY29uLFxyXG4gICAgICBncm91cDogX2dyb3VwIHx8IHBsdWdpbkNvbmZpZy5ncm91cFxyXG4gICAgfTtcclxuICAgIHJldHVybiBfLmFzc2lnbih4LCBzYW5pdGl6ZWRQcm9wcyk7XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlUmVzcG9uc2VPYmplY3QocmVzRnVuYywgcGx1Z2luSWQsIHBsdWdpbkNvbmZpZykge1xyXG4gIGNvbnN0IHNhbml0aXplU2VhcmNoUmVzdWx0ID0gY3JlYXRlU2FuaXRpemVTZWFyY2hSZXN1bHRGdW5jKHBsdWdpbklkLCBwbHVnaW5Db25maWcpO1xyXG4gIHJldHVybiB7XHJcbiAgICBhZGQ6IChyZXN1bHQpID0+IHtcclxuICAgICAgbGV0IHNlYXJjaFJlc3VsdHMgPSBbXTtcclxuICAgICAgaWYgKF8uaXNBcnJheShyZXN1bHQpKSB7XHJcbiAgICAgICAgc2VhcmNoUmVzdWx0cyA9IHJlc3VsdC5tYXAoc2FuaXRpemVTZWFyY2hSZXN1bHQpO1xyXG4gICAgICB9IGVsc2UgaWYgKF8uaXNQbGFpbk9iamVjdChyZXN1bHQpKSB7XHJcbiAgICAgICAgc2VhcmNoUmVzdWx0cyA9IFtzYW5pdGl6ZVNlYXJjaFJlc3VsdChyZXN1bHQpXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZ3VtZW50IG11c3QgYmUgYW4gYXJyYXkgb3IgYW4gb2JqZWN0Jyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNlYXJjaFJlc3VsdHMubGVuZ3RoIDw9IDApXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICByZXNGdW5jKHtcclxuICAgICAgICB0eXBlOiAnYWRkJyxcclxuICAgICAgICBwYXlsb2FkOiBzZWFyY2hSZXN1bHRzXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogKGlkKSA9PiB7XHJcbiAgICAgIHJlc0Z1bmMoe1xyXG4gICAgICAgIHR5cGU6ICdyZW1vdmUnLFxyXG4gICAgICAgIHBheWxvYWQ6IHsgaWQsIHBsdWdpbklkIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gX21ha2VJbnRyb0hlbHAocGx1Z2luQ29uZmlnKSB7XHJcbiAgY29uc3QgdXNhZ2UgPSBwbHVnaW5Db25maWcudXNhZ2UgfHwgJ3BsZWFzZSBmaWxsIHVzYWdlIGluIHBhY2thZ2UuanNvbic7XHJcbiAgcmV0dXJuIFt7XHJcbiAgICByZWRpcmVjdDogcGx1Z2luQ29uZmlnLnJlZGlyZWN0IHx8IHBsdWdpbkNvbmZpZy5wcmVmaXgsXHJcbiAgICB0aXRsZTogdGV4dHV0aWwuc2FuaXRpemUodXNhZ2UpLFxyXG4gICAgZGVzYzogdGV4dHV0aWwuc2FuaXRpemUocGx1Z2luQ29uZmlnLm5hbWUpLFxyXG4gICAgaWNvbjogcGx1Z2luQ29uZmlnLmljb24sXHJcbiAgICBncm91cDogJ1BsdWdpbnMnLFxyXG4gICAgc2NvcmU6IE1hdGgucmFuZG9tKClcclxuICB9XTtcclxufVxyXG5cclxuZnVuY3Rpb24gX21ha2VQcmVmaXhIZWxwKHBsdWdpbkNvbmZpZywgcXVlcnkpIHtcclxuICBpZiAoIXBsdWdpbkNvbmZpZy5wcmVmaXgpIHJldHVybjtcclxuICBjb25zdCBjYW5kaWRhdGVzID0gW3BsdWdpbkNvbmZpZy5wcmVmaXhdO1xyXG4gIGNvbnN0IGZpbHRlcmVkID0gbWF0Y2h1dGlsLmhlYWQoY2FuZGlkYXRlcywgcXVlcnksICh4KSA9PiB4KTtcclxuICByZXR1cm4gZmlsdGVyZWQubWFwKCh4KSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZWRpcmVjdDogcGx1Z2luQ29uZmlnLnJlZGlyZWN0IHx8IHBsdWdpbkNvbmZpZy5wcmVmaXgsXHJcbiAgICAgIHRpdGxlOiB0ZXh0dXRpbC5zYW5pdGl6ZShtYXRjaHV0aWwubWFrZVN0cmluZ0JvbGRIdG1sKHguZWxlbSwgeC5tYXRjaGVzKSksXHJcbiAgICAgIGRlc2M6IHRleHR1dGlsLnNhbml0aXplKHBsdWdpbkNvbmZpZy5uYW1lKSxcclxuICAgICAgZ3JvdXA6ICdQbHVnaW4gQ29tbWFuZHMnLFxyXG4gICAgICBpY29uOiBwbHVnaW5Db25maWcuaWNvblxyXG4gICAgfTtcclxuICB9KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAod29ya2VyQ29udGV4dCkgPT4ge1xyXG4gIGNvbnN0IHBsdWdpbkxvYWRlciA9IHJlcXVpcmUoJy4vcGx1Z2luLWxvYWRlcicpKHdvcmtlckNvbnRleHQpO1xyXG4gIGNvbnN0IGxvZ2dlciA9IHdvcmtlckNvbnRleHQubG9nZ2VyO1xyXG5cclxuICBsZXQgcGx1Z2lucyA9IG51bGw7XHJcbiAgbGV0IHBsdWdpbkNvbmZpZ3MgPSBudWxsO1xyXG5cclxuICBjb25zdCBwbHVnaW5Db250ZXh0ID0ge1xyXG4gICAgUExVR0lOX0FQSV9WRVJTSU9OOiAnaGFpbjAnLFxyXG4gICAgTUFJTl9QTFVHSU5fUkVQTzogY29uZi5NQUlOX1BMVUdJTl9SRVBPLFxyXG4gICAgYXBwOiB3b3JrZXJDb250ZXh0LmFwcCxcclxuICAgIHRvYXN0OiB3b3JrZXJDb250ZXh0LnRvYXN0LFxyXG4gICAgc2hlbGw6IHdvcmtlckNvbnRleHQuc2hlbGwsXHJcbiAgICBsb2dnZXI6IHdvcmtlckNvbnRleHQubG9nZ2VyLFxyXG4gICAgbWF0Y2h1dGlsXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gX3N0YXJ0dXAoKSB7XHJcbiAgICBsb2dnZXIubG9nKCdzdGFydHVwOiBiZWdpbicpO1xyXG4gICAgZm9yIChjb25zdCBwcm9wIGluIHBsdWdpbnMpIHtcclxuICAgICAgbG9nZ2VyLmxvZyhgc3RhcnR1cDogJHtwcm9wfWApO1xyXG4gICAgICBjb25zdCBzdGFydHVwRnVuYyA9IHBsdWdpbnNbcHJvcF0uc3RhcnR1cDtcclxuICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oc3RhcnR1cEZ1bmMpKSB7XHJcbiAgICAgICAgbG9nZ2VyLmxvZyhgJHtwcm9wfTogc3RhcnR1cCBwcm9wZXJ0eSBzaG91bGQgYmUgYSBGdW5jdGlvbmApO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc3RhcnR1cEZ1bmMoKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGxvZ2dlci5sb2coZSk7XHJcbiAgICAgICAgaWYgKGUuc3RhY2spXHJcbiAgICAgICAgICBsb2dnZXIubG9nKGUuc3RhY2spO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBsb2dnZXIubG9nKCdzdGFydHVwOiBlbmQnKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XHJcbiAgICBjb25zdCByZXQgPSBwbHVnaW5Mb2FkZXIubG9hZFBsdWdpbnMocGx1Z2luQ29udGV4dCk7XHJcbiAgICBwbHVnaW5zID0gcmV0LnBsdWdpbnM7XHJcbiAgICBwbHVnaW5Db25maWdzID0gcmV0LnBsdWdpbkNvbmZpZ3M7XHJcbiAgICBfc3RhcnR1cCgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2VhcmNoQWxsKHF1ZXJ5LCByZXMpIHtcclxuICAgIGZvciAoY29uc3QgcHJvcCBpbiBwbHVnaW5zKSB7XHJcbiAgICAgIGNvbnN0IHBsdWdpbklkID0gcHJvcDtcclxuICAgICAgY29uc3QgcGx1Z2luID0gcGx1Z2luc1twbHVnaW5JZF07XHJcbiAgICAgIGNvbnN0IHBsdWdpbkNvbmZpZyA9IHBsdWdpbkNvbmZpZ3NbcGx1Z2luSWRdO1xyXG5cclxuICAgICAgY29uc3Qgc3lzUmVzcG9uc2UgPSBjcmVhdGVSZXNwb25zZU9iamVjdChyZXMsICcqJywgcGx1Z2luQ29uZmlnKTtcclxuICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGNvbnN0IGhlbHAgPSBfbWFrZUludHJvSGVscChwbHVnaW5Db25maWcpO1xyXG4gICAgICAgIGlmIChoZWxwICYmIGhlbHAubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgc3lzUmVzcG9uc2UuYWRkKGhlbHApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IF9xdWVyeSA9IHF1ZXJ5O1xyXG4gICAgICBjb25zdCBfcXVlcnlfbG93ZXIgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBjb25zdCBfcHJlZml4ID0gcGx1Z2luQ29uZmlnLnByZWZpeDtcclxuXHJcbiAgICAgIGlmIChfcHJlZml4IC8qICE9IG51bGwgfHwgIT0gdW5kZWZpbmVkICovKSB7XHJcbiAgICAgICAgY29uc3QgcHJlZml4X2xvd2VyID0gX3ByZWZpeC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChfcXVlcnlfbG93ZXIuc3RhcnRzV2l0aChwcmVmaXhfbG93ZXIpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgY29uc3QgcHJlZml4SGVscCA9IF9tYWtlUHJlZml4SGVscChwbHVnaW5Db25maWcsIHF1ZXJ5KTtcclxuICAgICAgICAgIGlmIChwcmVmaXhIZWxwICYmIHByZWZpeEhlbHAubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzeXNSZXNwb25zZS5hZGQocHJlZml4SGVscCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgX3F1ZXJ5ID0gX3F1ZXJ5LnN1YnN0cmluZyhfcHJlZml4Lmxlbmd0aCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBsdWdpblJlc3BvbnNlID0gY3JlYXRlUmVzcG9uc2VPYmplY3QocmVzLCBwbHVnaW5JZCwgcGx1Z2luQ29uZmlnKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBwbHVnaW4uc2VhcmNoKF9xdWVyeSwgcGx1Z2luUmVzcG9uc2UpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgbG9nZ2VyLmxvZyhlKTtcclxuICAgICAgICBpZiAoZS5zdGFjaylcclxuICAgICAgICAgIGxvZ2dlci5sb2coZS5zdGFjayk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGV4ZWN1dGUocGx1Z2luSWQsIGlkLCBwYXlsb2FkKSB7XHJcbiAgICBpZiAocGx1Z2luc1twbHVnaW5JZF0gPT09IHVuZGVmaW5lZClcclxuICAgICAgcmV0dXJuO1xyXG4gICAgY29uc3QgZXhlY3V0ZUZ1bmMgPSBwbHVnaW5zW3BsdWdpbklkXS5leGVjdXRlO1xyXG4gICAgaWYgKGV4ZWN1dGVGdW5jID09PSB1bmRlZmluZWQpXHJcbiAgICAgIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGV4ZWN1dGVGdW5jKGlkLCBwYXlsb2FkKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgbG9nZ2VyLmxvZyhlKTtcclxuICAgICAgaWYgKGUuc3RhY2spXHJcbiAgICAgICAgbG9nZ2VyLmxvZyhlLnN0YWNrKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpbml0aWFsaXplLFxyXG4gICAgc2VhcmNoQWxsLFxyXG4gICAgZXhlY3V0ZVxyXG4gIH07XHJcbn07XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
