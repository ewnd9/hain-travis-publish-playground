'use strict';

const _ = require('lodash');
const path = require('path');
const SimpleCache = require('simple-lru-cache');

const electron = require('electron');
const app = electron.app;

const logger = require('../../utils/logger');
const platformUtil = require('../../../platform-util');

function register() {
  app.on('ready', () => {
    const cache = new SimpleCache({ maxSize: 100 });

    const protocol = electron.protocol;
    protocol.registerBufferProtocol('icon', (req, callback) => {
      let filePath = null;
      try {
        const path_base64 = req.url.substr(7);
        filePath = new Buffer(path_base64, 'base64').toString();
      } catch (e) {
        // error
        return callback();
      }

      if (filePath === null || filePath.length === 0) {
        // error
        return callback();
      }

      let cacheKey = filePath;
      const extName = path.extname(filePath).toLowerCase();

      if (extName.length > 0 && extName !== '.exe' && extName !== '.lnk') {
        cacheKey = extName;
      } else {
        cacheKey = filePath;
      }

      const buffer = cache.get(cacheKey);
      if (buffer === undefined) {
        platformUtil.fetchFileIconAsPng(filePath, (err, buf) => {
          if (err || buf === null) {
            logger.log(`internal error ${err}`);
            return callback();
          }
          cache.set(cacheKey, buf);
          callback({ mimeType: 'image/png', data: buf });
        });
      } else {
        callback({ mimeType: 'image/png', data: buffer });
      }
    }, (err) => {
      if (err) {
        logger.log('failed to register protocol: icon');
      }
    });
  });
}

module.exports = {
  register
};
