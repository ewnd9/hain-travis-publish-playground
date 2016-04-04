'use strict';

var co = require('co');

var electron = require('electron');
var Tray = electron.Tray;
var Menu = electron.Menu;
var BrowserWindow = electron.BrowserWindow;

var path = require('path');
var platformUtil = require('../../../platform-util');

var autolaunch = require('./autolaunch');

module.exports = function (context) {
  var _marked = [createTray].map(regeneratorRuntime.mark);

  var mainWindow = null;
  var tray = null;

  function createWindow(cb) {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 510,
      alwaysOnTop: true,
      center: true,
      frame: false,
      show: false,
      closable: false,
      minimizable: false,
      maximizable: false,
      moveable: false,
      resizable: false,
      skipTaskbar: true
    });

    if (cb) {
      mainWindow.webContents.on('did-finish-load', cb);
    }

    mainWindow.loadURL('file://' + __dirname + '/../../../dist/index.html');
    mainWindow.on('blur', function () {
      hideAndRefreshWindow(true);
    });
  }

  function _centerWindowOnSelectedScreen(window) {
    var screen = electron.screen;

    var selectedDisplay = screen.getPrimaryDisplay();
    var displays = screen.getAllDisplays();
    var cursorPos = screen.getCursorScreenPoint();

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = displays[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var display = _step.value;

        var bounds = display.bounds;
        var left = bounds.x;
        var right = bounds.x + bounds.width;
        var top = bounds.y;
        var bottom = bounds.y + bounds.height;

        if (cursorPos.x < left || cursorPos.x > right) continue;
        if (cursorPos.y < top || cursorPos.y > bottom) continue;

        selectedDisplay = display;
        break;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var windowSize = window.getSize();
    var displayBounds = selectedDisplay.bounds;

    var centerPos = [displayBounds.x + displayBounds.width * 0.5, displayBounds.y + displayBounds.height * 0.5];
    centerPos[0] -= windowSize[0] * 0.5; // x
    centerPos[1] -= windowSize[1] * 0.5; // y

    window.setPosition(Math.round(centerPos[0]), Math.round(centerPos[1]));
  }

  function showWindowOnCenter() {
    if (mainWindow === null) {
      return;
    }

    platformUtil.saveFocus();
    _centerWindowOnSelectedScreen(mainWindow);
    mainWindow.show();
  }

  function hideAndRefreshWindow(dontRestoreFocus) {
    if (mainWindow === null) {
      return;
    }

    mainWindow.hide();
    mainWindow.webContents.executeJavaScript('refresh()');

    if (!dontRestoreFocus) {
      platformUtil.restoreFocus();
    }
  }

  function createTray() {
    var iconPath, autoLaunchActivated, menu;
    return regeneratorRuntime.wrap(function createTray$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            iconPath = path.normalize(__dirname + '/../../../images/tray_16.ico');
            _context.next = 3;
            return autolaunch.isActivated();

          case 3:
            autoLaunchActivated = _context.sent;

            tray = new Tray(iconPath);
            menu = Menu.buildFromTemplate([{
              label: 'Hain', click: function click() {
                showWindowOnCenter();
              }
            }, {
              label: 'Auto-launch', type: 'checkbox', checked: autoLaunchActivated,
              click: function click() {
                return autolaunch.toggle();
              }
            }, {
              type: 'separator'
            }, {
              label: 'Restart', click: function click() {
                return context.app.restart();
              }
            }, {
              label: 'Quit', click: function click() {
                return context.app.quit();
              }
            }]);

            tray.on('click', function () {
              showWindowOnCenter();
            });
            tray.setToolTip('Hain');
            tray.setContextMenu(menu);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _marked[0], this);
  }

  function isContentLoading() {
    return mainWindow.webContents.isLoading();
  }

  function destroyRefs() {
    mainWindow = null;
    tray = null;
  }

  return {
    createWindow: createWindow,
    showWindowOnCenter: showWindowOnCenter,
    hideAndRefreshWindow: hideAndRefreshWindow,
    createTray: co.wrap(createTray),
    isContentLoading: isContentLoading,
    destroyRefs: destroyRefs
  };
};
//# sourceMappingURL=data:application/json;base64,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QVAsRUFBZSxPQUFPO3VCQUFNLFFBQVEsR0FBUixDQUFZLElBQVo7ZUFBTjthQWpCVSxDQUF2Qjs7QUFvQmIsaUJBQUssRUFBTCxDQUFRLE9BQVIsRUFBaUIsWUFBTTtBQUNyQixtQ0FEcUI7YUFBTixDQUFqQjtBQUdBLGlCQUFLLFVBQUwsQ0FBZ0IsTUFBaEI7QUFDQSxpQkFBSyxjQUFMLENBQW9CLElBQXBCOzs7Ozs7OztHQTVCRjs7QUErQkEsV0FBUyxnQkFBVCxHQUE0QjtBQUMxQixXQUFPLFdBQVcsV0FBWCxDQUF1QixTQUF2QixFQUFQLENBRDBCO0dBQTVCOztBQUlBLFdBQVMsV0FBVCxHQUF1QjtBQUNyQixpQkFBYSxJQUFiLENBRHFCO0FBRXJCLFdBQU8sSUFBUCxDQUZxQjtHQUF2Qjs7QUFLQSxTQUFPO0FBQ0wsOEJBREs7QUFFTCwwQ0FGSztBQUdMLDhDQUhLO0FBSUwsZ0JBQVksR0FBRyxJQUFILENBQVEsVUFBUixDQUFaO0FBQ0Esc0NBTEs7QUFNTCw0QkFOSztHQUFQLENBMUg0QjtDQUFiIiwiZmlsZSI6InNlcnZlci9hcHAvd2luZG93LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuY29uc3QgY28gPSByZXF1aXJlKCdjbycpO1xyXG5cclxuY29uc3QgZWxlY3Ryb24gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xyXG5jb25zdCBUcmF5ID0gZWxlY3Ryb24uVHJheTtcclxuY29uc3QgTWVudSA9IGVsZWN0cm9uLk1lbnU7XHJcbmNvbnN0IEJyb3dzZXJXaW5kb3cgPSBlbGVjdHJvbi5Ccm93c2VyV2luZG93O1xyXG5cclxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcclxuY29uc3QgcGxhdGZvcm1VdGlsID0gcmVxdWlyZSgnLi4vLi4vLi4vcGxhdGZvcm0tdXRpbCcpO1xyXG5cclxuY29uc3QgYXV0b2xhdW5jaCA9IHJlcXVpcmUoJy4vYXV0b2xhdW5jaCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoY29udGV4dCkgPT4ge1xyXG4gIGxldCBtYWluV2luZG93ID0gbnVsbDtcclxuICBsZXQgdHJheSA9IG51bGw7XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZVdpbmRvdyhjYikge1xyXG4gICAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcclxuICAgICAgd2lkdGg6IDgwMCxcclxuICAgICAgaGVpZ2h0OiA1MTAsXHJcbiAgICAgIGFsd2F5c09uVG9wOiB0cnVlLFxyXG4gICAgICBjZW50ZXI6IHRydWUsXHJcbiAgICAgIGZyYW1lOiBmYWxzZSxcclxuICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgIGNsb3NhYmxlOiBmYWxzZSxcclxuICAgICAgbWluaW1pemFibGU6IGZhbHNlLFxyXG4gICAgICBtYXhpbWl6YWJsZTogZmFsc2UsXHJcbiAgICAgIG1vdmVhYmxlOiBmYWxzZSxcclxuICAgICAgcmVzaXphYmxlOiBmYWxzZSxcclxuICAgICAgc2tpcFRhc2tiYXI6IHRydWVcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChjYikge1xyXG4gICAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uKCdkaWQtZmluaXNoLWxvYWQnLCBjYik7XHJcbiAgICB9XHJcblxyXG4gICAgbWFpbldpbmRvdy5sb2FkVVJMKGBmaWxlOi8vJHtfX2Rpcm5hbWV9Ly4uLy4uLy4uL2Rpc3QvaW5kZXguaHRtbGApO1xyXG4gICAgbWFpbldpbmRvdy5vbignYmx1cicsICgpID0+IHtcclxuICAgICAgaGlkZUFuZFJlZnJlc2hXaW5kb3codHJ1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIF9jZW50ZXJXaW5kb3dPblNlbGVjdGVkU2NyZWVuKHdpbmRvdykge1xyXG4gICAgY29uc3Qgc2NyZWVuID0gZWxlY3Ryb24uc2NyZWVuO1xyXG5cclxuICAgIGxldCBzZWxlY3RlZERpc3BsYXkgPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKTtcclxuICAgIGNvbnN0IGRpc3BsYXlzID0gc2NyZWVuLmdldEFsbERpc3BsYXlzKCk7XHJcbiAgICBjb25zdCBjdXJzb3JQb3MgPSBzY3JlZW4uZ2V0Q3Vyc29yU2NyZWVuUG9pbnQoKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGRpc3BsYXkgb2YgZGlzcGxheXMpIHtcclxuICAgICAgY29uc3QgYm91bmRzID0gZGlzcGxheS5ib3VuZHM7XHJcbiAgICAgIGNvbnN0IFtsZWZ0LCByaWdodCwgdG9wLCBib3R0b21dID0gW2JvdW5kcy54LCBib3VuZHMueCArIGJvdW5kcy53aWR0aCwgYm91bmRzLnksIGJvdW5kcy55ICsgYm91bmRzLmhlaWdodF07XHJcbiAgICAgIGlmIChjdXJzb3JQb3MueCA8IGxlZnQgfHwgY3Vyc29yUG9zLnggPiByaWdodClcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgaWYgKGN1cnNvclBvcy55IDwgdG9wIHx8IGN1cnNvclBvcy55ID4gYm90dG9tKVxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgc2VsZWN0ZWREaXNwbGF5ID0gZGlzcGxheTtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgd2luZG93U2l6ZSA9IHdpbmRvdy5nZXRTaXplKCk7XHJcbiAgICBjb25zdCBkaXNwbGF5Qm91bmRzID0gc2VsZWN0ZWREaXNwbGF5LmJvdW5kcztcclxuXHJcbiAgICBjb25zdCBjZW50ZXJQb3MgPSBbZGlzcGxheUJvdW5kcy54ICsgZGlzcGxheUJvdW5kcy53aWR0aCAqIDAuNSwgZGlzcGxheUJvdW5kcy55ICsgZGlzcGxheUJvdW5kcy5oZWlnaHQgKiAwLjVdO1xyXG4gICAgY2VudGVyUG9zWzBdIC09IHdpbmRvd1NpemVbMF0gKiAwLjU7IC8vIHhcclxuICAgIGNlbnRlclBvc1sxXSAtPSB3aW5kb3dTaXplWzFdICogMC41OyAvLyB5XHJcblxyXG4gICAgd2luZG93LnNldFBvc2l0aW9uKE1hdGgucm91bmQoY2VudGVyUG9zWzBdKSwgTWF0aC5yb3VuZChjZW50ZXJQb3NbMV0pKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dXaW5kb3dPbkNlbnRlcigpIHtcclxuICAgIGlmIChtYWluV2luZG93ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBwbGF0Zm9ybVV0aWwuc2F2ZUZvY3VzKCk7XHJcbiAgICBfY2VudGVyV2luZG93T25TZWxlY3RlZFNjcmVlbihtYWluV2luZG93KTtcclxuICAgIG1haW5XaW5kb3cuc2hvdygpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGlkZUFuZFJlZnJlc2hXaW5kb3coZG9udFJlc3RvcmVGb2N1cykge1xyXG4gICAgaWYgKG1haW5XaW5kb3cgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIG1haW5XaW5kb3cuaGlkZSgpO1xyXG4gICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5leGVjdXRlSmF2YVNjcmlwdCgncmVmcmVzaCgpJyk7XHJcblxyXG4gICAgaWYgKCFkb250UmVzdG9yZUZvY3VzKSB7XHJcbiAgICAgIHBsYXRmb3JtVXRpbC5yZXN0b3JlRm9jdXMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uKiBjcmVhdGVUcmF5KCkge1xyXG4gICAgY29uc3QgaWNvblBhdGggPSBwYXRoLm5vcm1hbGl6ZShgJHtfX2Rpcm5hbWV9Ly4uLy4uLy4uL2ltYWdlcy90cmF5XzE2Lmljb2ApO1xyXG4gICAgY29uc3QgYXV0b0xhdW5jaEFjdGl2YXRlZCA9IHlpZWxkIGF1dG9sYXVuY2guaXNBY3RpdmF0ZWQoKTtcclxuICAgIHRyYXkgPSBuZXcgVHJheShpY29uUGF0aCk7XHJcbiAgICBjb25zdCBtZW51ID0gTWVudS5idWlsZEZyb21UZW1wbGF0ZShbXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogJ0hhaW4nLCBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgc2hvd1dpbmRvd09uQ2VudGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWw6ICdBdXRvLWxhdW5jaCcsIHR5cGU6ICdjaGVja2JveCcsIGNoZWNrZWQ6IGF1dG9MYXVuY2hBY3RpdmF0ZWQsXHJcbiAgICAgICAgY2xpY2s6ICgpID0+IGF1dG9sYXVuY2gudG9nZ2xlKClcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdzZXBhcmF0b3InXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogJ1Jlc3RhcnQnLCBjbGljazogKCkgPT4gY29udGV4dC5hcHAucmVzdGFydCgpXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogJ1F1aXQnLCBjbGljazogKCkgPT4gY29udGV4dC5hcHAucXVpdCgpXHJcbiAgICAgIH1cclxuICAgIF0pO1xyXG4gICAgdHJheS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgIHNob3dXaW5kb3dPbkNlbnRlcigpO1xyXG4gICAgfSk7XHJcbiAgICB0cmF5LnNldFRvb2xUaXAoJ0hhaW4nKTtcclxuICAgIHRyYXkuc2V0Q29udGV4dE1lbnUobWVudSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpc0NvbnRlbnRMb2FkaW5nKCkge1xyXG4gICAgcmV0dXJuIG1haW5XaW5kb3cud2ViQ29udGVudHMuaXNMb2FkaW5nKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkZXN0cm95UmVmcygpIHtcclxuICAgIG1haW5XaW5kb3cgPSBudWxsO1xyXG4gICAgdHJheSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgY3JlYXRlV2luZG93LFxyXG4gICAgc2hvd1dpbmRvd09uQ2VudGVyLFxyXG4gICAgaGlkZUFuZFJlZnJlc2hXaW5kb3csXHJcbiAgICBjcmVhdGVUcmF5OiBjby53cmFwKGNyZWF0ZVRyYXkpLFxyXG4gICAgaXNDb250ZW50TG9hZGluZyxcclxuICAgIGRlc3Ryb3lSZWZzXHJcbiAgfTtcclxufTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
