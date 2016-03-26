'use strict';

var native = /^win/.test(process.platform) ? require('./addon') : {
  fetchFileIconAsPng: function(path, cb) {
    cb([]);
  },
  saveFocus: function() {},
  restoreFocus: function() {}
};

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
