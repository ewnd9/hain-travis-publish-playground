'use strict';

const hackerNews = require('node-hacker-news')();
const shell = require('electron').shell;

const TEMP_ID = '__fetching';
const CACHE_DURATION_SEC = 10 * 60; // 10 mins

class HackerNewsPlugin {

  constructor({ toast }) {
    this.toast = toast;
  }

  get config() {
    return {
      name: 'hackernews plugin',
      help: '/hn',
      icon: '#fa fa-hacker-news',
      prefix: '/hn'
    };
  }

  * startup() {
    this.fetchNews(() => {});
  }

  * search(query, reply) {
    reply([{
      id: TEMP_ID,
      title: 'fetching...',
      desc: 'from HackerNews',
      icon: '#fa fa-circle-o-notch fa-spin'
    }]);

    const ret = yield new Promise((resolve, reject) => {
      this.fetchNews((items) => {
        if (items === null) {
          return reject();
        }
        return resolve(items);
      });
    });

    reply({ remove: TEMP_ID });

    return ret.map((x) => {
      return {
        id: x.id,
        title: x.title,
        desc: `${x.by} / ${x.score} points <i>${x.url}</i>`
      };
    });
  }

  * execute(id, payload) {
    if (id === TEMP_ID) {
      return this.toast('wait a second');
    }
    const url = `https://news.ycombinator.com/item?id=${id}`;
    shell.openExternal(url);
  }

  fetchNews(callback) {
    if (this.cachedNews) {
      const diff = (new Date().getTime() - this.lastFetchTime) / 1000;
      if (diff <= CACHE_DURATION_SEC) {
        return callback(this.cachedNews);
      }
    }

    hackerNews.getHottestItems(20, (err, items) => {
      if (err) {
        return callback(null);
      }

      this.cachedNews = items;
      this.lastFetchTime = new Date().getTime();
      return callback(items);
    });
  }

}

module.exports = HackerNewsPlugin;
