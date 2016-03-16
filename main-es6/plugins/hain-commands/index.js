'use strict';

const _ = require('lodash');
const co = require('co');

const COMMANDS = ['/restart', '/quit', '/about'];
const NAME = 'hain-commands';

module.exports = (context) => {
  const app = context.app;
  const matcher = context.matcher;

  function* search(query, reply) {
    const query_lower = query.toLowerCase();
    if (query_lower === '/restart') {
      return [{
        id: 'restart',
        title: '<b>Restart</b> Hain',
        desc: NAME
      }];
    }
    if (query_lower === '/about') {
      return [{
        title: 'Hain by <b>Heejin Lee</b> &lt;monster@teamappetizer.com&gt;',
        desc: NAME
      }];
    }
    if (query_lower === '/quit') {
      return [{
        id: 'quit',
        title: '<b>Quit</b> Hain',
        desc: NAME
      }];
    }
    return _makeCommandsHelp(query);
  }

  function* execute(id, payload) {
    if (id === 'restart') {
      app.restart();
    } else if (id === 'quit') {
      app.quit();
    }
  }

  function _makeCommandsHelp(query) {
    const ret = matcher.head(COMMANDS, query, (x) => x).map((x) => {
      return {
        redirect: x.elem,
        title: matcher.makeStringBoldHtml(x.elem, x.matches),
        desc: NAME
      };
    });
    return ret;
  }

  return {
    search: co.wrap(search),
    execute: co.wrap(execute)
  };
};
