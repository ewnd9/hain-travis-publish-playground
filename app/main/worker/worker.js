/* global process */
'use strict';

require('babel-polyfill');

var logger = require('../utils/logger');

function proxyFunc(srcServiceName, funcName, args) {
  process.send({
    type: 'proxy',
    args: {
      service: srcServiceName,
      func: funcName,
      args: args
    }
  });
}

var appProxy = {
  restart: function restart() {
    return proxyFunc('app', 'restart');
  },
  quit: function quit() {
    return proxyFunc('app', 'quit');
  },
  close: function close() {
    return proxyFunc('app', 'close');
  },
  setInput: function setInput(text) {
    return proxyFunc('app', 'setInput', text);
  }
};

var toastProxy = {
  enqueue: function enqueue(message, duration) {
    return proxyFunc('toast', 'enqueue', { message: message, duration: duration });
  }
};

var shellProxy = {
  showItemInFolder: function showItemInFolder(fullPath) {
    return proxyFunc('shell', 'showItemInFolder', fullPath);
  },
  openItem: function openItem(fullPath) {
    return proxyFunc('shell', 'openItem', fullPath);
  },
  openExternal: function openExternal(fullPath) {
    return proxyFunc('shell', 'openExternal', fullPath);
  }
};

var loggerProxy = {
  log: function log(msg) {
    return proxyFunc('logger', 'log', msg);
  }
};

var workerContext = {
  app: appProxy,
  toast: toastProxy,
  shell: shellProxy,
  logger: loggerProxy
};

var plugins = null;

function handleProcessMessage(msg) {
  if (plugins === null) return;

  try {
    var type = msg.type;
    var args = msg.args;

    if (type === 'searchAll') {
      (function () {
        var query = args.query;
        var ticket = args.ticket;

        var res = function res(obj) {
          process.send({
            type: 'on-result',
            args: {
              ticket: ticket,
              type: obj.type,
              payload: obj.payload
            }
          });
        };
        plugins.searchAll(query, res);
      })();
    } else if (type === 'execute') {
      var pluginId = args.pluginId;
      var id = args.id;
      var payload = args.payload;

      plugins.execute(pluginId, id, payload);
    }
  } catch (e) {
    var err = e.stack || e;
    process.send({ type: 'error', error: err });
    logger.log(err);
  }
}

function handleExceptions() {
  process.on('uncaughtException', function (err) {
    logger.log(err);
  });
}

try {
  handleExceptions();

  plugins = require('./plugins')(workerContext);
  plugins.initialize();

  process.on('message', handleProcessMessage);
  process.send({ type: 'ready' });
} catch (e) {
  var err = e.stack || e;
  process.send({ type: 'error', error: err });
  logger.log(err);
}
//# sourceMappingURL=data:application/json;base64,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QkFBWCxFQUFnQyxVQUFDLEdBQUQsRUFBUztBQUN2QyxXQUFPLEdBQVAsQ0FBVyxHQUFYLEVBRHVDO0dBQVQsQ0FBaEMsQ0FEMEI7Q0FBNUI7O0FBTUEsSUFBSTtBQUNGLHFCQURFOztBQUdGLFlBQVUsUUFBUSxXQUFSLEVBQXFCLGFBQXJCLENBQVYsQ0FIRTtBQUlGLFVBQVEsVUFBUixHQUpFOztBQU1GLFVBQVEsRUFBUixDQUFXLFNBQVgsRUFBc0Isb0JBQXRCLEVBTkU7QUFPRixVQUFRLElBQVIsQ0FBYSxFQUFFLE1BQU0sT0FBTixFQUFmLEVBUEU7Q0FBSixDQVFFLE9BQU8sQ0FBUCxFQUFVO0FBQ1YsTUFBTSxNQUFNLEVBQUUsS0FBRixJQUFXLENBQVgsQ0FERjtBQUVWLFVBQVEsSUFBUixDQUFhLEVBQUUsTUFBTSxPQUFOLEVBQWUsT0FBTyxHQUFQLEVBQTlCLEVBRlU7QUFHVixTQUFPLEdBQVAsQ0FBVyxHQUFYLEVBSFU7Q0FBViIsImZpbGUiOiJ3b3JrZXIvd29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIHByb2Nlc3MgKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxucmVxdWlyZSgnYmFiZWwtcG9seWZpbGwnKTtcclxuXHJcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2xvZ2dlcicpO1xyXG5cclxuZnVuY3Rpb24gcHJveHlGdW5jKHNyY1NlcnZpY2VOYW1lLCBmdW5jTmFtZSwgYXJncykge1xyXG4gIHByb2Nlc3Muc2VuZCh7XHJcbiAgICB0eXBlOiAncHJveHknLFxyXG4gICAgYXJnczoge1xyXG4gICAgICBzZXJ2aWNlOiBzcmNTZXJ2aWNlTmFtZSxcclxuICAgICAgZnVuYzogZnVuY05hbWUsXHJcbiAgICAgIGFyZ3NcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuY29uc3QgYXBwUHJveHkgPSB7XHJcbiAgcmVzdGFydDogKCkgPT4gcHJveHlGdW5jKCdhcHAnLCAncmVzdGFydCcpLFxyXG4gIHF1aXQ6ICgpID0+IHByb3h5RnVuYygnYXBwJywgJ3F1aXQnKSxcclxuICBjbG9zZTogKCkgPT4gcHJveHlGdW5jKCdhcHAnLCAnY2xvc2UnKSxcclxuICBzZXRJbnB1dDogKHRleHQpID0+IHByb3h5RnVuYygnYXBwJywgJ3NldElucHV0JywgdGV4dClcclxufTtcclxuXHJcbmNvbnN0IHRvYXN0UHJveHkgPSB7XHJcbiAgZW5xdWV1ZTogKG1lc3NhZ2UsIGR1cmF0aW9uKSA9PiBwcm94eUZ1bmMoJ3RvYXN0JywgJ2VucXVldWUnLCB7IG1lc3NhZ2UsIGR1cmF0aW9uIH0pXHJcbn07XHJcblxyXG5jb25zdCBzaGVsbFByb3h5ID0ge1xyXG4gIHNob3dJdGVtSW5Gb2xkZXI6IChmdWxsUGF0aCkgPT4gcHJveHlGdW5jKCdzaGVsbCcsICdzaG93SXRlbUluRm9sZGVyJywgZnVsbFBhdGgpLFxyXG4gIG9wZW5JdGVtOiAoZnVsbFBhdGgpID0+IHByb3h5RnVuYygnc2hlbGwnLCAnb3Blbkl0ZW0nLCBmdWxsUGF0aCksXHJcbiAgb3BlbkV4dGVybmFsOiAoZnVsbFBhdGgpID0+IHByb3h5RnVuYygnc2hlbGwnLCAnb3BlbkV4dGVybmFsJywgZnVsbFBhdGgpXHJcbn07XHJcblxyXG5jb25zdCBsb2dnZXJQcm94eSA9IHtcclxuICBsb2c6IChtc2cpID0+IHByb3h5RnVuYygnbG9nZ2VyJywgJ2xvZycsIG1zZylcclxufTtcclxuXHJcbmNvbnN0IHdvcmtlckNvbnRleHQgPSB7XHJcbiAgYXBwOiBhcHBQcm94eSxcclxuICB0b2FzdDogdG9hc3RQcm94eSxcclxuICBzaGVsbDogc2hlbGxQcm94eSxcclxuICBsb2dnZXI6IGxvZ2dlclByb3h5XHJcbn07XHJcblxyXG5sZXQgcGx1Z2lucyA9IG51bGw7XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVQcm9jZXNzTWVzc2FnZShtc2cpIHtcclxuICBpZiAocGx1Z2lucyA9PT0gbnVsbClcclxuICAgIHJldHVybjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgdHlwZSwgYXJncyB9ID0gbXNnO1xyXG4gICAgaWYgKHR5cGUgPT09ICdzZWFyY2hBbGwnKSB7XHJcbiAgICAgIGNvbnN0IHsgcXVlcnksIHRpY2tldCB9ID0gYXJncztcclxuICAgICAgY29uc3QgcmVzID0gKG9iaikgPT4ge1xyXG4gICAgICAgIHByb2Nlc3Muc2VuZCh7XHJcbiAgICAgICAgICB0eXBlOiAnb24tcmVzdWx0JyxcclxuICAgICAgICAgIGFyZ3M6IHtcclxuICAgICAgICAgICAgdGlja2V0LFxyXG4gICAgICAgICAgICB0eXBlOiBvYmoudHlwZSxcclxuICAgICAgICAgICAgcGF5bG9hZDogb2JqLnBheWxvYWRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgICAgcGx1Z2lucy5zZWFyY2hBbGwocXVlcnksIHJlcyk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdleGVjdXRlJykge1xyXG4gICAgICBjb25zdCB7IHBsdWdpbklkLCBpZCwgcGF5bG9hZCB9ID0gYXJncztcclxuICAgICAgcGx1Z2lucy5leGVjdXRlKHBsdWdpbklkLCBpZCwgcGF5bG9hZCk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc3QgZXJyID0gZS5zdGFjayB8fCBlO1xyXG4gICAgcHJvY2Vzcy5zZW5kKHsgdHlwZTogJ2Vycm9yJywgZXJyb3I6IGVyciB9KTtcclxuICAgIGxvZ2dlci5sb2coZXJyKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZUV4Y2VwdGlvbnMoKSB7XHJcbiAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyKSA9PiB7XHJcbiAgICBsb2dnZXIubG9nKGVycik7XHJcbiAgfSk7XHJcbn1cclxuXHJcbnRyeSB7XHJcbiAgaGFuZGxlRXhjZXB0aW9ucygpO1xyXG5cclxuICBwbHVnaW5zID0gcmVxdWlyZSgnLi9wbHVnaW5zJykod29ya2VyQ29udGV4dCk7XHJcbiAgcGx1Z2lucy5pbml0aWFsaXplKCk7XHJcblxyXG4gIHByb2Nlc3Mub24oJ21lc3NhZ2UnLCBoYW5kbGVQcm9jZXNzTWVzc2FnZSk7XHJcbiAgcHJvY2Vzcy5zZW5kKHsgdHlwZTogJ3JlYWR5JyB9KTtcclxufSBjYXRjaCAoZSkge1xyXG4gIGNvbnN0IGVyciA9IGUuc3RhY2sgfHwgZTtcclxuICBwcm9jZXNzLnNlbmQoeyB0eXBlOiAnZXJyb3InLCBlcnJvcjogZXJyIH0pO1xyXG4gIGxvZ2dlci5sb2coZXJyKTtcclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
