'use strict';

const _ = require('lodash');
const got = require('got');
const shell = require('electron').shell;

function fetchDictionary(word, callback) {
  const word_enc = encodeURIComponent(word);
  const url = `http://ac.endic.naver.com/ac?q=${word_enc}&q_enc=utf-8&st=11001&r_format=json&r_enc=utf-8&r_lt=10001&r_unicode=0&r_escape=1`;
  got(url).then((res) => {
    const dict = JSON.parse(res.body);
    const items = dict.items;
    const meanings = _.take(items[0], 4);

    callback(meanings);
  }).catch((err) => {
    callback(null);
  });
}

class DictionaryPlugin {

  get config() {
    return {
      name: 'naver english dictionary plugin',
      help: '?word',
      icon: '#fa fa-book',
      prefix: '?'
    };
  }

  * startup() { }

  * search(query) {
    if (query.length <= 2) {
      return [{
        title: 'type more than 2 characters',
        desc: '?hello'
      }];
    }
    return new Promise((resolve, reject) => {
      fetchDictionary(query, (meanings) => {
        if (meanings === undefined || meanings === null) {
          return resolve();
        }
        const ret = meanings.map((x) => {
          return {
            id: x[0][0],
            title: `<b>${x[0][0]}</b>`,
            desc: x[1][0]
          };
        });
        resolve(ret);
      });
    });
  }

  * execute(id, payload) {
    if (id === undefined) {
      return;
    }
    const word_enc = encodeURIComponent(id);
    const url = `http://endic.naver.com/search.nhn?sLn=en&dicQuery=${word_enc}&query=${word_enc}&target=endic&ie=utf8`;
    shell.openExternal(url);
  }

}

module.exports = DictionaryPlugin;
