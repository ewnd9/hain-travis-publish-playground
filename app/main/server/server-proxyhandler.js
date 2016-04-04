'use strict';

var shell = require('electron').shell;

module.exports = function (context) {
  var proxyHandlers = {};

  function handle(service, func, args) {
    var handler = proxyHandlers[service];
    var _func = handler[func];
    _func(args);
  }

  proxyHandlers.app = {
    restart: function restart() {
      return context.app.restart();
    },
    quit: function quit() {
      return context.app.quit();
    },
    close: function close() {
      return context.app.close();
    },
    setInput: function setInput(text) {
      context.rpc.send('set-input', text);
    }
  };

  proxyHandlers.toast = {
    enqueue: function enqueue(args) {
      var message = args.message;
      var duration = args.duration;

      context.toast.enqueue(message, duration);
    }
  };

  proxyHandlers.shell = {
    showItemInFolder: function showItemInFolder(fullPath) {
      return shell.showItemInFolder(fullPath);
    },
    openItem: function openItem(fullPath) {
      return shell.openItem(fullPath);
    },
    openExternal: function openExternal(fullPath) {
      return shell.openExternal(fullPath);
    }
  };

  proxyHandlers.logger = {
    log: function log(msg) {
      return context.clientLogger.log(msg);
    }
  };

  return { handle: handle };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlci9zZXJ2ZXItcHJveHloYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLElBQU0sUUFBUSxRQUFRLFVBQVIsRUFBb0IsS0FBcEI7O0FBRWQsT0FBTyxPQUFQLEdBQWlCLFVBQUMsT0FBRCxFQUFhO0FBQzVCLE1BQU0sZ0JBQWdCLEVBQWhCLENBRHNCOztBQUc1QixXQUFTLE1BQVQsQ0FBZ0IsT0FBaEIsRUFBeUIsSUFBekIsRUFBK0IsSUFBL0IsRUFBcUM7QUFDbkMsUUFBTSxVQUFVLGNBQWMsT0FBZCxDQUFWLENBRDZCO0FBRW5DLFFBQU0sUUFBUSxRQUFRLElBQVIsQ0FBUixDQUY2QjtBQUduQyxVQUFNLElBQU4sRUFIbUM7R0FBckM7O0FBTUEsZ0JBQWMsR0FBZCxHQUFvQjtBQUNsQixhQUFTO2FBQU0sUUFBUSxHQUFSLENBQVksT0FBWjtLQUFOO0FBQ1QsVUFBTTthQUFNLFFBQVEsR0FBUixDQUFZLElBQVo7S0FBTjtBQUNOLFdBQU87YUFBTSxRQUFRLEdBQVIsQ0FBWSxLQUFaO0tBQU47QUFDUCxjQUFVLGtCQUFDLElBQUQsRUFBVTtBQUNsQixjQUFRLEdBQVIsQ0FBWSxJQUFaLENBQWlCLFdBQWpCLEVBQThCLElBQTlCLEVBRGtCO0tBQVY7R0FKWixDQVQ0Qjs7QUFrQjVCLGdCQUFjLEtBQWQsR0FBc0I7QUFDcEIsYUFBUyxpQkFBQyxJQUFELEVBQVU7VUFDVCxVQUFzQixLQUF0QixRQURTO1VBQ0EsV0FBYSxLQUFiLFNBREE7O0FBRWpCLGNBQVEsS0FBUixDQUFjLE9BQWQsQ0FBc0IsT0FBdEIsRUFBK0IsUUFBL0IsRUFGaUI7S0FBVjtHQURYLENBbEI0Qjs7QUF5QjVCLGdCQUFjLEtBQWQsR0FBc0I7QUFDcEIsc0JBQWtCLDBCQUFDLFFBQUQ7YUFBYyxNQUFNLGdCQUFOLENBQXVCLFFBQXZCO0tBQWQ7QUFDbEIsY0FBVSxrQkFBQyxRQUFEO2FBQWMsTUFBTSxRQUFOLENBQWUsUUFBZjtLQUFkO0FBQ1Ysa0JBQWMsc0JBQUMsUUFBRDthQUFjLE1BQU0sWUFBTixDQUFtQixRQUFuQjtLQUFkO0dBSGhCLENBekI0Qjs7QUErQjVCLGdCQUFjLE1BQWQsR0FBdUI7QUFDckIsU0FBSyxhQUFDLEdBQUQ7YUFBUyxRQUFRLFlBQVIsQ0FBcUIsR0FBckIsQ0FBeUIsR0FBekI7S0FBVDtHQURQLENBL0I0Qjs7QUFtQzVCLFNBQU8sRUFBRSxjQUFGLEVBQVAsQ0FuQzRCO0NBQWIiLCJmaWxlIjoic2VydmVyL3NlcnZlci1wcm94eWhhbmRsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5jb25zdCBzaGVsbCA9IHJlcXVpcmUoJ2VsZWN0cm9uJykuc2hlbGw7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChjb250ZXh0KSA9PiB7XHJcbiAgY29uc3QgcHJveHlIYW5kbGVycyA9IHt9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGUoc2VydmljZSwgZnVuYywgYXJncykge1xyXG4gICAgY29uc3QgaGFuZGxlciA9IHByb3h5SGFuZGxlcnNbc2VydmljZV07XHJcbiAgICBjb25zdCBfZnVuYyA9IGhhbmRsZXJbZnVuY107XHJcbiAgICBfZnVuYyhhcmdzKTtcclxuICB9XHJcblxyXG4gIHByb3h5SGFuZGxlcnMuYXBwID0ge1xyXG4gICAgcmVzdGFydDogKCkgPT4gY29udGV4dC5hcHAucmVzdGFydCgpLFxyXG4gICAgcXVpdDogKCkgPT4gY29udGV4dC5hcHAucXVpdCgpLFxyXG4gICAgY2xvc2U6ICgpID0+IGNvbnRleHQuYXBwLmNsb3NlKCksXHJcbiAgICBzZXRJbnB1dDogKHRleHQpID0+IHtcclxuICAgICAgY29udGV4dC5ycGMuc2VuZCgnc2V0LWlucHV0JywgdGV4dCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHJveHlIYW5kbGVycy50b2FzdCA9IHtcclxuICAgIGVucXVldWU6IChhcmdzKSA9PiB7XHJcbiAgICAgIGNvbnN0IHsgbWVzc2FnZSwgZHVyYXRpb24gfSA9IGFyZ3M7XHJcbiAgICAgIGNvbnRleHQudG9hc3QuZW5xdWV1ZShtZXNzYWdlLCBkdXJhdGlvbik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHJveHlIYW5kbGVycy5zaGVsbCA9IHtcclxuICAgIHNob3dJdGVtSW5Gb2xkZXI6IChmdWxsUGF0aCkgPT4gc2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihmdWxsUGF0aCksXHJcbiAgICBvcGVuSXRlbTogKGZ1bGxQYXRoKSA9PiBzaGVsbC5vcGVuSXRlbShmdWxsUGF0aCksXHJcbiAgICBvcGVuRXh0ZXJuYWw6IChmdWxsUGF0aCkgPT4gc2hlbGwub3BlbkV4dGVybmFsKGZ1bGxQYXRoKVxyXG4gIH07XHJcblxyXG4gIHByb3h5SGFuZGxlcnMubG9nZ2VyID0ge1xyXG4gICAgbG9nOiAobXNnKSA9PiBjb250ZXh0LmNsaWVudExvZ2dlci5sb2cobXNnKVxyXG4gIH07XHJcblxyXG4gIHJldHVybiB7IGhhbmRsZSB9O1xyXG59O1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
