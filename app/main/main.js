'use strict';

require('babel-polyfill');

(function startup() {
  if (require('electron-squirrel-startup')) return;

  // workaround for fixing auto-launch cwd problem
  var path = require('path');
  var exeName = path.basename(process.execPath);
  if (!exeName.startsWith('electron')) {
    process.chdir(path.dirname(process.execPath));
  }

  var co = require('co');
  var dialog = require('electron').dialog;
  var electronApp = require('electron').app;

  var logger = require('./utils/logger');
  process.on('uncaughtException', function (err) {
    logger.log(err);
    dialog.showErrorBox('Hain', 'Unhandled Error: ' + (err.stack || err));
  });

  var appContext = {
    app: null,
    plugins: null,
    server: null,
    toast: null,
    rpc: null,
    clientLogger: null
  };

  co(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            appContext.rpc = require('./server/rpc-server');

            appContext.toast = require('./server/toast')(appContext);
            appContext.clientLogger = require('./server/client-logger')(appContext);
            appContext.app = require('./server/app/app')(appContext);
            appContext.server = require('./server/server')(appContext);

            appContext.server.initialize();

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })).catch(function (err) {
    dialog.showErrorBox('Hain', 'Unhandled Error: ' + (err.stack || err));
    electronApp.quit();
  });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsUUFBUSxnQkFBUjs7QUFFQSxDQUFFLFNBQVMsT0FBVCxHQUFtQjtBQUNuQixNQUFJLFFBQVEsMkJBQVIsQ0FBSixFQUEwQyxPQUExQzs7O0FBRG1CLE1BSWIsT0FBTyxRQUFRLE1BQVIsQ0FBUCxDQUphO0FBS25CLE1BQU0sVUFBVSxLQUFLLFFBQUwsQ0FBYyxRQUFRLFFBQVIsQ0FBeEIsQ0FMYTtBQU1uQixNQUFJLENBQUMsUUFBUSxVQUFSLENBQW1CLFVBQW5CLENBQUQsRUFBaUM7QUFDbkMsWUFBUSxLQUFSLENBQWMsS0FBSyxPQUFMLENBQWEsUUFBUSxRQUFSLENBQTNCLEVBRG1DO0dBQXJDOztBQUlBLE1BQU0sS0FBSyxRQUFRLElBQVIsQ0FBTCxDQVZhO0FBV25CLE1BQU0sU0FBUyxRQUFRLFVBQVIsRUFBb0IsTUFBcEIsQ0FYSTtBQVluQixNQUFNLGNBQWMsUUFBUSxVQUFSLEVBQW9CLEdBQXBCLENBWkQ7O0FBY25CLE1BQU0sU0FBUyxRQUFRLGdCQUFSLENBQVQsQ0FkYTtBQWVuQixVQUFRLEVBQVIsQ0FBVyxtQkFBWCxFQUFnQyxVQUFDLEdBQUQsRUFBUztBQUN2QyxXQUFPLEdBQVAsQ0FBVyxHQUFYLEVBRHVDO0FBRXZDLFdBQU8sWUFBUCxDQUFvQixNQUFwQix5QkFBZ0QsSUFBSSxLQUFKLElBQWEsR0FBYixDQUFoRCxFQUZ1QztHQUFULENBQWhDLENBZm1COztBQW9CbkIsTUFBTSxhQUFhO0FBQ2pCLFNBQUssSUFBTDtBQUNBLGFBQVMsSUFBVDtBQUNBLFlBQVEsSUFBUjtBQUNBLFdBQU8sSUFBUDtBQUNBLFNBQUssSUFBTDtBQUNBLGtCQUFjLElBQWQ7R0FOSSxDQXBCYTs7QUE2Qm5CLDZCQUFHOzs7OztBQUNELHVCQUFXLEdBQVgsR0FBaUIsUUFBUSxxQkFBUixDQUFqQjs7QUFFQSx1QkFBVyxLQUFYLEdBQW1CLFFBQVEsZ0JBQVIsRUFBMEIsVUFBMUIsQ0FBbkI7QUFDQSx1QkFBVyxZQUFYLEdBQTBCLFFBQVEsd0JBQVIsRUFBa0MsVUFBbEMsQ0FBMUI7QUFDQSx1QkFBVyxHQUFYLEdBQWlCLFFBQVEsa0JBQVIsRUFBNEIsVUFBNUIsQ0FBakI7QUFDQSx1QkFBVyxNQUFYLEdBQW9CLFFBQVEsaUJBQVIsRUFBMkIsVUFBM0IsQ0FBcEI7O0FBRUEsdUJBQVcsTUFBWCxDQUFrQixVQUFsQjs7Ozs7Ozs7R0FSQyxDQUFILEVBU0csS0FUSCxDQVNTLFVBQUMsR0FBRCxFQUFTO0FBQ2hCLFdBQU8sWUFBUCxDQUFvQixNQUFwQix5QkFBZ0QsSUFBSSxLQUFKLElBQWEsR0FBYixDQUFoRCxFQURnQjtBQUVoQixnQkFBWSxJQUFaLEdBRmdCO0dBQVQsQ0FUVCxDQTdCbUI7Q0FBbkIsQ0FBRCxFQUFEIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5yZXF1aXJlKCdiYWJlbC1wb2x5ZmlsbCcpO1xyXG5cclxuKChmdW5jdGlvbiBzdGFydHVwKCkge1xyXG4gIGlmIChyZXF1aXJlKCdlbGVjdHJvbi1zcXVpcnJlbC1zdGFydHVwJykpIHJldHVybjtcclxuXHJcbiAgLy8gd29ya2Fyb3VuZCBmb3IgZml4aW5nIGF1dG8tbGF1bmNoIGN3ZCBwcm9ibGVtXHJcbiAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcclxuICBjb25zdCBleGVOYW1lID0gcGF0aC5iYXNlbmFtZShwcm9jZXNzLmV4ZWNQYXRoKTtcclxuICBpZiAoIWV4ZU5hbWUuc3RhcnRzV2l0aCgnZWxlY3Ryb24nKSkge1xyXG4gICAgcHJvY2Vzcy5jaGRpcihwYXRoLmRpcm5hbWUocHJvY2Vzcy5leGVjUGF0aCkpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY28gPSByZXF1aXJlKCdjbycpO1xyXG4gIGNvbnN0IGRpYWxvZyA9IHJlcXVpcmUoJ2VsZWN0cm9uJykuZGlhbG9nO1xyXG4gIGNvbnN0IGVsZWN0cm9uQXBwID0gcmVxdWlyZSgnZWxlY3Ryb24nKS5hcHA7XHJcblxyXG4gIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nZ2VyJyk7XHJcbiAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyKSA9PiB7XHJcbiAgICBsb2dnZXIubG9nKGVycik7XHJcbiAgICBkaWFsb2cuc2hvd0Vycm9yQm94KCdIYWluJywgYFVuaGFuZGxlZCBFcnJvcjogJHtlcnIuc3RhY2sgfHwgZXJyfWApO1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCBhcHBDb250ZXh0ID0ge1xyXG4gICAgYXBwOiBudWxsLFxyXG4gICAgcGx1Z2luczogbnVsbCxcclxuICAgIHNlcnZlcjogbnVsbCxcclxuICAgIHRvYXN0OiBudWxsLFxyXG4gICAgcnBjOiBudWxsLFxyXG4gICAgY2xpZW50TG9nZ2VyOiBudWxsXHJcbiAgfTtcclxuXHJcbiAgY28oZnVuY3Rpb24qICgpIHtcclxuICAgIGFwcENvbnRleHQucnBjID0gcmVxdWlyZSgnLi9zZXJ2ZXIvcnBjLXNlcnZlcicpO1xyXG5cclxuICAgIGFwcENvbnRleHQudG9hc3QgPSByZXF1aXJlKCcuL3NlcnZlci90b2FzdCcpKGFwcENvbnRleHQpO1xyXG4gICAgYXBwQ29udGV4dC5jbGllbnRMb2dnZXIgPSByZXF1aXJlKCcuL3NlcnZlci9jbGllbnQtbG9nZ2VyJykoYXBwQ29udGV4dCk7XHJcbiAgICBhcHBDb250ZXh0LmFwcCA9IHJlcXVpcmUoJy4vc2VydmVyL2FwcC9hcHAnKShhcHBDb250ZXh0KTtcclxuICAgIGFwcENvbnRleHQuc2VydmVyID0gcmVxdWlyZSgnLi9zZXJ2ZXIvc2VydmVyJykoYXBwQ29udGV4dCk7XHJcblxyXG4gICAgYXBwQ29udGV4dC5zZXJ2ZXIuaW5pdGlhbGl6ZSgpO1xyXG4gIH0pLmNhdGNoKChlcnIpID0+IHtcclxuICAgIGRpYWxvZy5zaG93RXJyb3JCb3goJ0hhaW4nLCBgVW5oYW5kbGVkIEVycm9yOiAke2Vyci5zdGFjayB8fCBlcnJ9YCk7XHJcbiAgICBlbGVjdHJvbkFwcC5xdWl0KCk7XHJcbiAgfSk7XHJcbn0pKCkpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
