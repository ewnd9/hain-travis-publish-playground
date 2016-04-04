'use strict';

var fs = require('original-fs');
var readdir = require('./readdir');
var co = require('co');

var path = require('path');

var matchFunc = function matchFunc(filePath, stats) {
  var ext = path.extname(filePath).toLowerCase();
  if (stats.isDirectory()) return true;
  return ext === '.exe' || ext === '.lnk';
};

module.exports = function (context) {
  var _marked = [refreshIndex, setupWatchers].map(regeneratorRuntime.mark);

  var matchutil = context.matchutil;
  var logger = context.logger;
  var shell = context.shell;
  var app = context.app;

  var recursiveSearchDirs = [process.env.USERPROFILE + '\\Desktop', process.env.ProgramData + '\\Microsoft\\Windows\\Start Menu\\Programs', process.env.APPDATA + '\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar', process.env.APPDATA + '\\Microsoft\\Windows\\Start Menu'];
  var flatSearchDirs = [process.env.SystemRoot + '\\System32', '' + process.env.SystemRoot];
  var db = {};
  var lazyIndexingKeys = {};

  function refreshIndex(dirs, recursive) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, dir, files;

    return regeneratorRuntime.wrap(function refreshIndex$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 3;
            _iterator = dirs[Symbol.iterator]();

          case 5:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 19;
              break;
            }

            dir = _step.value;

            logger.log('refreshIndex ' + dir);

            if (!(fs.existsSync(dir) === false)) {
              _context.next = 11;
              break;
            }

            logger.log('can\'t find a dir: ' + dir);
            return _context.abrupt('continue', 16);

          case 11:
            _context.next = 13;
            return co(readdir(dir, recursive, matchFunc));

          case 13:
            files = _context.sent;

            logger.log('index updated ' + dir);
            db[dir] = files;

          case 16:
            _iteratorNormalCompletion = true;
            _context.next = 5;
            break;

          case 19:
            _context.next = 25;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context['catch'](3);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 25:
            _context.prev = 25;
            _context.prev = 26;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 28:
            _context.prev = 28;

            if (!_didIteratorError) {
              _context.next = 31;
              break;
            }

            throw _iteratorError;

          case 31:
            return _context.finish(28);

          case 32:
            return _context.finish(25);

          case 33:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked[0], this, [[3, 21, 25, 33], [26,, 28, 32]]);
  }

  function lazyRefreshIndex(dir, recursive) {
    var _lazyKey = lazyIndexingKeys[dir];
    if (_lazyKey !== undefined) {
      clearTimeout(_lazyKey);
    }

    lazyIndexingKeys[dir] = setTimeout(function () {
      co(refreshIndex([dir], recursive));
    }, 5000);
  }

  function setupWatchers(dirs, recursive) {
    var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop, _iterator2, _step2;

    return regeneratorRuntime.wrap(function setupWatchers$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 3;

            _loop = function _loop() {
              var dir = _step2.value;

              var _dir = dir;
              fs.watch(_dir, {
                persistent: true,
                recursive: recursive
              }, function (evt, filename) {
                lazyRefreshIndex(_dir, recursive);
              });
            };

            for (_iterator2 = dirs[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _loop();
            }
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2['catch'](3);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t0;

          case 12:
            _context2.prev = 12;
            _context2.prev = 13;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 15:
            _context2.prev = 15;

            if (!_didIteratorError2) {
              _context2.next = 18;
              break;
            }

            throw _iteratorError2;

          case 18:
            return _context2.finish(15);

          case 19:
            return _context2.finish(12);

          case 20:
          case 'end':
            return _context2.stop();
        }
      }
    }, _marked[1], this, [[3, 8, 12, 20], [13,, 15, 19]]);
  }

  function startup() {
    co(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.delegateYield(refreshIndex(recursiveSearchDirs, true), 't0', 1);

            case 1:
              return _context3.delegateYield(refreshIndex(flatSearchDirs, false), 't1', 2);

            case 2:
              return _context3.delegateYield(setupWatchers(recursiveSearchDirs, true), 't2', 3);

            case 3:
              return _context3.delegateYield(setupWatchers(flatSearchDirs, false), 't3', 4);

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee, this);
    })).catch(function (err) {
      logger.log(err);
      logger.log(err.stack);
    });
  }

  function computeRatio(filePath) {
    var ratio = 1;
    var ext = path.extname(filePath).toLowerCase();
    var basename = path.basename(filePath).toLowerCase();
    if (ext !== '.lnk' && ext !== '.exe') ratio *= 0.5;
    if (basename.indexOf('uninstall') >= 0 || basename.indexOf('remove') >= 0) ratio *= 0.9;
    return ratio;
  }

  function search(query, res) {
    var query_trim = query.replace(' ', '');
    var searched = matchutil.fuzzy(db, query_trim, function (x) {
      return x;
    });
    var result = searched.slice(0, 10).map(function (x) {
      var filePath = x.elem;
      var filePath_bold = matchutil.makeStringBoldHtml(filePath, x.matches);
      var filePath_base64 = new Buffer(filePath).toString('base64');
      var score = x.score * computeRatio(filePath);
      return {
        id: filePath,
        title: path.basename(filePath, path.extname(filePath)),
        desc: filePath_bold,
        icon: 'icon://' + filePath_base64,
        group: 'Files & Folders',
        score: score
      };
    });
    res.add(result);
  }

  function execute(id, payload) {
    logger.log(id + ' executed');
    shell.openItem(id);
    app.close();
  }

  return { startup: startup, search: search, execute: execute };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbnMvaGFpbi1wbHVnaW4tZmlsZXNlYXJjaC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxJQUFNLEtBQUssUUFBUSxhQUFSLENBQUw7QUFDTixJQUFNLFVBQVUsUUFBUSxXQUFSLENBQVY7QUFDTixJQUFNLEtBQUssUUFBUSxJQUFSLENBQUw7O0FBRU4sSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFQOztBQUVOLElBQU0sWUFBWSxTQUFaLFNBQVksQ0FBQyxRQUFELEVBQVcsS0FBWCxFQUFxQjtBQUNyQyxNQUFNLE1BQU0sS0FBSyxPQUFMLENBQWEsUUFBYixFQUF1QixXQUF2QixFQUFOLENBRCtCO0FBRXJDLE1BQUksTUFBTSxXQUFOLEVBQUosRUFDRSxPQUFPLElBQVAsQ0FERjtBQUVBLFNBQVEsUUFBUSxNQUFSLElBQWtCLFFBQVEsTUFBUixDQUpXO0NBQXJCOztBQU9sQixPQUFPLE9BQVAsR0FBaUIsVUFBQyxPQUFELEVBQWE7aUJBbUJsQixjQXdCQSw0Q0EzQ2tCOztBQUM1QixNQUFNLFlBQVksUUFBUSxTQUFSLENBRFU7QUFFNUIsTUFBTSxTQUFTLFFBQVEsTUFBUixDQUZhO0FBRzVCLE1BQU0sUUFBUSxRQUFRLEtBQVIsQ0FIYztBQUk1QixNQUFNLE1BQU0sUUFBUSxHQUFSLENBSmdCOztBQU01QixNQUFNLHNCQUFzQixDQUN2QixRQUFRLEdBQVIsQ0FBWSxXQUFaLGNBRHVCLEVBRXZCLFFBQVEsR0FBUixDQUFZLFdBQVosK0NBRnVCLEVBR3ZCLFFBQVEsR0FBUixDQUFZLE9BQVosdUVBSHVCLEVBSXZCLFFBQVEsR0FBUixDQUFZLE9BQVoscUNBSnVCLENBQXRCLENBTnNCO0FBWTVCLE1BQU0saUJBQWlCLENBQ2xCLFFBQVEsR0FBUixDQUFZLFVBQVosZUFEa0IsT0FFbEIsUUFBUSxHQUFSLENBQVksVUFBWixDQUZDLENBWnNCO0FBZ0I1QixNQUFNLEtBQUssRUFBTCxDQWhCc0I7QUFpQjVCLE1BQU0sbUJB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O0FBRzFCLFFBQU0sU0FBUyxTQUFTLEtBQVQsQ0FBZSxDQUFmLEVBQWtCLEVBQWxCLEVBQXNCLEdBQXRCLENBQTBCLFVBQUMsQ0FBRCxFQUFPO0FBQzlDLFVBQU0sV0FBVyxFQUFFLElBQUYsQ0FENkI7QUFFOUMsVUFBTSxnQkFBZ0IsVUFBVSxrQkFBVixDQUE2QixRQUE3QixFQUF1QyxFQUFFLE9BQUYsQ0FBdkQsQ0FGd0M7QUFHOUMsVUFBTSxrQkFBa0IsSUFBSSxNQUFKLENBQVcsUUFBWCxFQUFxQixRQUFyQixDQUE4QixRQUE5QixDQUFsQixDQUh3QztBQUk5QyxVQUFNLFFBQVEsRUFBRSxLQUFGLEdBQVUsYUFBYSxRQUFiLENBQVYsQ0FKZ0M7QUFLOUMsYUFBTztBQUNMLFlBQUksUUFBSjtBQUNBLGVBQU8sS0FBSyxRQUFMLENBQWMsUUFBZCxFQUF3QixLQUFLLE9BQUwsQ0FBYSxRQUFiLENBQXhCLENBQVA7QUFDQSxjQUFNLGFBQU47QUFDQSwwQkFBZ0IsZUFBaEI7QUFDQSxlQUFPLGlCQUFQO0FBQ0Esb0JBTks7T0FBUCxDQUw4QztLQUFQLENBQW5DLENBSG9CO0FBaUIxQixRQUFJLEdBQUosQ0FBUSxNQUFSLEVBakIwQjtHQUE1Qjs7QUFvQkEsV0FBUyxPQUFULENBQWlCLEVBQWpCLEVBQXFCLE9BQXJCLEVBQThCO0FBQzVCLFdBQU8sR0FBUCxDQUFjLGdCQUFkLEVBRDRCO0FBRTVCLFVBQU0sUUFBTixDQUFlLEVBQWYsRUFGNEI7QUFHNUIsUUFBSSxLQUFKLEdBSDRCO0dBQTlCOztBQU1BLFNBQU8sRUFBRSxnQkFBRixFQUFXLGNBQVgsRUFBbUIsZ0JBQW5CLEVBQVAsQ0F4RzRCO0NBQWIiLCJmaWxlIjoicGx1Z2lucy9oYWluLXBsdWdpbi1maWxlc2VhcmNoL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZnMgPSByZXF1aXJlKCdvcmlnaW5hbC1mcycpO1xyXG5jb25zdCByZWFkZGlyID0gcmVxdWlyZSgnLi9yZWFkZGlyJyk7XHJcbmNvbnN0IGNvID0gcmVxdWlyZSgnY28nKTtcclxuXHJcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XHJcblxyXG5jb25zdCBtYXRjaEZ1bmMgPSAoZmlsZVBhdGgsIHN0YXRzKSA9PiB7XHJcbiAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xyXG4gIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgcmV0dXJuIChleHQgPT09ICcuZXhlJyB8fCBleHQgPT09ICcubG5rJyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChjb250ZXh0KSA9PiB7XHJcbiAgY29uc3QgbWF0Y2h1dGlsID0gY29udGV4dC5tYXRjaHV0aWw7XHJcbiAgY29uc3QgbG9nZ2VyID0gY29udGV4dC5sb2dnZXI7XHJcbiAgY29uc3Qgc2hlbGwgPSBjb250ZXh0LnNoZWxsO1xyXG4gIGNvbnN0IGFwcCA9IGNvbnRleHQuYXBwO1xyXG5cclxuICBjb25zdCByZWN1cnNpdmVTZWFyY2hEaXJzID0gW1xyXG4gICAgYCR7cHJvY2Vzcy5lbnYuVVNFUlBST0ZJTEV9XFxcXERlc2t0b3BgLFxyXG4gICAgYCR7cHJvY2Vzcy5lbnYuUHJvZ3JhbURhdGF9XFxcXE1pY3Jvc29mdFxcXFxXaW5kb3dzXFxcXFN0YXJ0IE1lbnVcXFxcUHJvZ3JhbXNgLFxyXG4gICAgYCR7cHJvY2Vzcy5lbnYuQVBQREFUQX1cXFxcTWljcm9zb2Z0XFxcXEludGVybmV0IEV4cGxvcmVyXFxcXFF1aWNrIExhdW5jaFxcXFxVc2VyIFBpbm5lZFxcXFxUYXNrQmFyYCxcclxuICAgIGAke3Byb2Nlc3MuZW52LkFQUERBVEF9XFxcXE1pY3Jvc29mdFxcXFxXaW5kb3dzXFxcXFN0YXJ0IE1lbnVgXHJcbiAgXTtcclxuICBjb25zdCBmbGF0U2VhcmNoRGlycyA9IFtcclxuICAgIGAke3Byb2Nlc3MuZW52LlN5c3RlbVJvb3R9XFxcXFN5c3RlbTMyYCxcclxuICAgIGAke3Byb2Nlc3MuZW52LlN5c3RlbVJvb3R9YFxyXG4gIF07XHJcbiAgY29uc3QgZGIgPSB7fTtcclxuICBjb25zdCBsYXp5SW5kZXhpbmdLZXlzID0ge307XHJcblxyXG4gIGZ1bmN0aW9uKiByZWZyZXNoSW5kZXgoZGlycywgcmVjdXJzaXZlKSB7XHJcbiAgICBmb3IgKGNvbnN0IGRpciBvZiBkaXJzKSB7XHJcbiAgICAgIGxvZ2dlci5sb2coYHJlZnJlc2hJbmRleCAke2Rpcn1gKTtcclxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZGlyKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICBsb2dnZXIubG9nKGBjYW4ndCBmaW5kIGEgZGlyOiAke2Rpcn1gKTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBmaWxlcyA9IHlpZWxkIGNvKHJlYWRkaXIoZGlyLCByZWN1cnNpdmUsIG1hdGNoRnVuYykpO1xyXG4gICAgICBsb2dnZXIubG9nKGBpbmRleCB1cGRhdGVkICR7ZGlyfWApO1xyXG4gICAgICBkYltkaXJdID0gZmlsZXM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsYXp5UmVmcmVzaEluZGV4KGRpciwgcmVjdXJzaXZlKSB7XHJcbiAgICBjb25zdCBfbGF6eUtleSA9IGxhenlJbmRleGluZ0tleXNbZGlyXTtcclxuICAgIGlmIChfbGF6eUtleSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dChfbGF6eUtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgbGF6eUluZGV4aW5nS2V5c1tkaXJdID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGNvKHJlZnJlc2hJbmRleChbZGlyXSwgcmVjdXJzaXZlKSk7XHJcbiAgICB9LCA1MDAwKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uKiBzZXR1cFdhdGNoZXJzKGRpcnMsIHJlY3Vyc2l2ZSkge1xyXG4gICAgZm9yIChjb25zdCBkaXIgb2YgZGlycykge1xyXG4gICAgICBjb25zdCBfZGlyID0gZGlyO1xyXG4gICAgICBmcy53YXRjaChfZGlyLCB7XHJcbiAgICAgICAgcGVyc2lzdGVudDogdHJ1ZSxcclxuICAgICAgICByZWN1cnNpdmU6IHJlY3Vyc2l2ZVxyXG4gICAgICB9LCAoZXZ0LCBmaWxlbmFtZSkgPT4ge1xyXG4gICAgICAgIGxhenlSZWZyZXNoSW5kZXgoX2RpciwgcmVjdXJzaXZlKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdGFydHVwKCkge1xyXG4gICAgY28oZnVuY3Rpb24qICgpIHtcclxuICAgICAgeWllbGQqIHJlZnJlc2hJbmRleChyZWN1cnNpdmVTZWFyY2hEaXJzLCB0cnVlKTtcclxuICAgICAgeWllbGQqIHJlZnJlc2hJbmRleChmbGF0U2VhcmNoRGlycywgZmFsc2UpO1xyXG4gICAgICB5aWVsZCogc2V0dXBXYXRjaGVycyhyZWN1cnNpdmVTZWFyY2hEaXJzLCB0cnVlKTtcclxuICAgICAgeWllbGQqIHNldHVwV2F0Y2hlcnMoZmxhdFNlYXJjaERpcnMsIGZhbHNlKTtcclxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgbG9nZ2VyLmxvZyhlcnIpO1xyXG4gICAgICBsb2dnZXIubG9nKGVyci5zdGFjayk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbXB1dGVSYXRpbyhmaWxlUGF0aCkge1xyXG4gICAgbGV0IHJhdGlvID0gMTtcclxuICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChleHQgIT09ICcubG5rJyAmJiBleHQgIT09ICcuZXhlJylcclxuICAgICAgcmF0aW8gKj0gMC41O1xyXG4gICAgaWYgKGJhc2VuYW1lLmluZGV4T2YoJ3VuaW5zdGFsbCcpID49IDAgfHwgYmFzZW5hbWUuaW5kZXhPZigncmVtb3ZlJykgPj0gMClcclxuICAgICAgcmF0aW8gKj0gMC45O1xyXG4gICAgcmV0dXJuIHJhdGlvO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2VhcmNoKHF1ZXJ5LCByZXMpIHtcclxuICAgIGNvbnN0IHF1ZXJ5X3RyaW0gPSBxdWVyeS5yZXBsYWNlKCcgJywgJycpO1xyXG4gICAgY29uc3Qgc2VhcmNoZWQgPSBtYXRjaHV0aWwuZnV6enkoZGIsIHF1ZXJ5X3RyaW0sICh4KSA9PiB4KTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHNlYXJjaGVkLnNsaWNlKDAsIDEwKS5tYXAoKHgpID0+IHtcclxuICAgICAgY29uc3QgZmlsZVBhdGggPSB4LmVsZW07XHJcbiAgICAgIGNvbnN0IGZpbGVQYXRoX2JvbGQgPSBtYXRjaHV0aWwubWFrZVN0cmluZ0JvbGRIdG1sKGZpbGVQYXRoLCB4Lm1hdGNoZXMpO1xyXG4gICAgICBjb25zdCBmaWxlUGF0aF9iYXNlNjQgPSBuZXcgQnVmZmVyKGZpbGVQYXRoKS50b1N0cmluZygnYmFzZTY0Jyk7XHJcbiAgICAgIGNvbnN0IHNjb3JlID0geC5zY29yZSAqIGNvbXB1dGVSYXRpbyhmaWxlUGF0aCk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgaWQ6IGZpbGVQYXRoLFxyXG4gICAgICAgIHRpdGxlOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoLCBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpKSxcclxuICAgICAgICBkZXNjOiBmaWxlUGF0aF9ib2xkLFxyXG4gICAgICAgIGljb246IGBpY29uOi8vJHtmaWxlUGF0aF9iYXNlNjR9YCxcclxuICAgICAgICBncm91cDogJ0ZpbGVzICYgRm9sZGVycycsXHJcbiAgICAgICAgc2NvcmVcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgcmVzLmFkZChyZXN1bHQpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZXhlY3V0ZShpZCwgcGF5bG9hZCkge1xyXG4gICAgbG9nZ2VyLmxvZyhgJHtpZH0gZXhlY3V0ZWRgKTtcclxuICAgIHNoZWxsLm9wZW5JdGVtKGlkKTtcclxuICAgIGFwcC5jbG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgc3RhcnR1cCwgc2VhcmNoLCBleGVjdXRlIH07XHJcbn07XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
