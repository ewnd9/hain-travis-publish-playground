'use strict';

const _ = require('lodash');
const trending = require('github-trending');
const shell = require('electron').shell;

const TEMP_ID = '__trending';
const CACHE_DURATION_SEC = 30 * 60; // 30 mins

const LANG_COLORS = {
  'c': '#ff5252',
  'c#': '#ff4081',
  'c++': '#e040fb',
  'css': '#7c4dff',
  'html': '#303f9f',
  'javascript': '#1976d2',
  'python': '#0288d1',
  'java': '#0097a7',
  'go': '#00796b',
  'swift': '#2e7d32'
};

class GithubTrendingPlugin {

  constructor({ toast }) {
    this.toast = toast;
  }

  get config() {
    return {
      name: 'github trending plugin',
      help: '/trending',
      icon: '#fa fa-github',
      prefix: '/trending'
    };
  }

  * startup() {
    this.fetchRepos(() => {});
  }

  * search(query, reply) {
    reply([{
      id: TEMP_ID,
      title: 'fetching...',
      desc: 'from Github.com',
      icon: '#fa fa-circle-o-notch fa-spin'
    }]);

    const ret = yield new Promise((resolve, reject) => {
      this.fetchRepos((repos) => {
        if (repos === null) {
          return reject();
        }
        return resolve(repos);
      });
    });

    reply({ remove: TEMP_ID });
    return ret.map((x) => {
      let lang = x.language;
      if (lang.length === 0) {
        lang = 'None';
      }
      const langColor = _.get(LANG_COLORS, lang.toLowerCase(), '#e65100');
      return {
        id: x.url,
        title: `<b>${x.title}</b> by ${x.owner}`,
        desc: `<span style='border-radius: 5px; background-color: ${langColor}; color: #ffffff; padding: 2px'>${lang}</span> / ${x.star} / ${x.description}`
      };
    });
  }

  fetchRepos(callback) {
    if (this.cachedRepos) {
      const diff = (new Date().getTime() - this.lastFetchTime) / 1000;
      if (diff <= CACHE_DURATION_SEC) {
        return callback(this.cachedRepos);
      }
    }

    trending((err, repos) => {
      if (err) {
        return callback(null);
      }

      this.cachedRepos = repos;
      this.lastFetchTime = new Date().getTime();
      return callback(repos);
    });
  }

  * execute(id, payload) {
    if (id === TEMP_ID) {
      this.toast('wait a second!');
      return;
    }
    shell.openExternal(id);
  }

}

module.exports = GithubTrendingPlugin;
