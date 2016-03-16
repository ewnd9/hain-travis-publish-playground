'use strict';

const _ = require('lodash');
const co = require('co');
const twitter = require('twitter-text');
const shell = require('electron').shell;

module.exports = (context) => {
  function* search(query, reply) {
    const urls = twitter.extractUrls(query);
    if (urls.length === 0) {
      return;
    }

    const url = _.first(urls);
    return [{
      id: url,
      title: url,
      desc: url
    }];
  }

  function* execute(id, payload) {
    const protocol_re = /https?:\/\//i;
    let url = id;
    if (protocol_re.test(url) === false) {
      url = `http://${url}`;
    }
    shell.openExternal(url);
  }

  return {
    search: co.wrap(search),
    execute: co.wrap(execute)
  };
};
