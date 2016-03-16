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
        title: 'Restart Hain',
        desc: NAME
      }];
    }
    if (query_lower === '/about') {
      return [{
        id: 'about',
        title: 'Hain by Heejin Lee &lt;monster@teamappetizer.com&gt;',
        desc: NAME
      }];
    }
    if (query_lower === '/quit') {
      return [{
        id: 'quit',
        title: 'Quit Hain',
        desc: NAME
      }];
    }
    return _makeCommandsHelp(query);
  }

  function* execute(id, payload) {
    if (id === 'restart') {
      context.toast('Hain will be restarted, it will takes seconds');
      setTimeout(() => app.restart(), 1000);
      return '';
    } else if (id === 'quit') {
      app.quit();
    } else if (id === 'about') {
      context.toast('Thank you for using Hain');
      return '';
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
