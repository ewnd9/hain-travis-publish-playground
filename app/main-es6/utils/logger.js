'use strict';

const winston = require('winston');
const logger = new (winston.Logger)({
  level: 'debug',
  transports: [
    new (winston.transports.File)({
      filename: 'hain.log',
      json: false,
      prettyPrint: true,
      maxFiles: 3,
      maxsize: 1024 * 1024
    }),
    new (winston.transports.Console)({
      timestamp: true,
      prettyPrint: true
    })
  ]
});

function log(msg) {
  try {
    logger.debug(msg);
  } catch (e) {
  }
}

module.exports = { log };
