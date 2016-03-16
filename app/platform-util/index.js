'use strict';

var native = require('./addon');
var wrapper = {};

wrapper.fetchFileIconAsPng = function (filePath, callback) {
  try {
    native.fetchFileIconAsPng(filePath, callback);
  } catch (e) {
    console.log(e);
  }
};

wrapper.saveFocus = function () {
  native.saveFocus();
};


wrapper.restoreFocus = function () {
  native.restoreFocus();
};

module.exports = wrapper;
