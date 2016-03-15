'use strict';

require('babel-polyfill');

const co = require('co');
const logger = require('./logger').create('main');

let _app = null;
let _plugins = null;
let _server = null;
let _isPluginsLoaded = false;

const context = {
  get app() { return _app; },
  toast: require('./services/toast'),
  matcher: require('./services/matcher'),
  isPluginsLoaded: () => _isPluginsLoaded
};

co(function* () {
  _app = require('./app')(context);
  _server = require('./server')();

  _plugins = require('./plugins')(context);
  yield _plugins.initialize();

  _server.injectPlugins(_plugins);
  _isPluginsLoaded = true;
}).catch((err) => {
  logger.log(err);
});
