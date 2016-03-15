'use strict';

const winston = require('winston');
const logger = new (winston.Logger)({
  level: 'debug',
  transports: [
    new (winston.transports.Console)({ timestamp: true, prettyPrint: true }),
    new (winston.transports.File)({ filename: 'debug.log', json: false, prettyPrint: true })
  ]
});

class Logger {
  constructor(tag) {
    this.tag = tag;
  }

  log(msg) {
    logger.debug(this.tag, msg);
  }
}

module.exports = {
  create: (tag) => new Logger(tag)
};
