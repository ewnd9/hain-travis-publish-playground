'use strict';

var _ = require('lodash');
var electron = require('electron');
var cp = require('child_process');
var asyncutil = require('../../utils/asyncutil');
var logger = require('../../utils/logger');

var electronApp = electron.app;
var globalShortcut = electron.globalShortcut;
var firstLaunch = require('./firstlaunch');
var autolaunch = require('./autolaunch');

module.exports = function (context) {
  var window = require('./window')(context);
  var iconProtocol = require('./iconprotocol')(context);
  var _isRestarting = false;

  if (firstLaunch.isFirstLaunch) {
    autolaunch.activate();
  }

  function registerShortcut() {
    globalShortcut.register('alt+space', function () {
      if (_isRestarting) return;
      if (window.isContentLoading()) {
        logger.log('please wait a seconds, you can use shortcut after loaded');
        return;
      }
      window.showWindowOnCenter();
    });
  }

  var isRestarted = _.includes(process.argv, '--restarted');
  var silentLaunch = _.includes(process.argv, '--silent');
  var shouldQuit = electronApp.makeSingleInstance(function (cmdLine, workingDir) {
    if (_isRestarting) return;
    window.showWindowOnCenter();
  });

  if (shouldQuit && !isRestarted) {
    electronApp.quit();
    return;
  }

  electronApp.on('ready', function () {
    window.createTray().catch(function (err) {
      return logger.log(err);
    });
    registerShortcut();
    window.createWindow(function () {
      if (!silentLaunch || isRestarted) {
        asyncutil.runWhen(function () {
          return !window.isContentLoading() && context.server.isLoaded;
        }, function () {
          return window.showWindowOnCenter();
        }, 100);
      }
      if (isRestarted) context.toast.enqueue('Restarted');
    });
  });

  electronApp.on('will-quit', function () {
    globalShortcut.unregisterAll();
    window.destroyRefs();
  });
  iconProtocol.register();

  function close() {
    window.hideAndRefreshWindow();
  }

  function restart() {
    if (_isRestarting) return;
    _isRestarting = true;

    var argv = [].concat(process.argv);
    if (!_.includes(argv, '--restarted')) {
      argv.push('--restarted');
    }
    if (!argv[0].startsWith('"')) {
      argv[0] = '"' + argv[0] + '"';
    }
    cp.exec(argv.join(' '));
    setTimeout(function () {
      return electronApp.quit();
    }, 500);
  }

  function quit() {
    electronApp.quit();
  }

  return { close: close, restart: restart, quit: quit };
};
//# sourceMappingURL=data:application/json;base64,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RyxNQUFILENBQVUsUUFBUSxJQUFSLENBQWpCLENBTFc7QUFNakIsUUFBSSxDQUFDLEVBQUUsUUFBRixDQUFXLElBQVgsRUFBaUIsYUFBakIsQ0FBRCxFQUFrQztBQUNwQyxXQUFLLElBQUwsQ0FBVSxhQUFWLEVBRG9DO0tBQXRDO0FBR0EsUUFBSSxDQUFDLEtBQUssQ0FBTCxFQUFRLFVBQVIsQ0FBbUIsR0FBbkIsQ0FBRCxFQUEwQjtBQUM1QixXQUFLLENBQUwsVUFBYyxLQUFLLENBQUwsT0FBZCxDQUQ0QjtLQUE5QjtBQUdBLE9BQUcsSUFBSCxDQUFRLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBUixFQVppQjtBQWFqQixlQUFXO2FBQU0sWUFBWSxJQUFaO0tBQU4sRUFBMEIsR0FBckMsRUFiaUI7R0FBbkI7O0FBZ0JBLFdBQVMsSUFBVCxHQUFnQjtBQUNkLGdCQUFZLElBQVosR0FEYztHQUFoQjs7QUFJQSxTQUFPLEVBQUUsWUFBRixFQUFTLGdCQUFULEVBQWtCLFVBQWxCLEVBQVAsQ0E3RTRCO0NBQWIiLCJmaWxlIjoic2VydmVyL2FwcC9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcbmNvbnN0IGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcclxuY29uc3QgY3AgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XHJcbmNvbnN0IGFzeW5jdXRpbCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2FzeW5jdXRpbCcpO1xyXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi91dGlscy9sb2dnZXInKTtcclxuXHJcbmNvbnN0IGVsZWN0cm9uQXBwID0gZWxlY3Ryb24uYXBwO1xyXG5jb25zdCBnbG9iYWxTaG9ydGN1dCA9IGVsZWN0cm9uLmdsb2JhbFNob3J0Y3V0O1xyXG5jb25zdCBmaXJzdExhdW5jaCA9IHJlcXVpcmUoJy4vZmlyc3RsYXVuY2gnKTtcclxuY29uc3QgYXV0b2xhdW5jaCA9IHJlcXVpcmUoJy4vYXV0b2xhdW5jaCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoY29udGV4dCkgPT4ge1xyXG4gIGNvbnN0IHdpbmRvdyA9IHJlcXVpcmUoJy4vd2luZG93JykoY29udGV4dCk7XHJcbiAgY29uc3QgaWNvblByb3RvY29sID0gcmVxdWlyZSgnLi9pY29ucHJvdG9jb2wnKShjb250ZXh0KTtcclxuICBsZXQgX2lzUmVzdGFydGluZyA9IGZhbHNlO1xyXG5cclxuICBpZiAoZmlyc3RMYXVuY2guaXNGaXJzdExhdW5jaCkge1xyXG4gICAgYXV0b2xhdW5jaC5hY3RpdmF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVnaXN0ZXJTaG9ydGN1dCgpIHtcclxuICAgIGdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyKCdhbHQrc3BhY2UnLCAoKSA9PiB7XHJcbiAgICAgIGlmIChfaXNSZXN0YXJ0aW5nKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgaWYgKHdpbmRvdy5pc0NvbnRlbnRMb2FkaW5nKCkpIHtcclxuICAgICAgICBsb2dnZXIubG9nKCdwbGVhc2Ugd2FpdCBhIHNlY29uZHMsIHlvdSBjYW4gdXNlIHNob3J0Y3V0IGFmdGVyIGxvYWRlZCcpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB3aW5kb3cuc2hvd1dpbmRvd09uQ2VudGVyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGlzUmVzdGFydGVkID0gKF8uaW5jbHVkZXMocHJvY2Vzcy5hcmd2LCAnLS1yZXN0YXJ0ZWQnKSk7XHJcbiAgY29uc3Qgc2lsZW50TGF1bmNoID0gKF8uaW5jbHVkZXMocHJvY2Vzcy5hcmd2LCAnLS1zaWxlbnQnKSk7XHJcbiAgY29uc3Qgc2hvdWxkUXVpdCA9IGVsZWN0cm9uQXBwLm1ha2VTaW5nbGVJbnN0YW5jZSgoY21kTGluZSwgd29ya2luZ0RpcikgPT4ge1xyXG4gICAgaWYgKF9pc1Jlc3RhcnRpbmcpXHJcbiAgICAgIHJldHVybjtcclxuICAgIHdpbmRvdy5zaG93V2luZG93T25DZW50ZXIoKTtcclxuICB9KTtcclxuXHJcbiAgaWYgKHNob3VsZFF1aXQgJiYgIWlzUmVzdGFydGVkKSB7XHJcbiAgICBlbGVjdHJvbkFwcC5xdWl0KCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBlbGVjdHJvbkFwcC5vbigncmVhZHknLCAoKSA9PiB7XHJcbiAgICB3aW5kb3cuY3JlYXRlVHJheSgpLmNhdGNoKGVyciA9PiBsb2dnZXIubG9nKGVycikpO1xyXG4gICAgcmVnaXN0ZXJTaG9ydGN1dCgpO1xyXG4gICAgd2luZG93LmNyZWF0ZVdpbmRvdygoKSA9PiB7XHJcbiAgICAgIGlmICghc2lsZW50TGF1bmNoIHx8IGlzUmVzdGFydGVkKSB7XHJcbiAgICAgICAgYXN5bmN1dGlsLnJ1bldoZW4oKCkgPT4gKCF3aW5kb3cuaXNDb250ZW50TG9hZGluZygpICYmIGNvbnRleHQuc2VydmVyLmlzTG9hZGVkKSxcclxuICAgICAgICAgICgpID0+IHdpbmRvdy5zaG93V2luZG93T25DZW50ZXIoKSwgMTAwKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNSZXN0YXJ0ZWQpXHJcbiAgICAgICAgY29udGV4dC50b2FzdC5lbnF1ZXVlKCdSZXN0YXJ0ZWQnKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICBlbGVjdHJvbkFwcC5vbignd2lsbC1xdWl0JywgKCkgPT4ge1xyXG4gICAgZ2xvYmFsU2hvcnRjdXQudW5yZWdpc3RlckFsbCgpO1xyXG4gICAgd2luZG93LmRlc3Ryb3lSZWZzKCk7XHJcbiAgfSk7XHJcbiAgaWNvblByb3RvY29sLnJlZ2lzdGVyKCk7XHJcblxyXG4gIGZ1bmN0aW9uIGNsb3NlKCkge1xyXG4gICAgd2luZG93LmhpZGVBbmRSZWZyZXNoV2luZG93KCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXN0YXJ0KCkge1xyXG4gICAgaWYgKF9pc1Jlc3RhcnRpbmcpXHJcbiAgICAgIHJldHVybjtcclxuICAgIF9pc1Jlc3RhcnRpbmcgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IGFyZ3YgPSBbXS5jb25jYXQocHJvY2Vzcy5hcmd2KTtcclxuICAgIGlmICghXy5pbmNsdWRlcyhhcmd2LCAnLS1yZXN0YXJ0ZWQnKSkge1xyXG4gICAgICBhcmd2LnB1c2goJy0tcmVzdGFydGVkJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWFyZ3ZbMF0uc3RhcnRzV2l0aCgnXCInKSkge1xyXG4gICAgICBhcmd2WzBdID0gYFwiJHthcmd2WzBdfVwiYDtcclxuICAgIH1cclxuICAgIGNwLmV4ZWMoYXJndi5qb2luKCcgJykpO1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiBlbGVjdHJvbkFwcC5xdWl0KCksIDUwMCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBxdWl0KCkge1xyXG4gICAgZWxlY3Ryb25BcHAucXVpdCgpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgY2xvc2UsIHJlc3RhcnQsIHF1aXQgfTtcclxufTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
