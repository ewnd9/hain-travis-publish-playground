'use strict';

const _ = require('lodash');
const co = require('co');
const twitter = require('twitter-text');

module.exports = (context) => {
  const shell = context.shell;
  const app = context.app;

  function search(query, res) {
    const query_trim = query.trim();
    if (query_trim.length <= 2)
      return;

    const urls = twitter.extractUrls(query_trim);
    if (urls.length === 0)
      return;

    const url = _.first(urls);
    const ratio = url.length / query_trim.length;
    if (ratio <= 0.9)
      return;

    res.add({
      id: url,
      title: url,
      desc: url,
      group: 'Links'
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
