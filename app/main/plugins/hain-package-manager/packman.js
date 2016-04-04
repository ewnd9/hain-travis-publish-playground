'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var co = require('co');
var path = require('path');
var packageControl = require('./package-control');
var fileutil = require('./fileutil');

function _createPackegeInfo(name, data) {
  return {
    name: name,
    version: data.version || 'none',
    desc: data.description || '',
    author: data.author || '',
    homepage: data.homepage || ''
  };
}

var Packman = function () {
  function Packman(repoDir, tempDir) {
    _classCallCheck(this, Packman);

    this.repoDir = repoDir;
    this.tempDir = tempDir;
    this.packages = [];
  }

  _createClass(Packman, [{
    key: 'readPackages',
    value: function readPackages() {
      var self = this;
      this.packages = [];
      return co(regeneratorRuntime.mark(function _callee() {
        var packageDirs, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _packageDir, packageJsonFile, fileContents, pkgJson, pkgInfo;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fileutil.ensureDir(self.repoDir);

              case 2:
                _context.next = 4;
                return fileutil.readdir(self.repoDir);

              case 4:
                packageDirs = _context.sent;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 8;
                _iterator = packageDirs[Symbol.iterator]();

              case 10:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 29;
                  break;
                }

                _packageDir = _step.value;
                packageJsonFile = path.join(self.repoDir, _packageDir, 'package.json');
                _context.prev = 13;
                _context.next = 16;
                return fileutil.readFile(packageJsonFile);

              case 16:
                fileContents = _context.sent;
                pkgJson = JSON.parse(fileContents.toString());
                pkgInfo = _createPackegeInfo(_packageDir, pkgJson);

                self.packages.push(pkgInfo);
                _context.next = 26;
                break;

              case 22:
                _context.prev = 22;
                _context.t0 = _context['catch'](13);

                console.log(_context.t0);
                return _context.abrupt('continue', 26);

              case 26:
                _iteratorNormalCompletion = true;
                _context.next = 10;
                break;

              case 29:
                _context.next = 35;
                break;

              case 31:
                _context.prev = 31;
                _context.t1 = _context['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context.t1;

              case 35:
                _context.prev = 35;
                _context.prev = 36;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 38:
                _context.prev = 38;

                if (!_didIteratorError) {
                  _context.next = 41;
                  break;
                }

                throw _iteratorError;

              case 41:
                return _context.finish(38);

              case 42:
                return _context.finish(35);

              case 43:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 31, 35, 43], [13, 22], [36,, 38, 42]]);
      }));
    }
  }, {
    key: 'listPackages',
    value: function listPackages() {
      return this.packages;
    }
  }, {
    key: 'hasPackage',
    value: function hasPackage(packageName) {
      return _.findIndex(this.packages, function (x) {
        return x.name === packageName;
      }) >= 0;
    }
  }, {
    key: 'installPackage',
    value: function installPackage(packageName, versionRange) {
      var self = this;
      return co(regeneratorRuntime.mark(function _callee2() {
        var saveDir, data;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!self.hasPackage(packageName)) {
                  _context2.next = 2;
                  break;
                }

                throw 'Installed package: ' + packageName;

              case 2:
                saveDir = path.join(self.repoDir, packageName);
                _context2.next = 5;
                return packageControl.installPackage(packageName, versionRange, saveDir, self.tempDir);

              case 5:
                data = _context2.sent;

                self.packages.push(_createPackegeInfo(packageName, data));

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
    }
  }, {
    key: 'removePackage',
    value: function removePackage(packageName) {
      var self = this;
      return co(regeneratorRuntime.mark(function _callee3() {
        var saveDir;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (self.hasPackage(packageName)) {
                  _context3.next = 2;
                  break;
                }

                throw 'Can\'t find a package: ' + packageName;

              case 2:
                saveDir = path.join(self.repoDir, packageName);
                _context3.next = 5;
                return fileutil.remove(saveDir);

              case 5:
                _.remove(self.packages, function (x) {
                  return x.name === packageName;
                });

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
    }
  }]);

  return Packman;
}();

module.exports = Packman;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbnMvaGFpbi1wYWNrYWdlLW1hbmFnZXIvcGFja21hbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FBRUEsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFKO0FBQ04sSUFBTSxLQUFLLFFBQVEsSUFBUixDQUFMO0FBQ04sSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFQO0FBQ04sSUFBTSxpQkFBaUIsUUFBUSxtQkFBUixDQUFqQjtBQUNOLElBQU0sV0FBVyxRQUFRLFlBQVIsQ0FBWDs7QUFFTixTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBQXdDO0FBQ3RDLFNBQU87QUFDTCxjQURLO0FBRUwsYUFBUyxLQUFLLE9BQUwsSUFBZ0IsTUFBaEI7QUFDVCxVQUFNLEtBQUssV0FBTCxJQUFvQixFQUFwQjtBQUNOLFlBQVEsS0FBSyxNQUFMLElBQWUsRUFBZjtBQUNSLGNBQVUsS0FBSyxRQUFMLElBQWlCLEVBQWpCO0dBTFosQ0FEc0M7Q0FBeEM7O0lBVU07QUFFSixXQUZJLE9BRUosQ0FBWSxPQUFaLEVBQXFCLE9BQXJCLEVBQThCOzBCQUYxQixTQUUwQjs7QUFDNUIsU0FBSyxPQUFMLEdBQWUsT0FBZixDQUQ0QjtBQUU1QixTQUFLLE9BQUwsR0FBZSxPQUFmLENBRjRCO0FBRzVCLFNBQUssUUFBTCxHQUFnQixFQUFoQixDQUg0QjtHQUE5Qjs7ZUFGSTs7bUNBUVc7QUFDYixVQUFNLE9BQU8sSUFBUCxDQURPO0FBRWIsV0FBSyxRQUFMLEdBQWdCLEVBQWhCLENBRmE7QUFHYixhQUFPLDJCQUFHO1lBRUYsNkZBQ0ssYUFDSCxpQkFFRSxjQUNBLFNBQ0E7Ozs7Ozs7dUJBUEosU0FBUyxTQUFULENBQW1CLEtBQUssT0FBTDs7Ozt1QkFDQyxTQUFTLE9BQVQsQ0FBaUIsS0FBSyxPQUFMOzs7QUFBckM7Ozs7OzRCQUNvQjs7Ozs7Ozs7QUFBZjtBQUNILGtDQUFrQixLQUFLLElBQUwsQ0FBVSxLQUFLLE9BQUwsRUFBYyxXQUF4QixFQUFxQyxjQUFyQzs7O3VCQUVLLFNBQVMsUUFBVCxDQUFrQixlQUFsQjs7O0FBQXJCO0FBQ0EsMEJBQVUsS0FBSyxLQUFMLENBQVcsYUFBYSxRQUFiLEVBQVg7QUFDViwwQkFBVSxtQkFBbUIsV0FBbkIsRUFBZ0MsT0FBaEM7O0FBQ2hCLHFCQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLE9BQW5COzs7Ozs7OztBQUVBLHdCQUFRLEdBQVI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQVhJLENBQUgsQ0FBUCxDQUhhOzs7O21DQXFCQTtBQUNiLGFBQU8sS0FBSyxRQUFMLENBRE07Ozs7K0JBSUosYUFBYTtBQUN0QixhQUFRLEVBQUUsU0FBRixDQUFZLEtBQUssUUFBTCxFQUFlO2VBQUssRUFBRSxJQUFGLEtBQVcsV0FBWDtPQUFMLENBQTNCLElBQTJELENBQTNELENBRGM7Ozs7bUNBSVQsYUFBYSxjQUFjO0FBQ3hDLFVBQU0sT0FBTyxJQUFQLENBRGtDO0FBRXhDLGFBQU8sMkJBQUc7WUFJRixTQUNBOzs7OztxQkFKRixLQUFLLFVBQUwsQ0FBZ0IsV0FBaEI7Ozs7OzhDQUMwQjs7O0FBRXhCLDBCQUFVLEtBQUssSUFBTCxDQUFVLEtBQUssT0FBTCxFQUFjLFdBQXhCOzt1QkFDRyxlQUFlLGNBQWYsQ0FBOEIsV0FBOUIsRUFBMkMsWUFBM0MsRUFBeUQsT0FBekQsRUFBa0UsS0FBSyxPQUFMOzs7QUFBL0U7O0FBQ04scUJBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsbUJBQW1CLFdBQW5CLEVBQWdDLElBQWhDLENBQW5COzs7Ozs7OztPQU5RLENBQUgsQ0FBUCxDQUZ3Qzs7OztrQ0FZNUIsYUFBYTtBQUN6QixVQUFNLE9BQU8sSUFBUCxDQURtQjtBQUV6QixhQUFPLDJCQUFHO1lBSUY7Ozs7O29CQUhELEtBQUssVUFBTCxDQUFnQixXQUFoQjs7Ozs7a0RBQzRCOzs7QUFFM0IsMEJBQVUsS0FBSyxJQUFMLENBQVUsS0FBSyxPQUFMLEVBQWMsV0FBeEI7O3VCQUNWLFNBQVMsTUFBVCxDQUFnQixPQUFoQjs7O0FBQ04sa0JBQUUsTUFBRixDQUFTLEtBQUssUUFBTCxFQUFlO3lCQUFLLEVBQUUsSUFBRixLQUFXLFdBQVg7aUJBQUwsQ0FBeEI7Ozs7Ozs7O09BTlEsQ0FBSCxDQUFQLENBRnlCOzs7O1NBakR2Qjs7O0FBK0ROLE9BQU8sT0FBUCxHQUFpQixPQUFqQiIsImZpbGUiOiJwbHVnaW5zL2hhaW4tcGFja2FnZS1tYW5hZ2VyL3BhY2ttYW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcbmNvbnN0IGNvID0gcmVxdWlyZSgnY28nKTtcclxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcclxuY29uc3QgcGFja2FnZUNvbnRyb2wgPSByZXF1aXJlKCcuL3BhY2thZ2UtY29udHJvbCcpO1xyXG5jb25zdCBmaWxldXRpbCA9IHJlcXVpcmUoJy4vZmlsZXV0aWwnKTtcclxuXHJcbmZ1bmN0aW9uIF9jcmVhdGVQYWNrZWdlSW5mbyhuYW1lLCBkYXRhKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWUsXHJcbiAgICB2ZXJzaW9uOiBkYXRhLnZlcnNpb24gfHwgJ25vbmUnLFxyXG4gICAgZGVzYzogZGF0YS5kZXNjcmlwdGlvbiB8fCAnJyxcclxuICAgIGF1dGhvcjogZGF0YS5hdXRob3IgfHwgJycsXHJcbiAgICBob21lcGFnZTogZGF0YS5ob21lcGFnZSB8fCAnJ1xyXG4gIH07XHJcbn1cclxuXHJcbmNsYXNzIFBhY2ttYW4ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihyZXBvRGlyLCB0ZW1wRGlyKSB7XHJcbiAgICB0aGlzLnJlcG9EaXIgPSByZXBvRGlyO1xyXG4gICAgdGhpcy50ZW1wRGlyID0gdGVtcERpcjtcclxuICAgIHRoaXMucGFja2FnZXMgPSBbXTtcclxuICB9XHJcblxyXG4gIHJlYWRQYWNrYWdlcygpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5wYWNrYWdlcyA9IFtdO1xyXG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgIHlpZWxkIGZpbGV1dGlsLmVuc3VyZURpcihzZWxmLnJlcG9EaXIpO1xyXG4gICAgICBjb25zdCBwYWNrYWdlRGlycyA9IHlpZWxkIGZpbGV1dGlsLnJlYWRkaXIoc2VsZi5yZXBvRGlyKTtcclxuICAgICAgZm9yIChjb25zdCBfcGFja2FnZURpciBvZiBwYWNrYWdlRGlycykge1xyXG4gICAgICAgIGNvbnN0IHBhY2thZ2VKc29uRmlsZSA9IHBhdGguam9pbihzZWxmLnJlcG9EaXIsIF9wYWNrYWdlRGlyLCAncGFja2FnZS5qc29uJyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IHlpZWxkIGZpbGV1dGlsLnJlYWRGaWxlKHBhY2thZ2VKc29uRmlsZSk7XHJcbiAgICAgICAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShmaWxlQ29udGVudHMudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICBjb25zdCBwa2dJbmZvID0gX2NyZWF0ZVBhY2tlZ2VJbmZvKF9wYWNrYWdlRGlyLCBwa2dKc29uKTtcclxuICAgICAgICAgIHNlbGYucGFja2FnZXMucHVzaChwa2dJbmZvKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBsaXN0UGFja2FnZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wYWNrYWdlcztcclxuICB9XHJcblxyXG4gIGhhc1BhY2thZ2UocGFja2FnZU5hbWUpIHtcclxuICAgIHJldHVybiAoXy5maW5kSW5kZXgodGhpcy5wYWNrYWdlcywgeCA9PiB4Lm5hbWUgPT09IHBhY2thZ2VOYW1lKSA+PSAwKTtcclxuICB9XHJcblxyXG4gIGluc3RhbGxQYWNrYWdlKHBhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgIGlmIChzZWxmLmhhc1BhY2thZ2UocGFja2FnZU5hbWUpKSB7XHJcbiAgICAgICAgdGhyb3cgYEluc3RhbGxlZCBwYWNrYWdlOiAke3BhY2thZ2VOYW1lfWA7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgc2F2ZURpciA9IHBhdGguam9pbihzZWxmLnJlcG9EaXIsIHBhY2thZ2VOYW1lKTtcclxuICAgICAgY29uc3QgZGF0YSA9IHlpZWxkIHBhY2thZ2VDb250cm9sLmluc3RhbGxQYWNrYWdlKHBhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UsIHNhdmVEaXIsIHNlbGYudGVtcERpcik7XHJcbiAgICAgIHNlbGYucGFja2FnZXMucHVzaChfY3JlYXRlUGFja2VnZUluZm8ocGFja2FnZU5hbWUsIGRhdGEpKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmVtb3ZlUGFja2FnZShwYWNrYWdlTmFtZSkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICByZXR1cm4gY28oZnVuY3Rpb24qICgpIHtcclxuICAgICAgaWYgKCFzZWxmLmhhc1BhY2thZ2UocGFja2FnZU5hbWUpKSB7XHJcbiAgICAgICAgdGhyb3cgYENhbid0IGZpbmQgYSBwYWNrYWdlOiAke3BhY2thZ2VOYW1lfWA7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgc2F2ZURpciA9IHBhdGguam9pbihzZWxmLnJlcG9EaXIsIHBhY2thZ2VOYW1lKTtcclxuICAgICAgeWllbGQgZmlsZXV0aWwucmVtb3ZlKHNhdmVEaXIpO1xyXG4gICAgICBfLnJlbW92ZShzZWxmLnBhY2thZ2VzLCB4ID0+IHgubmFtZSA9PT0gcGFja2FnZU5hbWUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYWNrbWFuO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
