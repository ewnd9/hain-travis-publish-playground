'use strict';

const _ = require('lodash');
const co = require('co');

const COMMANDS = ['/restart'];

module.exports = (context) => {
  const matcher = context.matcher;

  function* search(query, reply) {
    const query_lower = query.toLowerCase();
    if (query_lower === '/restart') {
      return [{
        id: 'restart',
        title: 'Restart Hain',
        desc: 'Restarting Hain, it may takes seconds'
      }];
    }
    return _makeCommandsHelp(query);
  }

  function* execute(id, payload) {
    if (payload === 'changeinput') {
      return id;
    }
    if (id === 'restart') {
      // main.restart();
    }
  }

  function _makeCommandsHelp(query) {
    const ret = matcher.head(COMMANDS, query, (x) => x).map((x) => {
      return {
        id: x.elem,
        payload: 'changeinput',
        title: matcher.makeStringBoldHtml(x.elem, x.matches),
        desc: 'hain'
      };
    });
    return ret;
  }

  return {
    search: co.wrap(search),
    execute: co.wrap(execute)
  };
};
