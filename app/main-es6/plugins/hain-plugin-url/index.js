'use strict';

const _ = require('lodash');
const co = require('co');
const twitter = require('twitter-text');

module.exports = (context) => {
  const shell = context.shell;
  const app = context.app;

  function search(query, res) {
    const urls = twitter.extractUrls(query);
    if (urls.length === 0) {
      return;
    }

    const url = _.first(urls);
    res.add({
      id: url,
      title: url,
      desc: url,
      score: 1
    });
  }

  function execute(id, payload) {
    const protocol_re = /https?:\/\//i;
    let url = id;
    if (protocol_re.test(url) === false) {
      url = `http://${url}`;
    }
    shell.openExternal(url);
    app.close();
  }

  return { search, execute };
};
