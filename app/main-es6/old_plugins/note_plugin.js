'use strict';

const _ = require('lodash');

const command_re = / (rm)?(.*)/i;
const PREFIX = '/note';

class NotePlugin {
  constructor({ toast, localStorage }) {
    this.toast = toast;
    this.localStorage = localStorage;
  }

  get config() {
    return {
      name: 'note plugin',
      help: '/note message or /note rm',
      icon: '#fa fa-sticky-note',
      prefix: PREFIX
    };
  }

  * startup() {
    const list_json = this.localStorage.getItem('list');

    if (_.isString(list_json)) {
      this.list = JSON.parse(list_json);
    } else {
      this.list = [];
    }
  }

  * search(query, reply) {
    const command_match = command_re.exec(query);
    if (command_match === null) {
      return this.printList('list');
    }

    const rm_cmd = command_match[1];
    let text = command_match[2];

    if (rm_cmd !== undefined /* rm */ && text.length <= 0) {
      return this.printList('rm');
    } else if (text !== undefined && text.length > 0) {
      if (rm_cmd) {
        text = rm_cmd + text;
      }

      return [{
        id: `add.${text}`,
        title: `<b>write</b>: ${text}`,
        desc: new Date().toLocaleString()
      }];
    }

    return this.printList('list');
  }

  printList(cmd) {
    const list = this.list;
    let prefix = '';
    if (cmd === 'rm') {
      prefix = '<b>remove</b>: ';
    }
    return list.map((x, i) => {
      return {
        id: `${cmd}.${i}`,
        title: prefix + x.text,
        desc: x.date
      };
    });
  }

  * execute(id, payload) {
    if (id.startsWith('add')) {
      const text = id.substring(4);
      if (text.length === 0) {
        return true;
      }
      this.list.splice(0, 0, {
        text: text,
        date: new Date().toLocaleString()
      });
      this.sync();
      this.toast(`${text} added`);
      return `${PREFIX} `;
    } else if (id.startsWith('rm')) {
      const idx = parseInt(id.substring(3));
      const item = this.list[idx];
      this.list.splice(idx, 1);
      this.sync();

      const _rmInput = `${PREFIX} rm`;
      const _emptyInput = `${PREFIX} `;
      const newInput = (this.list.length > 0) ? _rmInput : _emptyInput;

      this.toast(`${item.text} removed`);
      return `${PREFIX} `;
    }
    return true;
  }

  sync() {
    this.localStorage.setItem('list', JSON.stringify(this.list));
  }
}

module.exports = NotePlugin;
