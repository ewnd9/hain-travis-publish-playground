'use strict';

var _marked = [toggle].map(regeneratorRuntime.mark);

var co = require('co');
var Registry = require('winreg');
var regKey = new Registry({
  hive: Registry.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

var VALUE_NAME = 'Hain';

function activate() {
  return new Promise(function (resolve, reject) {
    regKey.set(VALUE_NAME, Registry.REG_SZ, '"' + process.execPath + '" --silent', function (err) {
      if (err) return reject(err);
      return resolve();
    });
  });
}

function deactivate() {
  return new Promise(function (resolve, reject) {
    regKey.remove(VALUE_NAME, function (err) {
      if (err) return reject(err);
      return resolve();
    });
  });
}

function isActivated() {
  return new Promise(function (resolve, reject) {
    regKey.get(VALUE_NAME, function (err, item) {
      return resolve(item !== null);
    });
  });
}

function toggle() {
  var activated;
  return regeneratorRuntime.wrap(function toggle$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return isActivated();

        case 2:
          activated = _context.sent;

          if (!activated) {
            _context.next = 8;
            break;
          }

          _context.next = 6;
          return deactivate();

        case 6:
          _context.next = 10;
          break;

        case 8:
          _context.next = 10;
          return activate();

        case 10:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

module.exports = {
  activate: activate,
  deactivate: deactivate,
  isActivated: isActivated,
  toggle: co.wrap(toggle)
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlci9hcHAvYXV0b2xhdW5jaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7ZUF1Q1U7O0FBckNWLElBQU0sS0FBSyxRQUFRLElBQVIsQ0FBTDtBQUNOLElBQU0sV0FBVyxRQUFRLFFBQVIsQ0FBWDtBQUNOLElBQU0sU0FBUyxJQUFJLFFBQUosQ0FBYTtBQUMxQixRQUFNLFNBQVMsSUFBVDtBQUNOLE9BQUsscURBQUw7Q0FGYSxDQUFUOztBQUtOLElBQU0sYUFBYSxNQUFiOztBQUVOLFNBQVMsUUFBVCxHQUFvQjtBQUNsQixTQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsV0FBTyxHQUFQLENBQVcsVUFBWCxFQUF1QixTQUFTLE1BQVQsUUFBcUIsUUFBUSxRQUFSLGVBQTVDLEVBQTBFLFVBQUMsR0FBRCxFQUFTO0FBQ2pGLFVBQUksR0FBSixFQUNFLE9BQU8sT0FBTyxHQUFQLENBQVAsQ0FERjtBQUVBLGFBQU8sU0FBUCxDQUhpRjtLQUFULENBQTFFLENBRHNDO0dBQXJCLENBQW5CLENBRGtCO0NBQXBCOztBQVVBLFNBQVMsVUFBVCxHQUFzQjtBQUNwQixTQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsV0FBTyxNQUFQLENBQWMsVUFBZCxFQUEwQixVQUFDLEdBQUQsRUFBUztBQUNqQyxVQUFJLEdBQUosRUFDRSxPQUFPLE9BQU8sR0FBUCxDQUFQLENBREY7QUFFQSxhQUFPLFNBQVAsQ0FIaUM7S0FBVCxDQUExQixDQURzQztHQUFyQixDQUFuQixDQURvQjtDQUF0Qjs7QUFVQSxTQUFTLFdBQVQsR0FBdUI7QUFDckIsU0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLFdBQU8sR0FBUCxDQUFXLFVBQVgsRUFBdUIsVUFBQyxHQUFELEVBQU0sSUFBTixFQUFlO0FBQ3BDLGFBQU8sUUFBUSxTQUFTLElBQVQsQ0FBZixDQURvQztLQUFmLENBQXZCLENBRHNDO0dBQXJCLENBQW5CLENBRHFCO0NBQXZCOztBQVFBLFNBQVUsTUFBVjtNQUNROzs7Ozs7aUJBQWtCOzs7QUFBbEI7O2VBQ0Y7Ozs7OztpQkFDSTs7Ozs7Ozs7aUJBRUE7Ozs7Ozs7O0NBTFY7O0FBU0EsT0FBTyxPQUFQLEdBQWlCO0FBQ2Ysb0JBRGU7QUFFZix3QkFGZTtBQUdmLDBCQUhlO0FBSWYsVUFBUSxHQUFHLElBQUgsQ0FBUSxNQUFSLENBQVI7Q0FKRiIsImZpbGUiOiJzZXJ2ZXIvYXBwL2F1dG9sYXVuY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBjbyA9IHJlcXVpcmUoJ2NvJyk7XHJcbmNvbnN0IFJlZ2lzdHJ5ID0gcmVxdWlyZSgnd2lucmVnJyk7XHJcbmNvbnN0IHJlZ0tleSA9IG5ldyBSZWdpc3RyeSh7XHJcbiAgaGl2ZTogUmVnaXN0cnkuSEtDVSxcclxuICBrZXk6ICdcXFxcU29mdHdhcmVcXFxcTWljcm9zb2Z0XFxcXFdpbmRvd3NcXFxcQ3VycmVudFZlcnNpb25cXFxcUnVuJ1xyXG59KTtcclxuXHJcbmNvbnN0IFZBTFVFX05BTUUgPSAnSGFpbic7XHJcblxyXG5mdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgcmVnS2V5LnNldChWQUxVRV9OQU1FLCBSZWdpc3RyeS5SRUdfU1osIGBcIiR7cHJvY2Vzcy5leGVjUGF0aH1cIiAtLXNpbGVudGAsIChlcnIpID0+IHtcclxuICAgICAgaWYgKGVycilcclxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XHJcbiAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgcmVnS2V5LnJlbW92ZShWQUxVRV9OQU1FLCAoZXJyKSA9PiB7XHJcbiAgICAgIGlmIChlcnIpXHJcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xyXG4gICAgICByZXR1cm4gcmVzb2x2ZSgpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQWN0aXZhdGVkKCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICByZWdLZXkuZ2V0KFZBTFVFX05BTUUsIChlcnIsIGl0ZW0pID0+IHtcclxuICAgICAgcmV0dXJuIHJlc29sdmUoaXRlbSAhPT0gbnVsbCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24qIHRvZ2dsZSgpIHtcclxuICBjb25zdCBhY3RpdmF0ZWQgPSB5aWVsZCBpc0FjdGl2YXRlZCgpO1xyXG4gIGlmIChhY3RpdmF0ZWQpIHtcclxuICAgIHlpZWxkIGRlYWN0aXZhdGUoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgeWllbGQgYWN0aXZhdGUoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGFjdGl2YXRlLFxyXG4gIGRlYWN0aXZhdGUsXHJcbiAgaXNBY3RpdmF0ZWQsXHJcbiAgdG9nZ2xlOiBjby53cmFwKHRvZ2dsZSlcclxufTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
