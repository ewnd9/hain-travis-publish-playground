'use strict';

const _ = require('lodash');
const got = require('got');

const ICON = '#fa fa-book';

const TOKEN_RE = /token\s*([\w\d]+)?/i;
const CLIENT_ID_RE = /clientid\s*([\w\d]+)?/i;

function api_list(accessToken, clientId) {
  return got('a.wunderlist.com/api/v1/lists', {
    headers: {
      'X-Access-Token': accessToken,
      'X-Client-ID': clientId
    },
    json: true
  });
}

function api_tasks(accessToken, clientId, listId) {
  return got('a.wunderlist.com/api/v1/tasks?list_id=' + listId, {
    headers: {
      'X-Access-Token': accessToken,
      'X-Client-ID': clientId
    },
    json: true
  });
}

class WunderlistPlugin {

  constructor({ toast, localStorage }) {
    this.toast = toast;
    this.localStorage = localStorage;
  }

  get description() {
    return {
      title: 'wunderlist plugin',
      desc: 'type <i>/wl</i>',
      icon: ICON
    };
  }

  get prefix() {
    return '/wl';
  }

  * startup() {
    this.updateToken();
  }

  updateToken() {
    this.accessToken = this.localStorage.getItem('access_token');
    this.clientId = this.localStorage.getItem('client_id');
  }

  * search(query) {
    const query_trim = query.trim();

    const tokenQuery = TOKEN_RE.exec(query_trim);
    if (tokenQuery) {
      const token = (tokenQuery[1] || '').trim();
      if (token.length === 0) {
        return [{
          title: 'Current access token',
          desc: this.accessToken || '- nothing - '
        }]
      }
      return [{
        id: 'token',
        payload: token,
        title: 'Set access token',
        desc: token
      }];
    }

    const clientIdQuery = CLIENT_ID_RE.exec(query_trim);
    if (clientIdQuery) {
      const clientId = clientIdQuery[1] || '';
      if (clientId.length === 0) {
        return [{
          title: 'Current client id',
          desc: this.clientId || '- nothing -'
        }];
      }
      return [{
        id: 'clientId',
        payload: clientId.trim(),
        title: 'Set Client ID',
        desc: clientId
      }];
    }

    if (this.accessToken && this.clientId) {
      const list = (yield api_list(this.accessToken, this.clientId)).body;
      return list.map((x) => {
        return {
          id: 'list',
          payload: x.title,
          title: x.title,
          icon: ICON
        };
      });
    }
  }

  * execute(id, payload) {
    // TODO encryption
    if (id === 'token') {
      this.localStorage.setItem('access_token', payload);
      this.updateToken();
      this.toast('token saved!');
      return `${this.prefix} `;
    } else if (id === 'clientId') {
      this.localStorage.setItem('client_id', payload);
      this.updateToken();
      this.toast('clientid saved!');
      return `${this.prefix} `;
    }

    if (id === 'list') {
      return `${this.prefix}.${payload}`;
    }
  }

}

module.exports = null;
