'use strict';

var _marked = [resolvePackageVersion, resolvePackageData, downloadAndExtractPackage, installPackage].map(regeneratorRuntime.mark);

var _ = require('lodash');
var co = require('co');
var got = require('got');
var semver = require('semver');
var path = require('path');
var fileutil = require('./fileutil');

var REGISTRY_URL = 'https://registry.npmjs.org';

function resolvePackageVersion(packageName, versionRange) {
  var url, res, data, desired, selectedVersion, pkgVersions, pkgVersion;
  return regeneratorRuntime.wrap(function resolvePackageVersion$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          url = REGISTRY_URL + '/' + packageName;
          _context.next = 3;
          return got(url, { json: true });

        case 3:
          res = _context.sent;
          data = res.body;
          desired = versionRange;

          if (!semver.validRange(versionRange) && data['dist-tags']) {
            desired = data['dist-tags'][desired];
          }

          if (semver.validRange(desired)) {
            _context.next = 9;
            break;
          }

          throw 'invalid version';

        case 9:
          selectedVersion = null;
          pkgVersions = data['versions']; // object

          _context.t0 = regeneratorRuntime.keys(pkgVersions);

        case 12:
          if ((_context.t1 = _context.t0()).done) {
            _context.next = 19;
            break;
          }

          pkgVersion = _context.t1.value;

          if (semver.satisfies(pkgVersion, desired)) {
            _context.next = 16;
            break;
          }

          return _context.abrupt('continue', 12);

        case 16:
          if (!selectedVersion || semver.gt(pkgVersion, selectedVersion)) {
            selectedVersion = pkgVersion;
          }
          _context.next = 12;
          break;

        case 19:
          if (selectedVersion) {
            _context.next = 21;
            break;
          }

          throw 'unavailable';

        case 21:
          return _context.abrupt('return', selectedVersion);

        case 22:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function resolvePackageData(packageName, versionRange) {
  var version, url, res, data;
  return regeneratorRuntime.wrap(function resolvePackageData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          return _context2.delegateYield(resolvePackageVersion(packageName, versionRange), 't0', 1);

        case 1:
          version = _context2.t0;
          url = REGISTRY_URL + '/' + packageName + '/' + version;
          _context2.next = 5;
          return got(url, { json: true });

        case 5:
          res = _context2.sent;
          data = res.body;
          return _context2.abrupt('return', data);

        case 8:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

function downloadAndExtractPackage(packageName, versionRange, destDir, tempDir) {
  var data, distUrl, filename, downloadPath, tempPackageDir;
  return regeneratorRuntime.wrap(function downloadAndExtractPackage$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.delegateYield(resolvePackageData(packageName, versionRange), 't0', 1);

        case 1:
          data = _context3.t0;
          distUrl = data.dist.tarball;
          filename = distUrl.split('/').pop();
          downloadPath = path.join(tempDir, filename);
          tempPackageDir = path.join(tempDir, 'package');
          _context3.next = 8;
          return fileutil.downloadFile(distUrl, downloadPath);

        case 8:
          _context3.next = 10;
          return fileutil.extractTarball(downloadPath, tempDir);

        case 10:
          _context3.next = 12;
          return fileutil.move(tempPackageDir, destDir);

        case 12:
          _context3.next = 14;
          return fileutil.remove(downloadPath);

        case 14:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this);
}

function installPackage(packageName, versionRange, destDir, tempDir) {
  var data, deps, incompleteDir, modulePath, gens, depName, depVersion, depDir, _tempDir;

  return regeneratorRuntime.wrap(function installPackage$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          return _context4.delegateYield(resolvePackageData(packageName, versionRange), 't0', 1);

        case 1:
          data = _context4.t0;
          deps = [];
          incompleteDir = path.join(tempDir, '__incomplete__');
          _context4.next = 6;
          return fileutil.ensureDir(tempDir);

        case 6:
          _context4.next = 8;
          return fileutil.ensureDir(incompleteDir);

        case 8:
          _context4.prev = 8;
          return _context4.delegateYield(downloadAndExtractPackage(packageName, versionRange, incompleteDir, tempDir), 't1', 10);

        case 10:
          if (!(data.dependencies && _.size(data.dependencies) > 0)) {
            _context4.next = 28;
            break;
          }

          modulePath = path.join(incompleteDir, 'node_modules');
          _context4.next = 14;
          return fileutil.ensureDir(modulePath);

        case 14:
          gens = [];
          _context4.t2 = regeneratorRuntime.keys(data.dependencies);

        case 16:
          if ((_context4.t3 = _context4.t2()).done) {
            _context4.next = 26;
            break;
          }

          depName = _context4.t3.value;
          depVersion = data.dependencies[depName];
          depDir = path.join(modulePath, depName);
          _tempDir = path.join(tempDir, depDir);
          _context4.next = 23;
          return fileutil.ensureDir(_tempDir);

        case 23:
          gens.push(co(installPackage(depName, depVersion, depDir, _tempDir)));
          _context4.next = 16;
          break;

        case 26:
          _context4.next = 28;
          return gens;

        case 28:
          _context4.next = 32;
          break;

        case 30:
          _context4.prev = 30;
          _context4.t4 = _context4['catch'](8);

        case 32:
          _context4.next = 34;
          return fileutil.move(incompleteDir, destDir);

        case 34:
          _context4.next = 36;
          return fileutil.remove(tempDir);

        case 36:
          return _context4.abrupt('return', data);

        case 37:
        case 'end':
          return _context4.stop();
      }
    }
  }, _marked[3], this, [[8, 30]]);
}

module.exports = {
  installPackage: co.wrap(installPackage)
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbnMvaGFpbi1wYWNrYWdlLW1hbmFnZXIvcGFja2FnZS1jb250cm9sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztlQVdVLHVCQThCQSxvQkFTQSwyQkFlQTs7QUEvRFYsSUFBTSxJQUFJLFFBQVEsUUFBUixDQUFKO0FBQ04sSUFBTSxLQUFLLFFBQVEsSUFBUixDQUFMO0FBQ04sSUFBTSxNQUFNLFFBQVEsS0FBUixDQUFOO0FBQ04sSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFUO0FBQ04sSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFQO0FBQ04sSUFBTSxXQUFXLFFBQVEsWUFBUixDQUFYOztBQUVOLElBQU0sZUFBZSw0QkFBZjs7QUFFTixTQUFVLHFCQUFWLENBQWdDLFdBQWhDLEVBQTZDLFlBQTdDO01BQ1EsS0FDQSxLQUNBLE1BRUYsU0FRQSxpQkFDRSxhQUNLOzs7OztBQWRMLGdCQUFTLHFCQUFnQjs7aUJBQ2IsSUFBSSxHQUFKLEVBQVMsRUFBRSxNQUFNLElBQU4sRUFBWDs7O0FBQVo7QUFDQSxpQkFBTyxJQUFJLElBQUo7QUFFVCxvQkFBVTs7QUFDZCxjQUFJLENBQUMsT0FBTyxVQUFQLENBQWtCLFlBQWxCLENBQUQsSUFBb0MsS0FBSyxXQUFMLENBQXBDLEVBQXVEO0FBQ3pELHNCQUFVLEtBQUssV0FBTCxFQUFrQixPQUFsQixDQUFWLENBRHlEO1dBQTNEOztjQUdLLE9BQU8sVUFBUCxDQUFrQixPQUFsQjs7Ozs7Z0JBQ0c7OztBQUdKLDRCQUFrQjtBQUNoQix3QkFBYyxLQUFLLFVBQUw7O2dEQUNLOzs7Ozs7OztBQUFkOztjQUNKLE9BQU8sU0FBUCxDQUFpQixVQUFqQixFQUE2QixPQUE3Qjs7Ozs7Ozs7QUFHTCxjQUFJLENBQUMsZUFBRCxJQUFvQixPQUFPLEVBQVAsQ0FBVSxVQUFWLEVBQXNCLGVBQXRCLENBQXBCLEVBQTREO0FBQzlELDhCQUFrQixVQUFsQixDQUQ4RDtXQUFoRTs7Ozs7Y0FLRzs7Ozs7Z0JBQ0c7OzsyQ0FFRDs7Ozs7Ozs7Q0EzQlQ7O0FBOEJBLFNBQVUsa0JBQVYsQ0FBNkIsV0FBN0IsRUFBMEMsWUFBMUM7TUFDUSxTQUNBLEtBRUEsS0FDQTs7Ozs7eUNBSmlCLHNCQUFzQixXQUF0QixFQUFtQyxZQUFuQzs7O0FBQWpCO0FBQ0EsZ0JBQVMscUJBQWdCLG9CQUFlOztpQkFFNUIsSUFBSSxHQUFKLEVBQVMsRUFBRSxNQUFNLElBQU4sRUFBWDs7O0FBQVo7QUFDQSxpQkFBTyxJQUFJLElBQUo7NENBQ047Ozs7Ozs7O0NBTlQ7O0FBU0EsU0FBVSx5QkFBVixDQUFvQyxXQUFwQyxFQUFpRCxZQUFqRCxFQUErRCxPQUEvRCxFQUF3RSxPQUF4RTtNQUNRLE1BQ0EsU0FFQSxVQUNBLGNBQ0E7Ozs7O3lDQUxjLG1CQUFtQixXQUFuQixFQUFnQyxZQUFoQzs7O0FBQWQ7QUFDQSxvQkFBVSxLQUFLLElBQUwsQ0FBVSxPQUFWO0FBRVYscUJBQVcsUUFBUSxLQUFSLENBQWMsR0FBZCxFQUFtQixHQUFuQjtBQUNYLHlCQUFlLEtBQUssSUFBTCxDQUFVLE9BQVYsRUFBbUIsUUFBbkI7QUFDZiwyQkFBaUIsS0FBSyxJQUFMLENBQVUsT0FBVixFQUFtQixTQUFuQjs7aUJBRWpCLFNBQVMsWUFBVCxDQUFzQixPQUF0QixFQUErQixZQUEvQjs7OztpQkFDQSxTQUFTLGNBQVQsQ0FBd0IsWUFBeEIsRUFBc0MsT0FBdEM7Ozs7aUJBQ0EsU0FBUyxJQUFULENBQWMsY0FBZCxFQUE4QixPQUE5Qjs7OztpQkFFQSxTQUFTLE1BQVQsQ0FBZ0IsWUFBaEI7Ozs7Ozs7O0NBWlI7O0FBZUEsU0FBVSxjQUFWLENBQXlCLFdBQXpCLEVBQXNDLFlBQXRDLEVBQW9ELE9BQXBELEVBQTZELE9BQTdEO01BQ1EsTUFDQSxNQUVBLGVBU0ksWUFHQSxNQUNLLFNBQ0gsWUFDQSxRQUNBOzs7Ozs7eUNBbkJRLG1CQUFtQixXQUFuQixFQUFnQyxZQUFoQzs7O0FBQWQ7QUFDQSxpQkFBTztBQUVQLDBCQUFnQixLQUFLLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGdCQUFuQjs7aUJBRWhCLFNBQVMsU0FBVCxDQUFtQixPQUFuQjs7OztpQkFDQSxTQUFTLFNBQVQsQ0FBbUIsYUFBbkI7Ozs7eUNBR0csMEJBQTBCLFdBQTFCLEVBQXVDLFlBQXZDLEVBQXFELGFBQXJELEVBQW9FLE9BQXBFOzs7Z0JBRUgsS0FBSyxZQUFMLElBQXNCLEVBQUUsSUFBRixDQUFPLEtBQUssWUFBTCxDQUFQLEdBQTRCLENBQTVCOzs7OztBQUNsQix1QkFBYSxLQUFLLElBQUwsQ0FBVSxhQUFWLEVBQXlCLGNBQXpCOztpQkFDYixTQUFTLFNBQVQsQ0FBbUIsVUFBbkI7OztBQUVBLGlCQUFPO2lEQUNTLEtBQUssWUFBTDs7Ozs7Ozs7QUFBWDtBQUNILHVCQUFhLEtBQUssWUFBTCxDQUFrQixPQUFsQjtBQUNiLG1CQUFTLEtBQUssSUFBTCxDQUFVLFVBQVYsRUFBc0IsT0FBdEI7QUFDVCxxQkFBVyxLQUFLLElBQUwsQ0FBVSxPQUFWLEVBQW1CLE1BQW5COztpQkFDWCxTQUFTLFNBQVQsQ0FBbUIsUUFBbkI7OztBQUNOLGVBQUssSUFBTCxDQUFVLEdBQUcsZUFBZSxPQUFmLEVBQXdCLFVBQXhCLEVBQW9DLE1BQXBDLEVBQTRDLFFBQTVDLENBQUgsQ0FBVjs7Ozs7O2lCQUVJOzs7Ozs7Ozs7Ozs7aUJBS0osU0FBUyxJQUFULENBQWMsYUFBZCxFQUE2QixPQUE3Qjs7OztpQkFDQSxTQUFTLE1BQVQsQ0FBZ0IsT0FBaEI7Ozs0Q0FDQzs7Ozs7Ozs7Q0EvQlQ7O0FBa0NBLE9BQU8sT0FBUCxHQUFpQjtBQUNmLGtCQUFnQixHQUFHLElBQUgsQ0FBUSxjQUFSLENBQWhCO0NBREYiLCJmaWxlIjoicGx1Z2lucy9oYWluLXBhY2thZ2UtbWFuYWdlci9wYWNrYWdlLWNvbnRyb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcbmNvbnN0IGNvID0gcmVxdWlyZSgnY28nKTtcclxuY29uc3QgZ290ID0gcmVxdWlyZSgnZ290Jyk7XHJcbmNvbnN0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xyXG5jb25zdCBmaWxldXRpbCA9IHJlcXVpcmUoJy4vZmlsZXV0aWwnKTtcclxuXHJcbmNvbnN0IFJFR0lTVFJZX1VSTCA9ICdodHRwczovL3JlZ2lzdHJ5Lm5wbWpzLm9yZyc7XHJcblxyXG5mdW5jdGlvbiogcmVzb2x2ZVBhY2thZ2VWZXJzaW9uKHBhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UpIHtcclxuICBjb25zdCB1cmwgPSBgJHtSRUdJU1RSWV9VUkx9LyR7cGFja2FnZU5hbWV9YDtcclxuICBjb25zdCByZXMgPSB5aWVsZCBnb3QodXJsLCB7IGpzb246IHRydWUgfSk7XHJcbiAgY29uc3QgZGF0YSA9IHJlcy5ib2R5O1xyXG5cclxuICBsZXQgZGVzaXJlZCA9IHZlcnNpb25SYW5nZTtcclxuICBpZiAoIXNlbXZlci52YWxpZFJhbmdlKHZlcnNpb25SYW5nZSkgJiYgZGF0YVsnZGlzdC10YWdzJ10pIHtcclxuICAgIGRlc2lyZWQgPSBkYXRhWydkaXN0LXRhZ3MnXVtkZXNpcmVkXTtcclxuICB9XHJcbiAgaWYgKCFzZW12ZXIudmFsaWRSYW5nZShkZXNpcmVkKSkge1xyXG4gICAgdGhyb3cgJ2ludmFsaWQgdmVyc2lvbic7XHJcbiAgfVxyXG5cclxuICBsZXQgc2VsZWN0ZWRWZXJzaW9uID0gbnVsbDtcclxuICBjb25zdCBwa2dWZXJzaW9ucyA9IGRhdGFbJ3ZlcnNpb25zJ107IC8vIG9iamVjdFxyXG4gIGZvciAoY29uc3QgcGtnVmVyc2lvbiBpbiBwa2dWZXJzaW9ucykge1xyXG4gICAgaWYgKCFzZW12ZXIuc2F0aXNmaWVzKHBrZ1ZlcnNpb24sIGRlc2lyZWQpKSB7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKCFzZWxlY3RlZFZlcnNpb24gfHwgc2VtdmVyLmd0KHBrZ1ZlcnNpb24sIHNlbGVjdGVkVmVyc2lvbikpIHtcclxuICAgICAgc2VsZWN0ZWRWZXJzaW9uID0gcGtnVmVyc2lvbjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICghc2VsZWN0ZWRWZXJzaW9uKSB7XHJcbiAgICB0aHJvdyAndW5hdmFpbGFibGUnO1xyXG4gIH1cclxuICByZXR1cm4gc2VsZWN0ZWRWZXJzaW9uO1xyXG59XHJcblxyXG5mdW5jdGlvbiogcmVzb2x2ZVBhY2thZ2VEYXRhKHBhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UpIHtcclxuICBjb25zdCB2ZXJzaW9uID0geWllbGQqIHJlc29sdmVQYWNrYWdlVmVyc2lvbihwYWNrYWdlTmFtZSwgdmVyc2lvblJhbmdlKTtcclxuICBjb25zdCB1cmwgPSBgJHtSRUdJU1RSWV9VUkx9LyR7cGFja2FnZU5hbWV9LyR7dmVyc2lvbn1gO1xyXG5cclxuICBjb25zdCByZXMgPSB5aWVsZCBnb3QodXJsLCB7IGpzb246IHRydWUgfSk7XHJcbiAgY29uc3QgZGF0YSA9IHJlcy5ib2R5O1xyXG4gIHJldHVybiBkYXRhO1xyXG59XHJcblxyXG5mdW5jdGlvbiogZG93bmxvYWRBbmRFeHRyYWN0UGFja2FnZShwYWNrYWdlTmFtZSwgdmVyc2lvblJhbmdlLCBkZXN0RGlyLCB0ZW1wRGlyKSB7XHJcbiAgY29uc3QgZGF0YSA9IHlpZWxkKiByZXNvbHZlUGFja2FnZURhdGEocGFja2FnZU5hbWUsIHZlcnNpb25SYW5nZSk7XHJcbiAgY29uc3QgZGlzdFVybCA9IGRhdGEuZGlzdC50YXJiYWxsO1xyXG5cclxuICBjb25zdCBmaWxlbmFtZSA9IGRpc3RVcmwuc3BsaXQoJy8nKS5wb3AoKTtcclxuICBjb25zdCBkb3dubG9hZFBhdGggPSBwYXRoLmpvaW4odGVtcERpciwgZmlsZW5hbWUpO1xyXG4gIGNvbnN0IHRlbXBQYWNrYWdlRGlyID0gcGF0aC5qb2luKHRlbXBEaXIsICdwYWNrYWdlJyk7XHJcblxyXG4gIHlpZWxkIGZpbGV1dGlsLmRvd25sb2FkRmlsZShkaXN0VXJsLCBkb3dubG9hZFBhdGgpO1xyXG4gIHlpZWxkIGZpbGV1dGlsLmV4dHJhY3RUYXJiYWxsKGRvd25sb2FkUGF0aCwgdGVtcERpcik7XHJcbiAgeWllbGQgZmlsZXV0aWwubW92ZSh0ZW1wUGFja2FnZURpciwgZGVzdERpcik7XHJcblxyXG4gIHlpZWxkIGZpbGV1dGlsLnJlbW92ZShkb3dubG9hZFBhdGgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiogaW5zdGFsbFBhY2thZ2UocGFja2FnZU5hbWUsIHZlcnNpb25SYW5nZSwgZGVzdERpciwgdGVtcERpcikge1xyXG4gIGNvbnN0IGRhdGEgPSB5aWVsZCogcmVzb2x2ZVBhY2thZ2VEYXRhKHBhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UpO1xyXG4gIGNvbnN0IGRlcHMgPSBbXTtcclxuXHJcbiAgY29uc3QgaW5jb21wbGV0ZURpciA9IHBhdGguam9pbih0ZW1wRGlyLCAnX19pbmNvbXBsZXRlX18nKTtcclxuXHJcbiAgeWllbGQgZmlsZXV0aWwuZW5zdXJlRGlyKHRlbXBEaXIpO1xyXG4gIHlpZWxkIGZpbGV1dGlsLmVuc3VyZURpcihpbmNvbXBsZXRlRGlyKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIHlpZWxkKiBkb3dubG9hZEFuZEV4dHJhY3RQYWNrYWdlKHBhY2thZ2VOYW1lLCB2ZXJzaW9uUmFuZ2UsIGluY29tcGxldGVEaXIsIHRlbXBEaXIpO1xyXG5cclxuICAgIGlmIChkYXRhLmRlcGVuZGVuY2llcyAmJiAoXy5zaXplKGRhdGEuZGVwZW5kZW5jaWVzKSA+IDApKSB7XHJcbiAgICAgIGNvbnN0IG1vZHVsZVBhdGggPSBwYXRoLmpvaW4oaW5jb21wbGV0ZURpciwgJ25vZGVfbW9kdWxlcycpO1xyXG4gICAgICB5aWVsZCBmaWxldXRpbC5lbnN1cmVEaXIobW9kdWxlUGF0aCk7XHJcblxyXG4gICAgICBjb25zdCBnZW5zID0gW107XHJcbiAgICAgIGZvciAoY29uc3QgZGVwTmFtZSBpbiBkYXRhLmRlcGVuZGVuY2llcykge1xyXG4gICAgICAgIGNvbnN0IGRlcFZlcnNpb24gPSBkYXRhLmRlcGVuZGVuY2llc1tkZXBOYW1lXTtcclxuICAgICAgICBjb25zdCBkZXBEaXIgPSBwYXRoLmpvaW4obW9kdWxlUGF0aCwgZGVwTmFtZSk7XHJcbiAgICAgICAgY29uc3QgX3RlbXBEaXIgPSBwYXRoLmpvaW4odGVtcERpciwgZGVwRGlyKTtcclxuICAgICAgICB5aWVsZCBmaWxldXRpbC5lbnN1cmVEaXIoX3RlbXBEaXIpO1xyXG4gICAgICAgIGdlbnMucHVzaChjbyhpbnN0YWxsUGFja2FnZShkZXBOYW1lLCBkZXBWZXJzaW9uLCBkZXBEaXIsIF90ZW1wRGlyKSkpO1xyXG4gICAgICB9XHJcbiAgICAgIHlpZWxkIGdlbnM7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gIH1cclxuXHJcbiAgeWllbGQgZmlsZXV0aWwubW92ZShpbmNvbXBsZXRlRGlyLCBkZXN0RGlyKTtcclxuICB5aWVsZCBmaWxldXRpbC5yZW1vdmUodGVtcERpcik7XHJcbiAgcmV0dXJuIGRhdGE7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGluc3RhbGxQYWNrYWdlOiBjby53cmFwKGluc3RhbGxQYWNrYWdlKVxyXG59O1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
