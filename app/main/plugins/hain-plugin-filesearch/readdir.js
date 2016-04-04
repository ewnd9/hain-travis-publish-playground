'use strict';

var _marked = [readdir].map(regeneratorRuntime.mark);

var fs = require('original-fs');
var path = require('path');

function _readdir(dirPath) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dirPath, function (err, files) {
      if (err) {
        return reject(err);
      }
      return resolve(files);
    });
  });
}

function _stat(filePath) {
  return new Promise(function (resolve, reject) {
    fs.stat(filePath, function (err, stats) {
      if (err) {
        return reject(err);
      }
      return resolve(stats);
    });
  });
}

function _realpath(filePath) {
  return new Promise(function (resolve, reject) {
    fs.realpath(filePath, function (err, _path) {
      if (err) {
        return reject(err);
      }
      return resolve(_path);
    });
  });
}

function readdir(dirPath, recursive, matcher) {
  var list, pendingDirs, scannedDirs, dir, realdir, files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, _path, stat;

  return regeneratorRuntime.wrap(function readdir$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          list = [];
          pendingDirs = [dirPath];
          scannedDirs = {};

        case 3:
          if (!(pendingDirs.length > 0)) {
            _context.next = 57;
            break;
          }

          dir = pendingDirs.shift();
          _context.next = 7;
          return _realpath(dir);

        case 7:
          realdir = _context.sent;
          files = [];

          if (!scannedDirs[realdir]) {
            _context.next = 11;
            break;
          }

          return _context.abrupt('continue', 3);

        case 11:
          scannedDirs[realdir] = true;

          _context.prev = 12;
          _context.next = 15;
          return _readdir(realdir);

        case 15:
          files = _context.sent;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 19;
          _iterator = files[Symbol.iterator]();

        case 21:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 37;
            break;
          }

          file = _step.value;
          _path = path.join(realdir, file);
          _context.prev = 24;
          _context.next = 27;
          return _stat(_path);

        case 27:
          stat = _context.sent;

          if (matcher(_path, stat)) {
            list.push(_path);
          }
          if (stat.isDirectory() && recursive) {
            pendingDirs.push(_path);
          }
          _context.next = 34;
          break;

        case 32:
          _context.prev = 32;
          _context.t0 = _context['catch'](24);

        case 34:
          _iteratorNormalCompletion = true;
          _context.next = 21;
          break;

        case 37:
          _context.next = 43;
          break;

        case 39:
          _context.prev = 39;
          _context.t1 = _context['catch'](19);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 43:
          _context.prev = 43;
          _context.prev = 44;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 46:
          _context.prev = 46;

          if (!_didIteratorError) {
            _context.next = 49;
            break;
          }

          throw _iteratorError;

        case 49:
          return _context.finish(46);

        case 50:
          return _context.finish(43);

        case 51:
          _context.next = 55;
          break;

        case 53:
          _context.prev = 53;
          _context.t2 = _context['catch'](12);

        case 55:
          _context.next = 3;
          break;

        case 57:
          return _context.abrupt('return', list);

        case 58:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[12, 53], [19, 39, 43, 51], [24, 32], [44,, 46, 50]]);
}

module.exports = readdir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbnMvaGFpbi1wbHVnaW4tZmlsZXNlYXJjaC9yZWFkZGlyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztlQXNDVTs7QUFwQ1YsSUFBTSxLQUFLLFFBQVEsYUFBUixDQUFMO0FBQ04sSUFBTSxPQUFPLFFBQVEsTUFBUixDQUFQOztBQUVOLFNBQVMsUUFBVCxDQUFrQixPQUFsQixFQUEyQjtBQUN6QixTQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsT0FBRyxPQUFILENBQVcsT0FBWCxFQUFvQixVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWdCO0FBQ2xDLFVBQUksR0FBSixFQUFTO0FBQ1AsZUFBTyxPQUFPLEdBQVAsQ0FBUCxDQURPO09BQVQ7QUFHQSxhQUFPLFFBQVEsS0FBUixDQUFQLENBSmtDO0tBQWhCLENBQXBCLENBRHNDO0dBQXJCLENBQW5CLENBRHlCO0NBQTNCOztBQVdBLFNBQVMsS0FBVCxDQUFlLFFBQWYsRUFBeUI7QUFDdkIsU0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLE9BQUcsSUFBSCxDQUFRLFFBQVIsRUFBa0IsVUFBQyxHQUFELEVBQU0sS0FBTixFQUFnQjtBQUNoQyxVQUFJLEdBQUosRUFBUztBQUNQLGVBQU8sT0FBTyxHQUFQLENBQVAsQ0FETztPQUFUO0FBR0EsYUFBTyxRQUFRLEtBQVIsQ0FBUCxDQUpnQztLQUFoQixDQUFsQixDQURzQztHQUFyQixDQUFuQixDQUR1QjtDQUF6Qjs7QUFXQSxTQUFTLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkI7QUFDM0IsU0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLE9BQUcsUUFBSCxDQUFZLFFBQVosRUFBc0IsVUFBQyxHQUFELEVBQU0sS0FBTixFQUFnQjtBQUNwQyxVQUFJLEdBQUosRUFBUztBQUNQLGVBQU8sT0FBTyxHQUFQLENBQVAsQ0FETztPQUFUO0FBR0EsYUFBTyxRQUFRLEtBQVIsQ0FBUCxDQUpvQztLQUFoQixDQUF0QixDQURzQztHQUFyQixDQUFuQixDQUQyQjtDQUE3Qjs7QUFXQSxTQUFVLE9BQVYsQ0FBa0IsT0FBbEIsRUFBMkIsU0FBM0IsRUFBc0MsT0FBdEM7TUFDUSxNQUNBLGFBQ0EsYUFFRSxLQUNBLFNBQ0YsdUZBU1MsTUFDSCxPQUVFOzs7Ozs7QUFsQlIsaUJBQU87QUFDUCx3QkFBYyxDQUFDLE9BQUQ7QUFDZCx3QkFBYzs7O2dCQUNiLFlBQVksTUFBWixHQUFxQixDQUFyQjs7Ozs7QUFDQyxnQkFBTSxZQUFZLEtBQVo7O2lCQUNVLFVBQVUsR0FBVjs7O0FBQWhCO0FBQ0Ysa0JBQVE7O2VBRVIsWUFBWSxPQUFaOzs7Ozs7OztBQUdKLHNCQUFZLE9BQVosSUFBdUIsSUFBdkI7Ozs7aUJBR2dCLFNBQVMsT0FBVDs7O0FBQWQ7Ozs7O3NCQUNtQjs7Ozs7Ozs7QUFBUjtBQUNILGtCQUFRLEtBQUssSUFBTCxDQUFVLE9BQVYsRUFBbUIsSUFBbkI7OztpQkFFTyxNQUFNLEtBQU47OztBQUFiOztBQUNOLGNBQUksUUFBUSxLQUFSLEVBQWUsSUFBZixDQUFKLEVBQTBCO0FBQ3hCLGlCQUFLLElBQUwsQ0FBVSxLQUFWLEVBRHdCO1dBQTFCO0FBR0EsY0FBSSxLQUFLLFdBQUwsTUFBc0IsU0FBdEIsRUFBaUM7QUFDbkMsd0JBQVksSUFBWixDQUFpQixLQUFqQixFQURtQztXQUFyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJDQU9EOzs7Ozs7OztDQTlCVDs7QUFpQ0EsT0FBTyxPQUFQLEdBQWlCLE9BQWpCIiwiZmlsZSI6InBsdWdpbnMvaGFpbi1wbHVnaW4tZmlsZXNlYXJjaC9yZWFkZGlyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgZnMgPSByZXF1aXJlKCdvcmlnaW5hbC1mcycpO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xyXG5cclxuZnVuY3Rpb24gX3JlYWRkaXIoZGlyUGF0aCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBmcy5yZWFkZGlyKGRpclBhdGgsIChlcnIsIGZpbGVzKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc29sdmUoZmlsZXMpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9zdGF0KGZpbGVQYXRoKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGZzLnN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc29sdmUoc3RhdHMpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFscGF0aChmaWxlUGF0aCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBmcy5yZWFscGF0aChmaWxlUGF0aCwgKGVyciwgX3BhdGgpID0+IHtcclxuICAgICAgaWYgKGVycikge1xyXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzb2x2ZShfcGF0aCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24qIHJlYWRkaXIoZGlyUGF0aCwgcmVjdXJzaXZlLCBtYXRjaGVyKSB7XHJcbiAgY29uc3QgbGlzdCA9IFtdO1xyXG4gIGNvbnN0IHBlbmRpbmdEaXJzID0gW2RpclBhdGhdO1xyXG4gIGNvbnN0IHNjYW5uZWREaXJzID0ge307XHJcbiAgd2hpbGUgKHBlbmRpbmdEaXJzLmxlbmd0aCA+IDApIHtcclxuICAgIGNvbnN0IGRpciA9IHBlbmRpbmdEaXJzLnNoaWZ0KCk7XHJcbiAgICBjb25zdCByZWFsZGlyID0geWllbGQgX3JlYWxwYXRoKGRpcik7XHJcbiAgICBsZXQgZmlsZXMgPSBbXTtcclxuXHJcbiAgICBpZiAoc2Nhbm5lZERpcnNbcmVhbGRpcl0pIHtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBzY2FubmVkRGlyc1tyZWFsZGlyXSA9IHRydWU7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgZmlsZXMgPSB5aWVsZCBfcmVhZGRpcihyZWFsZGlyKTtcclxuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgY29uc3QgX3BhdGggPSBwYXRoLmpvaW4ocmVhbGRpciwgZmlsZSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHN0YXQgPSB5aWVsZCBfc3RhdChfcGF0aCk7XHJcbiAgICAgICAgICBpZiAobWF0Y2hlcihfcGF0aCwgc3RhdCkpIHtcclxuICAgICAgICAgICAgbGlzdC5wdXNoKF9wYXRoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkgJiYgcmVjdXJzaXZlKSB7XHJcbiAgICAgICAgICAgIHBlbmRpbmdEaXJzLnB1c2goX3BhdGgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7IH1cclxuICB9XHJcbiAgcmV0dXJuIGxpc3Q7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVhZGRpcjtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
