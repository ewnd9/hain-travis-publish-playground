'use strict';

var _ = require('lodash');
var co = require('co');
var Packman = require('./packman');
var got = require('got');

var COMMANDS_RE = / (install|uninstall|list)(\s+([^\s]+))?/i;
var NAME = 'hain-package-manager (experimental)';
var PREFIX = '/hpm';

var COMMANDS = [PREFIX + ' install ', PREFIX + ' uninstall ', PREFIX + ' list '];
var CACHE_DURATION_SEC = 5 * 60; // 5 mins

module.exports = function (context) {
  var _marked = [searchPackages, uninstallPackage, installPackage].map(regeneratorRuntime.mark);

  var pm = new Packman(context.MAIN_PLUGIN_REPO, './_temp');
  var toast = context.toast;
  var logger = context.logger;
  var shell = context.shell;
  var matchutil = context.matchutil;
  var app = context.app;
  var PLUGIN_API_VERSION = context.PLUGIN_API_VERSION;

  var currentStatus = null;
  var progressTimer = 0;
  var lastUpdatedTime = 0;
  var availablePackages = [];

  function searchPackages(query) {
    var query_enc, fields, url, res, packages;
    return regeneratorRuntime.wrap(function searchPackages$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            query_enc = query;
            fields = 'name,rating,version,description,keywords,author';
            url = 'http://npmsearch.com/query?q=name:' + query_enc + '&fields=' + fields + '&default_operator=AND&sort=rating:desc&size=50';
            _context.next = 5;
            return got(url, { json: true });

          case 5:
            res = _context.sent;
            packages = _.filter(res.body.results, function (x) {
              return x.keywords && x.keywords.indexOf(PLUGIN_API_VERSION) >= 0;
            });
            return _context.abrupt('return', packages.map(function (x) {
              return {
                name: x.name[0],
                version: x.version[0],
                desc: x.description[0],
                author: x.author[0] || ''
              };
            }));

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked[0], this);
  }

  function checkAvailablePackages() {
    var elapsed = (Date.now() - lastUpdatedTime) / 1000;
    if (elapsed <= CACHE_DURATION_SEC) return;
    lastUpdatedTime = Date.now();
    return co(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              currentStatus = 'fetching available packages...';
              _context2.next = 3;
              return searchPackages('hain-plugin');

            case 3:
              availablePackages = _context2.sent;

              currentStatus = null;

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee, this);
    }));
  }

  function getPackageInfo(packageName) {
    return _.find(pm.listPackages(), function (x) {
      return x.name === packageName;
    });
  }

  function startup() {
    co(regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              pm.readPackages();
              checkAvailablePackages();

            case 2:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee2, this);
    })).catch(function (err) {
      logger.log(err);
    });
  }

  function search(query, res) {
    if (currentStatus === null) {
      checkAvailablePackages();
    }
    clearTimeout(progressTimer);
    if (currentStatus) {
      res.add({
        id: '**',
        title: currentStatus,
        desc: NAME,
        icon: '#fa fa-spinner fa-spin'
      });
      progressTimer = setInterval(function () {
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

  function _toSearchResult(cmdType, pkgInfo, customName, payload) {
    return {
      id: pkgInfo.name,
      payload: payload || cmdType,
      title: (customName || pkgInfo.name) + ' ' + (' <span style=\'font-size: 9pt\'>' + pkgInfo.version + ' by <b>' + pkgInfo.author + '</b></span>'),
      desc: '' + pkgInfo.desc
    };
  }

  function parseCommands(query) {
    // install
    var parsed = COMMANDS_RE.exec(query.toLowerCase());
    if (!parsed) {
      return _makeCommandsHelp(query);
    }
    var command = parsed[1];
    var arg = parsed[2];
    if (command === 'install') {
      if (arg) {
        return matchutil.fuzzy(availablePackages, arg.trim(), function (x) {
          return x.name;
        }).map(function (x) {
          var m = matchutil.makeStringBoldHtml(x.elem.name, x.matches);
          return _toSearchResult('install', x.elem, m);
        });
      }
      return availablePackages.map(function (x) {
        return _toSearchResult('install', x);
      });
    }
    if (command === 'uninstall') {
      var packages = pm.listPackages();
      return packages.map(function (x) {
        return _toSearchResult('uninstall', x);
      });
    }
    // list
    if (command === 'list') {
      var _packages = pm.listPackages();
      return _packages.map(function (x) {
        return _toSearchResult('', x, null, 'list');
      });
    }
    return _makeCommandsHelp(query);
  }

  function _makeCommandsHelp(query) {
    var ret = matchutil.head(COMMANDS, '' + PREFIX + query, function (x) {
      return x;
    }).map(function (x) {
      return {
        redirect: x.elem,
        title: matchutil.makeStringBoldHtml(x.elem, x.matches),
        desc: NAME
      };
    });
    return ret;
  }

  function execute(id, payload) {
    if (payload === 'install') {
      co(installPackage(id, 'latest'));
      app.setInput(PREFIX + ' ');
    } else if (payload === 'uninstall') {
      co(uninstallPackage(id));
      app.setInput(PREFIX + ' ');
    } else if (payload === 'list') {
      var pkgInfo = getPackageInfo(id);
      if (pkgInfo.homepage) shell.openExternal(pkgInfo.homepage);
    }
  }

  function uninstallPackage(packageName) {
    return regeneratorRuntime.wrap(function uninstallPackage$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            currentStatus = 'Uninstalling <b>' + packageName;
            _context4.prev = 1;
            _context4.next = 4;
            return pm.removePackage(packageName);

          case 4:
            toast.enqueue(packageName + ' has uninstalled, <b>Restart</b> Hain to take effect', 3000);
            _context4.next = 10;
            break;

          case 7:
            _context4.prev = 7;
            _context4.t0 = _context4['catch'](1);

            toast.enqueue(_context4.t0.toString());

          case 10:
            _context4.prev = 10;

            currentStatus = null;
            return _context4.finish(10);

          case 13:
          case 'end':
            return _context4.stop();
        }
      }
    }, _marked[1], this, [[1, 7, 10, 13]]);
  }

  function installPackage(packageName, versionRange) {
    return regeneratorRuntime.wrap(function installPackage$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            logger.log('Installing ' + packageName);
            currentStatus = 'Installing <b>' + packageName + '</b>';
            _context5.prev = 2;
            _context5.next = 5;
            return pm.installPackage(packageName, versionRange);

          case 5:
            toast.enqueue(packageName + ' has installed, <b>Restart</b> Hain to take effect', 3000);
            logger.log(packageName + ' installed');
            _context5.next = 14;
            break;

          case 9:
            _context5.prev = 9;
            _context5.t0 = _context5['catch'](2);

            toast.enqueue(_context5.t0.toString());
            logger.log(packageName + ' ' + _context5.t0);
            throw _context5.t0;

          case 14:
            _context5.prev = 14;

            currentStatus = null;
            return _context5.finish(14);

          case 17:
          case 'end':
            return _context5.stop();
        }
      }
    }, _marked[2], this, [[2, 9, 14, 17]]);
  }

  return { startup: startup, search: search, execute: execute };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbnMvaGFpbi1wYWNrYWdlLW1hbmFnZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFKO0FBQ04sSUFBTSxLQUFLLFFBQVEsSUFBUixDQUFMO0FBQ04sSUFBTSxVQUFVLFFBQVEsV0FBUixDQUFWO0FBQ04sSUFBTSxNQUFNLFFBQVEsS0FBUixDQUFOOztBQUVOLElBQU0sY0FBYywwQ0FBZDtBQUNOLElBQU0sT0FBTyxxQ0FBUDtBQUNOLElBQU0sU0FBUyxNQUFUOztBQUVOLElBQU0sV0FBVyxDQUFJLG9CQUFKLEVBQTBCLHNCQUExQixFQUFrRCxpQkFBbEQsQ0FBWDtBQUNOLElBQU0scUJBQXFCLElBQUksRUFBSjs7QUFFM0IsT0FBTyxPQUFQLEdBQWlCLFVBQUMsT0FBRCxFQUFhO2lCQWNsQixnQkFtSUEsa0JBWUEsNkNBN0prQjs7QUFDNUIsTUFBTSxLQUFLLElBQUksT0FBSixDQUFZLFFBQVEsZ0JBQVIsRUFBMEIsU0FBdEMsQ0FBTCxDQURzQjtBQUU1QixNQUFNLFFBQVEsUUFBUSxLQUFSLENBRmM7QUFHNUIsTUFBTSxTQUFTLFFBQVEsTUFBUixDQUhhO0FBSTVCLE1BQU0sUUFBUSxRQUFRLEtBQVIsQ0FKYztBQUs1QixNQUFNLFlBQVksUUFBUSxTQUFSLENBTFU7QUFNNUIsTUFBTSxNQUFNLFFBQVEsR0FBUixDQU5nQjtBQU81QixNQUFNLHFCQUFxQixRQUFRLGtCQUFSLENBUEM7O0FBUzVCLE1BQUksZ0JBQWdCLElBQWhCLENBVHdCO0FBVTVCLE1BQUksZ0JBQWdCLENBQWhCLENBVndCO0FBVzVCLE1BQUksa0JBQWtCLENBQWxCLENBWHdCO0FBWTVCLE1BQUksb0JBQW9CLEVBQXBCLENBWndCOztBQWM1QixXQUFVLGNBQVYsQ0FBeUIsS0FBekI7UUFDUSxXQUNBLFFBQ0EsS0FDQSxLQUNBOzs7OztBQUpBLHdCQUFZO0FBQ1oscUJBQVM7QUFDVCx5REFBMkMseUJB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QUFFQSw0QkFBZ0IsSUFBaEI7Ozs7Ozs7OztHQVJKOztBQVlBLFdBQVUsY0FBVixDQUF5QixXQUF6QixFQUFzQyxZQUF0Qzs7Ozs7QUFDRSxtQkFBTyxHQUFQLGlCQUF5QixXQUF6QjtBQUNBLCtDQUFpQyxvQkFBakM7OzttQkFFUSxHQUFHLGNBQUgsQ0FBa0IsV0FBbEIsRUFBK0IsWUFBL0I7OztBQUNOLGtCQUFNLE9BQU4sQ0FBaUIsa0VBQWpCLEVBQWtGLElBQWxGO0FBQ0EsbUJBQU8sR0FBUCxDQUFjLDBCQUFkOzs7Ozs7OztBQUVBLGtCQUFNLE9BQU4sQ0FBYyxhQUFFLFFBQUYsRUFBZDtBQUNBLG1CQUFPLEdBQVAsQ0FBYyxnQ0FBZDs7Ozs7O0FBR0EsNEJBQWdCLElBQWhCOzs7Ozs7Ozs7R0FaSjs7QUFnQkEsU0FBTyxFQUFFLGdCQUFGLEVBQVcsY0FBWCxFQUFtQixnQkFBbkIsRUFBUCxDQTdLNEI7Q0FBYiIsImZpbGUiOiJwbHVnaW5zL2hhaW4tcGFja2FnZS1tYW5hZ2VyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5jb25zdCBjbyA9IHJlcXVpcmUoJ2NvJyk7XHJcbmNvbnN0IFBhY2ttYW4gPSByZXF1aXJlKCcuL3BhY2ttYW4nKTtcclxuY29uc3QgZ290ID0gcmVxdWlyZSgnZ290Jyk7XHJcblxyXG5jb25zdCBDT01NQU5EU19SRSA9IC8gKGluc3RhbGx8dW5pbnN0YWxsfGxpc3QpKFxccysoW15cXHNdKykpPy9pO1xyXG5jb25zdCBOQU1FID0gJ2hhaW4tcGFja2FnZS1tYW5hZ2VyIChleHBlcmltZW50YWwpJztcclxuY29uc3QgUFJFRklYID0gJy9ocG0nO1xyXG5cclxuY29uc3QgQ09NTUFORFMgPSBbYCR7UFJFRklYfSBpbnN0YWxsIGAsIGAke1BSRUZJWH0gdW5pbnN0YWxsIGAsIGAke1BSRUZJWH0gbGlzdCBgXTtcclxuY29uc3QgQ0FDSEVfRFVSQVRJT05fU0VDID0gNSAqIDYwOyAvLyA1IG1pbnNcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKGNvbnRleHQpID0+IHtcclxuICBjb25zdCBwbSA9IG5ldyBQYWNrbWFuKGNvbnRleHQuTUFJTl9QTFVHSU5fUkVQTywgJy4vX3RlbXAnKTtcclxuICBjb25zdCB0b2FzdCA9IGNvbnRleHQudG9hc3Q7XHJcbiAgY29uc3QgbG9nZ2VyID0gY29udGV4dC5sb2dnZXI7XHJcbiAgY29uc3Qgc2hlbGwgPSBjb250ZXh0LnNoZWxsO1xyXG4gIGNvbnN0IG1hdGNodXRpbCA9IGNvbnRleHQubWF0Y2h1dGlsO1xyXG4gIGNvbnN0IGFwcCA9IGNvbnRleHQuYXBwO1xyXG4gIGNvbnN0IFBMVUdJTl9BUElfVkVSU0lPTiA9IGNvbnRleHQuUExVR0lOX0FQSV9WRVJTSU9OO1xyXG5cclxuICBsZXQgY3VycmVudFN0YXR1cyA9IG51bGw7XHJcbiAgbGV0IHByb2dyZXNzVGltZXIgPSAwO1xyXG4gIGxldCBsYXN0VXBkYXRlZFRpbWUgPSAwO1xyXG4gIGxldCBhdmFpbGFibGVQYWNrYWdlcyA9IFtdO1xyXG5cclxuICBmdW5jdGlvbiogc2VhcmNoUGFja2FnZXMocXVlcnkpIHtcclxuICAgIGNvbnN0IHF1ZXJ5X2VuYyA9IHF1ZXJ5O1xyXG4gICAgY29uc3QgZmllbGRzID0gJ25hbWUscmF0aW5nLHZlcnNpb24sZGVzY3JpcHRpb24sa2V5d29yZHMsYXV0aG9yJztcclxuICAgIGNvbnN0IHVybCA9IGBodHRwOi8vbnBtc2VhcmNoLmNvbS9xdWVyeT9xPW5hbWU6JHtxdWVyeV9lbmN9JmZpZWxkcz0ke2ZpZWxkc30mZGVmYXVsdF9vcGVyYXRvcj1BTkQmc29ydD1yYXRpbmc6ZGVzYyZzaXplPTUwYDtcclxuICAgIGNvbnN0IHJlcyA9IHlpZWxkIGdvdCh1cmwsIHsganNvbjogdHJ1ZSB9KTtcclxuICAgIGNvbnN0IHBhY2thZ2VzID0gXy5maWx0ZXIocmVzLmJvZHkucmVzdWx0cywgeCA9PiB7XHJcbiAgICAgIHJldHVybiAoeC5rZXl3b3JkcyAmJiB4LmtleXdvcmRzLmluZGV4T2YoUExVR0lOX0FQSV9WRVJTSU9OKSA+PSAwKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHBhY2thZ2VzLm1hcCh4ID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lOiB4Lm5hbWVbMF0sXHJcbiAgICAgICAgdmVyc2lvbjogeC52ZXJzaW9uWzBdLFxyXG4gICAgICAgIGRlc2M6IHguZGVzY3JpcHRpb25bMF0sXHJcbiAgICAgICAgYXV0aG9yOiB4LmF1dGhvclswXSB8fCAnJ1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGVja0F2YWlsYWJsZVBhY2thZ2VzKCkge1xyXG4gICAgY29uc3QgZWxhcHNlZCA9IChEYXRlLm5vdygpIC0gbGFzdFVwZGF0ZWRUaW1lKSAvIDEwMDA7XHJcbiAgICBpZiAoZWxhcHNlZCA8PSBDQUNIRV9EVVJBVElPTl9TRUMpXHJcbiAgICAgIHJldHVybjtcclxuICAgIGxhc3RVcGRhdGVkVGltZSA9IERhdGUubm93KCk7XHJcbiAgICByZXR1cm4gY28oZnVuY3Rpb24qICgpIHtcclxuICAgICAgY3VycmVudFN0YXR1cyA9ICdmZXRjaGluZyBhdmFpbGFibGUgcGFja2FnZXMuLi4nO1xyXG4gICAgICBhdmFpbGFibGVQYWNrYWdlcyA9IHlpZWxkIHNlYXJjaFBhY2thZ2VzKCdoYWluLXBsdWdpbicpO1xyXG4gICAgICBjdXJyZW50U3RhdHVzID0gbnVsbDtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0UGFja2FnZUluZm8ocGFja2FnZU5hbWUpIHtcclxuICAgIHJldHVybiBfLmZpbmQocG0ubGlzdFBhY2thZ2VzKCksICh4KSA9PiB4Lm5hbWUgPT09IHBhY2thZ2VOYW1lKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN0YXJ0dXAoKSB7XHJcbiAgICBjbyhmdW5jdGlvbiogKCkge1xyXG4gICAgICBwbS5yZWFkUGFja2FnZXMoKTtcclxuICAgICAgY2hlY2tBdmFpbGFibGVQYWNrYWdlcygpO1xyXG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICBsb2dnZXIubG9nKGVycik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNlYXJjaChxdWVyeSwgcmVzKSB7XHJcbiAgICBpZiAoY3VycmVudFN0YXR1cyA9PT0gbnVsbCkge1xyXG4gICAgICBjaGVja0F2YWlsYWJsZVBhY2thZ2VzKCk7XHJcbiAgICB9XHJcbiAgICBjbGVhclRpbWVvdXQocHJvZ3Jlc3NUaW1lcik7XHJcbiAgICBpZiAoY3VycmVudFN0YXR1cykge1xyXG4gICAgICByZXMuYWRkKHtcclxuICAgICAgICBpZDogJyoqJyxcclxuICAgICAgICB0aXRsZTogY3VycmVudFN0YXR1cyxcclxuICAgICAgICBkZXNjOiBOQU1FLFxyXG4gICAgICAgIGljb246ICcjZmEgZmEtc3Bpbm5lciBmYS1zcGluJ1xyXG4gICAgICB9KTtcclxuICAgICAgcHJvZ3Jlc3NUaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICBpZiAoIWN1cnJlbnRTdGF0dXMpIHtcclxuICAgICAgICAgIHJlcy5yZW1vdmUoJyoqJyk7XHJcbiAgICAgICAgICByZXMuYWRkKHBhcnNlQ29tbWFuZHMocXVlcnkpKTtcclxuICAgICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQocHJvZ3Jlc3NUaW1lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCA1MDApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICByZXMuYWRkKHBhcnNlQ29tbWFuZHMocXVlcnkpKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIF90b1NlYXJjaFJlc3VsdChjbWRUeXBlLCBwa2dJbmZvLCBjdXN0b21OYW1lLCBwYXlsb2FkKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpZDogcGtnSW5mby5uYW1lLFxyXG4gICAgICBwYXlsb2FkOiBwYXlsb2FkIHx8IGNtZFR5cGUsXHJcbiAgICAgIHRpdGxlOiBgJHtjdXN0b21OYW1lIHx8IHBrZ0luZm8ubmFtZX0gYCArXHJcbiAgICAgICAgICAgICBgIDxzcGFuIHN0eWxlPSdmb250LXNpemU6IDlwdCc+JHtwa2dJbmZvLnZlcnNpb259IGJ5IDxiPiR7cGtnSW5mby5hdXRob3J9PC9iPjwvc3Bhbj5gLFxyXG4gICAgICBkZXNjOiBgJHtwa2dJbmZvLmRlc2N9YFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBhcnNlQ29tbWFuZHMocXVlcnkpIHtcclxuICAgIC8vIGluc3RhbGxcclxuICAgIGNvbnN0IHBhcnNlZCA9IENPTU1BTkRTX1JFLmV4ZWMocXVlcnkudG9Mb3dlckNhc2UoKSk7XHJcbiAgICBpZiAoIXBhcnNlZCkge1xyXG4gICAgICByZXR1cm4gX21ha2VDb21tYW5kc0hlbHAocXVlcnkpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY29tbWFuZCA9IHBhcnNlZFsxXTtcclxuICAgIGNvbnN0IGFyZyA9IHBhcnNlZFsyXTtcclxuICAgIGlmIChjb21tYW5kID09PSAnaW5zdGFsbCcpIHtcclxuICAgICAgaWYgKGFyZykge1xyXG4gICAgICAgIHJldHVybiBtYXRjaHV0aWwuZnV6enkoYXZhaWxhYmxlUGFja2FnZXMsIGFyZy50cmltKCksIHggPT4geC5uYW1lKS5tYXAoeCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBtID0gbWF0Y2h1dGlsLm1ha2VTdHJpbmdCb2xkSHRtbCh4LmVsZW0ubmFtZSwgeC5tYXRjaGVzKTtcclxuICAgICAgICAgIHJldHVybiBfdG9TZWFyY2hSZXN1bHQoJ2luc3RhbGwnLCB4LmVsZW0sIG0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhdmFpbGFibGVQYWNrYWdlcy5tYXAoeCA9PiBfdG9TZWFyY2hSZXN1bHQoJ2luc3RhbGwnLCB4KSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY29tbWFuZCA9PT0gJ3VuaW5zdGFsbCcpIHtcclxuICAgICAgY29uc3QgcGFja2FnZXMgPSBwbS5saXN0UGFja2FnZXMoKTtcclxuICAgICAgcmV0dXJuIHBhY2thZ2VzLm1hcCgoeCkgPT4gX3RvU2VhcmNoUmVzdWx0KCd1bmluc3RhbGwnLCB4KSk7XHJcbiAgICB9XHJcbiAgICAvLyBsaXN0XHJcbiAgICBpZiAoY29tbWFuZCA9PT0gJ2xpc3QnKSB7XHJcbiAgICAgIGNvbnN0IHBhY2thZ2VzID0gcG0ubGlzdFBhY2thZ2VzKCk7XHJcbiAgICAgIHJldHVybiBwYWNrYWdlcy5tYXAoKHgpID0+IF90b1NlYXJjaFJlc3VsdCgnJywgeCwgbnVsbCwgJ2xpc3QnKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX21ha2VDb21tYW5kc0hlbHAocXVlcnkpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gX21ha2VDb21tYW5kc0hlbHAocXVlcnkpIHtcclxuICAgIGNvbnN0IHJldCA9IG1hdGNodXRpbC5oZWFkKENPTU1BTkRTLCBgJHtQUkVGSVh9JHtxdWVyeX1gLCAoeCkgPT4geCkubWFwKCh4KSA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVkaXJlY3Q6IHguZWxlbSxcclxuICAgICAgICB0aXRsZTogbWF0Y2h1dGlsLm1ha2VTdHJpbmdCb2xkSHRtbCh4LmVsZW0sIHgubWF0Y2hlcyksXHJcbiAgICAgICAgZGVzYzogTkFNRVxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZXhlY3V0ZShpZCwgcGF5bG9hZCkge1xyXG4gICAgaWYgKHBheWxvYWQgPT09ICdpbnN0YWxsJykge1xyXG4gICAgICBjbyhpbnN0YWxsUGFja2FnZShpZCwgJ2xhdGVzdCcpKTtcclxuICAgICAgYXBwLnNldElucHV0KGAke1BSRUZJWH0gYCk7XHJcbiAgICB9IGVsc2UgaWYgKHBheWxvYWQgPT09ICd1bmluc3RhbGwnKSB7XHJcbiAgICAgIGNvKHVuaW5zdGFsbFBhY2thZ2UoaWQpKTtcclxuICAgICAgYXBwLnNldElucHV0KGAke1BSRUZJWH0gYCk7XHJcbiAgICB9IGVsc2UgaWYgKHBheWxvYWQgPT09ICdsaXN0Jykge1xyXG4gICAgICBjb25zdCBwa2dJbmZvID0gZ2V0UGFja2FnZUluZm8oaWQpO1xyXG4gICAgICBpZiAocGtnSW5mby5ob21lcGFnZSlcclxuICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwocGtnSW5mby5ob21lcGFnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiogdW5pbnN0YWxsUGFja2FnZShwYWNrYWdlTmFtZSkge1xyXG4gICAgY3VycmVudFN0YXR1cyA9IGBVbmluc3RhbGxpbmcgPGI+JHtwYWNrYWdlTmFtZX1gO1xyXG4gICAgdHJ5IHtcclxuICAgICAgeWllbGQgcG0ucmVtb3ZlUGFja2FnZShwYWNrYWdlTmFtZSk7XHJcbiAgICAgIHRvYXN0LmVucXVldWUoYCR7cGFja2FnZU5hbWV9IGhhcyB1bmluc3RhbGxlZCwgPGI+UmVzdGFydDwvYj4gSGFpbiB0byB0YWtlIGVmZmVjdGAsIDMwMDApO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB0b2FzdC5lbnF1ZXVlKGUudG9TdHJpbmcoKSk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBjdXJyZW50U3RhdHVzID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uKiBpbnN0YWxsUGFja2FnZShwYWNrYWdlTmFtZSwgdmVyc2lvblJhbmdlKSB7XHJcbiAgICBsb2dnZXIubG9nKGBJbnN0YWxsaW5nICR7cGFja2FnZU5hbWV9YCk7XHJcbiAgICBjdXJyZW50U3RhdHVzID0gYEluc3RhbGxpbmcgPGI+JHtwYWNrYWdlTmFtZX08L2I+YDtcclxuICAgIHRyeSB7XHJcbiAgICAgIHlpZWxkIHBtLmluc3RhbGxQYWNrYWdlKHBhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UpO1xyXG4gICAgICB0b2FzdC5lbnF1ZXVlKGAke3BhY2thZ2VOYW1lfSBoYXMgaW5zdGFsbGVkLCA8Yj5SZXN0YXJ0PC9iPiBIYWluIHRvIHRha2UgZWZmZWN0YCwgMzAwMCk7XHJcbiAgICAgIGxvZ2dlci5sb2coYCR7cGFja2FnZU5hbWV9IGluc3RhbGxlZGApO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB0b2FzdC5lbnF1ZXVlKGUudG9TdHJpbmcoKSk7XHJcbiAgICAgIGxvZ2dlci5sb2coYCR7cGFja2FnZU5hbWV9ICR7ZX1gKTtcclxuICAgICAgdGhyb3cgZTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGN1cnJlbnRTdGF0dXMgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgc3RhcnR1cCwgc2VhcmNoLCBleGVjdXRlIH07XHJcbn07XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
