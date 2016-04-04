'use strict';

var _ = require('lodash');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var storage = require('node-persist');
var logger = require('../utils/logger');
var iconFmt = require('./icon-fmt');
var conf = require('./conf');

module.exports = function (workerContext) {
  function ensurePluginRepos() {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = conf.PLUGIN_REPOS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var repo = _step.value;

        fse.ensureDirSync(repo);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  function readPluginFiles() {
    ensurePluginRepos();

    var files = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var repo = _step2.value;

        try {
          var _files = fs.readdirSync(repo);
          files = files.concat(_files.map(function (x) {
            return path.join(repo, x);
          }));
        } catch (e) {
          logger.log(e);
        }
      };

      for (var _iterator2 = conf.PLUGIN_REPOS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return files;
  }

  function pickPluginModule(pluginFile) {
    var PluginModule = null;
    try {
      PluginModule = require('' + pluginFile);
    } catch (e) {
      logger.log('error on loading: ' + pluginFile);
      logger.log(e.stack);
    }

    if (!_.isFunction(PluginModule)) {
      logger.log('plugin not function: ' + pluginFile);
      return null;
    }
    return PluginModule;
  }

  function parsePluginConfig(pluginId, pluginFile) {
    var pluginConfig = {};
    try {
      var packageJson = require(path.join(pluginFile, 'package.json'));
      var hainProps = packageJson.hain;
      if (hainProps) {
        pluginConfig = _.assign(pluginConfig, hainProps);
        pluginConfig.usage = pluginConfig.usage || pluginConfig.prefix;
        pluginConfig.icon = iconFmt.parseIconUrl(pluginFile, pluginConfig.icon);
        pluginConfig.group = pluginConfig.group || pluginId;
      }
      pluginConfig.name = packageJson.name;
      pluginConfig.version = packageJson.version;
    } catch (e) {
      logger.log(pluginId + ' package.json error');
      return null;
    }
    return pluginConfig;
  }

  function createPluginLocalStorage(pluginId) {
    var localStorageDir = conf.LOCAL_STORAGE_DIR + '/' + pluginId;
    fse.ensureDirSync(localStorageDir);

    var localStorage = storage.create({
      dir: localStorageDir
    });
    localStorage.initSync();
    return localStorage;
  }

  function loadPlugins(context) {
    var pluginFiles = readPluginFiles();

    var plugins = {};
    var pluginConfigs = {};
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = pluginFiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var pluginFile = _step3.value;

        if (plugins[pluginFile] !== undefined) {
          logger.log('conflict: ' + pluginFile + ' is already loaded');
          continue;
        }

        var PluginModule = pickPluginModule(pluginFile);
        if (PluginModule === null) continue;

        var pluginId = path.basename(pluginFile);
        var pluginConfig = parsePluginConfig(pluginId, pluginFile);
        if (pluginConfig === null) continue;

        var pluginLocalStorage = createPluginLocalStorage(pluginId);
        var finalPluginContext = _.assign(context, {
          localStorage: pluginLocalStorage
        });

        try {
          var pluginInstance = PluginModule(finalPluginContext);
          plugins[pluginId] = pluginInstance;
          pluginConfigs[pluginId] = pluginConfig;
          logger.log(pluginId + ' loaded');
        } catch (e) {
          logger.log(pluginId + ' could\'nt be created: ' + e);
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return { plugins: plugins, pluginConfigs: pluginConfigs };
  }

  return { loadPlugins: loadPlugins };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvcmtlci9wbHVnaW4tbG9hZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLElBQU0sSUFBSSxRQUFRLFFBQVIsQ0FBSjtBQUNOLElBQU0sS0FBSyxRQUFRLElBQVIsQ0FBTDtBQUNOLElBQU0sTUFBTSxRQUFRLFVBQVIsQ0FBTjtBQUNOLElBQU0sT0FBTyxRQUFRLE1BQVIsQ0FBUDtBQUNOLElBQU0sVUFBVSxRQUFRLGNBQVIsQ0FBVjtBQUNOLElBQU0sU0FBUyxRQUFRLGlCQUFSLENBQVQ7QUFDTixJQUFNLFVBQVUsUUFBUSxZQUFSLENBQVY7QUFDTixJQUFNLE9BQU8sUUFBUSxRQUFSLENBQVA7O0FBRU4sT0FBTyxPQUFQLEdBQWlCLFVBQUMsYUFBRCxFQUFtQjtBQUNsQyxXQUFTLGlCQUFULEdBQTZCOzs7Ozs7QUFDM0IsMkJBQW1CLEtBQUssWUFBTCwwQkFBbkIsb0dBQXNDO1lBQTNCLG1CQUEyQjs7QUFDcEMsWUFBSSxhQUFKLENBQWtCLElBQWxCLEVBRG9DO09BQXRDOzs7Ozs7Ozs7Ozs7OztLQUQyQjtHQUE3Qjs7QUFNQSxXQUFTLGVBQVQsR0FBMkI7QUFDekIsd0JBRHlCOztBQUd6QixRQUFJLFFBQVEsRUFBUixDQUhxQjs7Ozs7OztZQUlkOztBQUNULFlBQUk7QUFDRixjQUFNLFNBQVMsR0FBRyxXQUFILENBQWUsSUFBZixDQUFULENBREo7QUFFRixrQkFBUSxNQUFNLE1BQU4sQ0FBYSxPQUFPLEdBQVAsQ0FBVyxVQUFDLENBQUQ7bUJBQU8sS0FBSyxJQUFMLENBQVUsSUFBVixFQUFnQixDQUFoQjtXQUFQLENBQXhCLENBQVIsQ0FGRTtTQUFKLENBR0UsT0FBTyxDQUFQLEVBQVU7QUFDVixpQkFBTyxHQUFQLENBQVcsQ0FBWCxFQURVO1NBQVY7OztBQUpKLDRCQUFtQixLQUFLLFlBQUwsMkJBQW5CLHdHQUFzQzs7T0FBdEM7Ozs7Ozs7Ozs7Ozs7O0tBSnlCOztBQVl6QixXQUFPLEtBQVAsQ0FaeUI7R0FBM0I7O0FB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O0FBQ0YsY0FBTSxpQkFBaUIsYUFBYSxrQkFBYixDQUFqQixDQURKO0FBRUYsa0JBQVEsUUFBUixJQUFvQixjQUFwQixDQUZFO0FBR0Ysd0JBQWMsUUFBZCxJQUEwQixZQUExQixDQUhFO0FBSUYsaUJBQU8sR0FBUCxDQUFjLG9CQUFkLEVBSkU7U0FBSixDQUtFLE9BQU8sQ0FBUCxFQUFVO0FBQ1YsaUJBQU8sR0FBUCxDQUFjLHVDQUFpQyxDQUEvQyxFQURVO1NBQVY7T0F6Qko7Ozs7Ozs7Ozs7Ozs7O0tBTDRCOztBQWtDNUIsV0FBTyxFQUFFLGdCQUFGLEVBQVcsNEJBQVgsRUFBUCxDQWxDNEI7R0FBOUI7O0FBcUNBLFNBQU8sRUFBRSx3QkFBRixFQUFQLENBMUdrQztDQUFuQiIsImZpbGUiOiJ3b3JrZXIvcGx1Z2luLWxvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcclxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xyXG5jb25zdCBmc2UgPSByZXF1aXJlKCdmcy1leHRyYScpO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xyXG5jb25zdCBzdG9yYWdlID0gcmVxdWlyZSgnbm9kZS1wZXJzaXN0Jyk7XHJcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2xvZ2dlcicpO1xyXG5jb25zdCBpY29uRm10ID0gcmVxdWlyZSgnLi9pY29uLWZtdCcpO1xyXG5jb25zdCBjb25mID0gcmVxdWlyZSgnLi9jb25mJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9ICh3b3JrZXJDb250ZXh0KSA9PiB7XHJcbiAgZnVuY3Rpb24gZW5zdXJlUGx1Z2luUmVwb3MoKSB7XHJcbiAgICBmb3IgKGNvbnN0IHJlcG8gb2YgY29uZi5QTFVHSU5fUkVQT1MpIHtcclxuICAgICAgZnNlLmVuc3VyZURpclN5bmMocmVwbyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWFkUGx1Z2luRmlsZXMoKSB7XHJcbiAgICBlbnN1cmVQbHVnaW5SZXBvcygpO1xyXG5cclxuICAgIGxldCBmaWxlcyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCByZXBvIG9mIGNvbmYuUExVR0lOX1JFUE9TKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgX2ZpbGVzID0gZnMucmVhZGRpclN5bmMocmVwbyk7XHJcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5jb25jYXQoX2ZpbGVzLm1hcCgoeCkgPT4gcGF0aC5qb2luKHJlcG8sIHgpKSk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBsb2dnZXIubG9nKGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmlsZXM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwaWNrUGx1Z2luTW9kdWxlKHBsdWdpbkZpbGUpIHtcclxuICAgIGxldCBQbHVnaW5Nb2R1bGUgPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgUGx1Z2luTW9kdWxlID0gcmVxdWlyZShgJHtwbHVnaW5GaWxlfWApO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBsb2dnZXIubG9nKGBlcnJvciBvbiBsb2FkaW5nOiAke3BsdWdpbkZpbGV9YCk7XHJcbiAgICAgIGxvZ2dlci5sb2coZS5zdGFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oUGx1Z2luTW9kdWxlKSkge1xyXG4gICAgICBsb2dnZXIubG9nKGBwbHVnaW4gbm90IGZ1bmN0aW9uOiAke3BsdWdpbkZpbGV9YCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBsdWdpbk1vZHVsZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBhcnNlUGx1Z2luQ29uZmlnKHBsdWdpbklkLCBwbHVnaW5GaWxlKSB7XHJcbiAgICBsZXQgcGx1Z2luQ29uZmlnID0ge307XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IHJlcXVpcmUocGF0aC5qb2luKHBsdWdpbkZpbGUsICdwYWNrYWdlLmpzb24nKSk7XHJcbiAgICAgIGNvbnN0IGhhaW5Qcm9wcyA9IHBhY2thZ2VKc29uLmhhaW47XHJcbiAgICAgIGlmIChoYWluUHJvcHMpIHtcclxuICAgICAgICBwbHVnaW5Db25maWcgPSBfLmFzc2lnbihwbHVnaW5Db25maWcsIGhhaW5Qcm9wcyk7XHJcbiAgICAgICAgcGx1Z2luQ29uZmlnLnVzYWdlID0gcGx1Z2luQ29uZmlnLnVzYWdlIHx8IHBsdWdpbkNvbmZpZy5wcmVmaXg7XHJcbiAgICAgICAgcGx1Z2luQ29uZmlnLmljb24gPSBpY29uRm10LnBhcnNlSWNvblVybChwbHVnaW5GaWxlLCBwbHVnaW5Db25maWcuaWNvbik7XHJcbiAgICAgICAgcGx1Z2luQ29uZmlnLmdyb3VwID0gcGx1Z2luQ29uZmlnLmdyb3VwIHx8IHBsdWdpbklkO1xyXG4gICAgICB9XHJcbiAgICAgIHBsdWdpbkNvbmZpZy5uYW1lID0gcGFja2FnZUpzb24ubmFtZTtcclxuICAgICAgcGx1Z2luQ29uZmlnLnZlcnNpb24gPSBwYWNrYWdlSnNvbi52ZXJzaW9uO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBsb2dnZXIubG9nKGAke3BsdWdpbklkfSBwYWNrYWdlLmpzb24gZXJyb3JgKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGx1Z2luQ29uZmlnO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlUGx1Z2luTG9jYWxTdG9yYWdlKHBsdWdpbklkKSB7XHJcbiAgICBjb25zdCBsb2NhbFN0b3JhZ2VEaXIgPSBgJHtjb25mLkxPQ0FMX1NUT1JBR0VfRElSfS8ke3BsdWdpbklkfWA7XHJcbiAgICBmc2UuZW5zdXJlRGlyU3luYyhsb2NhbFN0b3JhZ2VEaXIpO1xyXG5cclxuICAgIGNvbnN0IGxvY2FsU3RvcmFnZSA9IHN0b3JhZ2UuY3JlYXRlKHtcclxuICAgICAgZGlyOiBsb2NhbFN0b3JhZ2VEaXJcclxuICAgIH0pO1xyXG4gICAgbG9jYWxTdG9yYWdlLmluaXRTeW5jKCk7XHJcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9hZFBsdWdpbnMoY29udGV4dCkge1xyXG4gICAgY29uc3QgcGx1Z2luRmlsZXMgPSByZWFkUGx1Z2luRmlsZXMoKTtcclxuXHJcbiAgICBjb25zdCBwbHVnaW5zID0ge307XHJcbiAgICBjb25zdCBwbHVnaW5Db25maWdzID0ge307XHJcbiAgICBmb3IgKGNvbnN0IHBsdWdpbkZpbGUgb2YgcGx1Z2luRmlsZXMpIHtcclxuICAgICAgaWYgKHBsdWdpbnNbcGx1Z2luRmlsZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGxvZ2dlci5sb2coYGNvbmZsaWN0OiAke3BsdWdpbkZpbGV9IGlzIGFscmVhZHkgbG9hZGVkYCk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IFBsdWdpbk1vZHVsZSA9IHBpY2tQbHVnaW5Nb2R1bGUocGx1Z2luRmlsZSk7XHJcbiAgICAgIGlmIChQbHVnaW5Nb2R1bGUgPT09IG51bGwpXHJcbiAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICBjb25zdCBwbHVnaW5JZCA9IHBhdGguYmFzZW5hbWUocGx1Z2luRmlsZSk7XHJcbiAgICAgIGNvbnN0IHBsdWdpbkNvbmZpZyA9IHBhcnNlUGx1Z2luQ29uZmlnKHBsdWdpbklkLCBwbHVnaW5GaWxlKTtcclxuICAgICAgaWYgKHBsdWdpbkNvbmZpZyA9PT0gbnVsbClcclxuICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgIGNvbnN0IHBsdWdpbkxvY2FsU3RvcmFnZSA9IGNyZWF0ZVBsdWdpbkxvY2FsU3RvcmFnZShwbHVnaW5JZCk7XHJcbiAgICAgIGNvbnN0IGZpbmFsUGx1Z2luQ29udGV4dCA9IF8uYXNzaWduKGNvbnRleHQsIHtcclxuICAgICAgICBsb2NhbFN0b3JhZ2U6IHBsdWdpbkxvY2FsU3RvcmFnZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGx1Z2luSW5zdGFuY2UgPSBQbHVnaW5Nb2R1bGUoZmluYWxQbHVnaW5Db250ZXh0KTtcclxuICAgICAgICBwbHVnaW5zW3BsdWdpbklkXSA9IHBsdWdpbkluc3RhbmNlO1xyXG4gICAgICAgIHBsdWdpbkNvbmZpZ3NbcGx1Z2luSWRdID0gcGx1Z2luQ29uZmlnO1xyXG4gICAgICAgIGxvZ2dlci5sb2coYCR7cGx1Z2luSWR9IGxvYWRlZGApO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgbG9nZ2VyLmxvZyhgJHtwbHVnaW5JZH0gY291bGQnbnQgYmUgY3JlYXRlZDogJHtlfWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBwbHVnaW5zLCBwbHVnaW5Db25maWdzIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBsb2FkUGx1Z2lucyB9O1xyXG59O1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
