'use strict';

const winston = require('winston');

class Logger {
  constructor(logger, tag) {
    this.tag = tag;
    this.logger = logger;
  }

  log(msg) {
    if (!this.logger)
      return;
    try {
      this.logger.debug(this.tag, msg);
    } catch (e) {
    }
  }
}

module.exports = (filename) => {
  const logger = new (winston.Logger)({
    level: 'debug',
    transports: [
      new (winston.transports.File)({
        filename,
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

  return {
    create: (tag) => new Logger(logger, tag)
  };
};
