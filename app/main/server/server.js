'use strict';

var _ = require('lodash');
var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var logger = require('../utils/logger');
var app = require('electron').app;

module.exports = function (context) {
  var rpc = context.rpc;
  var proxyHandler = require('./server-proxyhandler')(context);

  var workerProcess = null;
  var _delayedSearch = 0;
  var isPluginsReady = false;

  function searchAll(ticket, query) {
    workerProcess.send({
      type: 'searchAll',
      args: { ticket: ticket, query: query }
    });
  }

  function handleWorkerMessage(msg) {
    if (msg.type === 'error') {
      var err = msg.error;
      logger.log('Unhandled plugin Error: ' + err);
    } else if (msg.type === 'ready') {
      isPluginsReady = true;
    } else if (msg.type === 'on-result') {
      var _msg$args = msg.args;
      var ticket = _msg$args.ticket;
      var type = _msg$args.type;
      var payload = _msg$args.payload;

      rpc.send('on-result', { ticket: ticket, type: type, payload: payload });
    } else if (msg.type === 'proxy') {
      var _msg$args2 = msg.args;
      var service = _msg$args2.service;
      var func = _msg$args2.func;
      var args = _msg$args2.args;

      proxyHandler.handle(service, func, args);
    }
  }

  function initialize() {
    var workerPath = path.join(__dirname, '../worker/worker.js');
    if (!fs.existsSync(workerPath)) {
      throw new Error('can\'t execute plugin process');
    }
    workerProcess = cp.fork(workerPath, [], {
      silent: true
    });
    workerProcess.on('message', function (msg) {
      handleWorkerMessage(msg);
    });
    app.on('quit', function () {
      try {
        if (workerProcess) workerProcess.kill();
      } catch (e) {}
    });
  }

  rpc.on('search', function (evt, params) {
    var ticket = params.ticket;
    var query = params.query;


    clearInterval(_delayedSearch);
    if (workerProcess === null || !workerProcess.connected) {
      logger.log('waiting plugins...');
      _delayedSearch = setInterval(function () {
        if (workerProcess !== null && workerProcess.connected) {
          searchAll(ticket, query);
          clearInterval(_delayedSearch);
        }
      }, 500);
      return;
    }
    searchAll(ticket, query);
  });

  rpc.define('execute', regeneratorRuntime.mark(function _callee(params) {
    var pluginId, id, payload;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pluginId = params.pluginId;
            id = params.id;
            payload = params.payload;

            workerProcess.send({
              type: 'execute',
              args: { pluginId: pluginId, id: id, payload: payload }
            });

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  rpc.define('close', regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            context.app.close();

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return {
    initialize: initialize,
    get isLoaded() {
      return workerProcess !== null && workerProcess.connected && isPluginsReady;
    }
  };
};
//# sourceMappingURL=data:application/json;base64,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LElBQTBCLENBQUMsY0FBYyxTQUFkLEVBQXlCO0FBQ3RELGFBQU8sR0FBUCxDQUFXLG9CQUFYLEVBRHNEO0FBRXRELHVCQUFpQixZQUFZLFlBQU07QUFDakMsWUFBSSxrQkFBa0IsSUFBbEIsSUFBMEIsY0FBYyxTQUFkLEVBQXlCO0FBQ3JELG9CQUFVLE1BQVYsRUFBa0IsS0FBbEIsRUFEcUQ7QUFFckQsd0JBQWMsY0FBZCxFQUZxRDtTQUF2RDtPQUQyQixFQUsxQixHQUxjLENBQWpCLENBRnNEO0FBUXRELGFBUnNEO0tBQXhEO0FBVUEsY0FBVSxNQUFWLEVBQWtCLEtBQWxCLEVBZGdDO0dBQWpCLENBQWpCLENBakQ0Qjs7QUFrRTVCLE1BQUksTUFBSixDQUFXLFNBQVgsMEJBQXNCLGlCQUFXLE1BQVg7UUFDWixVQUFVLElBQUk7Ozs7O0FBQWQsdUJBQTBCLE9BQTFCO0FBQVUsaUJBQWdCLE9BQWhCO0FBQUksc0JBQVksT0FBWjs7QUFDdEIsMEJBQWMsSUFBZCxDQUFtQjtBQUNqQixvQkFBTSxTQUFOO0FBQ0Esb0JBQU0sRUFBRSxrQkFBRixFQUFZLE1BQVosRUFBZ0IsZ0JBQWhCLEVBQU47YUFGRjs7Ozs7Ozs7R0FGb0IsQ0FBdEIsRUFsRTRCOztBQTBFNUIsTUFBSSxNQUFKLENBQVcsT0FBWCwwQkFBb0I7Ozs7O0FBQ2xCLG9CQUFRLEdBQVIsQ0FBWSxLQUFaOzs7Ozs7OztHQURrQixDQUFwQixFQTFFNEI7O0FBOEU1QixTQUFPO0FBQ0wsMEJBREs7QUFFTCxRQUFJLFFBQUosR0FBZTtBQUFFLGFBQVEsa0JBQWtCLElBQWxCLElBQTBCLGNBQWMsU0FBZCxJQUEyQixjQUFyRCxDQUFWO0tBQWY7R0FGRixDQTlFNEI7Q0FBYiIsImZpbGUiOiJzZXJ2ZXIvc2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5jb25zdCBjcCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcclxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xyXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi91dGlscy9sb2dnZXInKTtcclxuY29uc3QgYXBwID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5hcHA7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChjb250ZXh0KSA9PiB7XHJcbiAgY29uc3QgcnBjID0gY29udGV4dC5ycGM7XHJcbiAgY29uc3QgcHJveHlIYW5kbGVyID0gcmVxdWlyZSgnLi9zZXJ2ZXItcHJveHloYW5kbGVyJykoY29udGV4dCk7XHJcblxyXG4gIGxldCB3b3JrZXJQcm9jZXNzID0gbnVsbDtcclxuICBsZXQgX2RlbGF5ZWRTZWFyY2ggPSAwO1xyXG4gIGxldCBpc1BsdWdpbnNSZWFkeSA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBzZWFyY2hBbGwodGlja2V0LCBxdWVyeSkge1xyXG4gICAgd29ya2VyUHJvY2Vzcy5zZW5kKHtcclxuICAgICAgdHlwZTogJ3NlYXJjaEFsbCcsXHJcbiAgICAgIGFyZ3M6IHsgdGlja2V0LCBxdWVyeSB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZVdvcmtlck1lc3NhZ2UobXNnKSB7XHJcbiAgICBpZiAobXNnLnR5cGUgPT09ICdlcnJvcicpIHtcclxuICAgICAgY29uc3QgZXJyID0gbXNnLmVycm9yO1xyXG4gICAgICBsb2dnZXIubG9nKGBVbmhhbmRsZWQgcGx1Z2luIEVycm9yOiAke2Vycn1gKTtcclxuICAgIH0gZWxzZSBpZiAobXNnLnR5cGUgPT09ICdyZWFkeScpIHtcclxuICAgICAgaXNQbHVnaW5zUmVhZHkgPSB0cnVlO1xyXG4gICAgfSBlbHNlIGlmIChtc2cudHlwZSA9PT0gJ29uLXJlc3VsdCcpIHtcclxuICAgICAgY29uc3QgeyB0aWNrZXQsIHR5cGUsIHBheWxvYWQgfSA9IG1zZy5hcmdzO1xyXG4gICAgICBycGMuc2VuZCgnb24tcmVzdWx0JywgeyB0aWNrZXQsIHR5cGUsIHBheWxvYWQgfSk7XHJcbiAgICB9IGVsc2UgaWYgKG1zZy50eXBlID09PSAncHJveHknKSB7XHJcbiAgICAgIGNvbnN0IHsgc2VydmljZSwgZnVuYywgYXJncyB9ID0gbXNnLmFyZ3M7XHJcbiAgICAgIHByb3h5SGFuZGxlci5oYW5kbGUoc2VydmljZSwgZnVuYywgYXJncyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG4gICAgY29uc3Qgd29ya2VyUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi93b3JrZXIvd29ya2VyLmpzJyk7XHJcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMod29ya2VyUGF0aCkpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYW5cXCd0IGV4ZWN1dGUgcGx1Z2luIHByb2Nlc3MnKTtcclxuICAgIH1cclxuICAgIHdvcmtlclByb2Nlc3MgPSBjcC5mb3JrKHdvcmtlclBhdGgsIFtdLCB7XHJcbiAgICAgIHNpbGVudDogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICB3b3JrZXJQcm9jZXNzLm9uKCdtZXNzYWdlJywgKG1zZykgPT4ge1xyXG4gICAgICBoYW5kbGVXb3JrZXJNZXNzYWdlKG1zZyk7XHJcbiAgICB9KTtcclxuICAgIGFwcC5vbigncXVpdCcsICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAod29ya2VyUHJvY2VzcylcclxuICAgICAgICAgIHdvcmtlclByb2Nlc3Mua2lsbCgpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7IH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcnBjLm9uKCdzZWFyY2gnLCAoZXZ0LCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IHsgdGlja2V0LCBxdWVyeSB9ID0gcGFyYW1zO1xyXG5cclxuICAgIGNsZWFySW50ZXJ2YWwoX2RlbGF5ZWRTZWFyY2gpO1xyXG4gICAgaWYgKHdvcmtlclByb2Nlc3MgPT09IG51bGwgfHwgIXdvcmtlclByb2Nlc3MuY29ubmVjdGVkKSB7XHJcbiAgICAgIGxvZ2dlci5sb2coJ3dhaXRpbmcgcGx1Z2lucy4uLicpO1xyXG4gICAgICBfZGVsYXllZFNlYXJjaCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICBpZiAod29ya2VyUHJvY2VzcyAhPT0gbnVsbCAmJiB3b3JrZXJQcm9jZXNzLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgc2VhcmNoQWxsKHRpY2tldCwgcXVlcnkpO1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChfZGVsYXllZFNlYXJjaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCA1MDApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzZWFyY2hBbGwodGlja2V0LCBxdWVyeSk7XHJcbiAgfSk7XHJcblxyXG4gIHJwYy5kZWZpbmUoJ2V4ZWN1dGUnLCBmdW5jdGlvbiogKHBhcmFtcykge1xyXG4gICAgY29uc3QgeyBwbHVnaW5JZCwgaWQsIHBheWxvYWQgfSA9IHBhcmFtcztcclxuICAgIHdvcmtlclByb2Nlc3Muc2VuZCh7XHJcbiAgICAgIHR5cGU6ICdleGVjdXRlJyxcclxuICAgICAgYXJnczogeyBwbHVnaW5JZCwgaWQsIHBheWxvYWQgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHJwYy5kZWZpbmUoJ2Nsb3NlJywgZnVuY3Rpb24qICgpIHtcclxuICAgIGNvbnRleHQuYXBwLmNsb3NlKCk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpbml0aWFsaXplLFxyXG4gICAgZ2V0IGlzTG9hZGVkKCkgeyByZXR1cm4gKHdvcmtlclByb2Nlc3MgIT09IG51bGwgJiYgd29ya2VyUHJvY2Vzcy5jb25uZWN0ZWQgJiYgaXNQbHVnaW5zUmVhZHkpOyB9XHJcbiAgfTtcclxufTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
