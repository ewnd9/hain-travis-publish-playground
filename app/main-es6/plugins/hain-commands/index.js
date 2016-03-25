'use strict';

const COMMANDS = ['/restart', '/quit', '/about'];
const NAME = 'hain-commands';

module.exports = (context) => {
  const app = context.app;
  const matchutil = context.matchutil;
  const toast = context.toast;

  function search(query, res) {
    const query_lower = query.toLowerCase();
    if (query_lower === '/restart') {
      return res.add({
        id: 'restart',
        title: 'Restart Hain',
        desc: NAME
      });
    }
    if (query_lower === '/about') {
      return res.add({
        id: 'about',
        title: 'Hain by Heejin Lee &lt;monster@teamappetizer.com&gt;',
        desc: NAME
      });
    }
    if (query_lower === '/quit') {
      return res.add({
        id: 'quit',
        title: 'Quit Hain',
        desc: NAME
      });
    }
    return res.add(_makeCommandsHelp(query));
  }

  function execute(id, payload) {
    if (id === 'restart') {
      toast.enqueue('Hain will be restarted, it will takes seconds');
      setTimeout(() => app.restart(), 1000);
      app.setInput('');
    } else if (id === 'quit') {
      app.quit();
    } else if (id === 'about') {
      toast.enqueue('Thank you for using Hain');
      app.setInput('');
    }
  }

  function _makeCommandsHelp(query) {
    const ret = matchutil.head(COMMANDS, query, (x) => x).map((x) => {
      return {
        redirect: x.elem,
        title: matchutil.makeStringBoldHtml(x.elem, x.matches),
        desc: NAME
      };
    });
    return ret;
  }

  return { search, execute };
};
