/* global $ */
'use strict';

const _ = require('lodash');

const React = require('react');
const ReactDOM = require('react-dom');
const rpc = require('./rpc-client');
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

import { TextField, Avatar, SelectableContainerEnhance, List, ListItem, FontIcon } from 'material-ui';
import { Notification } from 'react-notification';

const SelectableList = SelectableContainerEnhance(List);

let __searchTicket = 0;
function incrTicket() {
  __searchTicket++;
  if (__searchTicket > 999999999)
    __searchTicket = 0;
  return __searchTicket;
}

class AppContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      input: '',
      results: [],
      selectionIndex: 0,
      toastMessage: '',
      toastOpen: false
    };
    this.toastQueue = [];
    this.lastSearchTicket = 0;
    this.lastResultTicket = -1;
  }

  clearState() {
    this.refs.input.focus();
    this.scrollTo(0);
    this.setState({ input: '', selectionIndex: 0 });
    this.search('');
  }

  processToast() {
    if (this.toastQueue.length <= 0 ||
        this.state.toastOpen || !remote.getCurrentWindow().isVisible()) {
      return;
    }
    const msg = this.toastQueue.shift();
    this.setState({ toastMessage: msg, toastOpen: true });
    this.autoHideToast();
  }

  autoHideToast() {
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.setState({ toastOpen: false });
    }, 1500);
  }

  componentDidMount() {
    this.refs.input.focus();
    ipc.on('on-toast', (evt, args) => {
      const { message } = args;
      this.toastQueue.push(message);
    });
    ipc.on('on-result', (evt, args) => {
      const { ticket, ret } = args;
      if (this.lastSearchTicket !== ticket) {
        return;
      }
      let results = this.state.results;
      let selectionIndex = this.state.selectionIndex;
      if (this.lastResultTicket !== ticket) {
        results = [];
        selectionIndex = 0;
        this.lastResultTicket = ticket;
      }
      if (_.isArray(ret)) {
        results = results.concat(ret);
        results = _.sortBy(results, (x) => (x.score * -1)); // stable sort (desc)
      } else if (_.isObject(ret)) {
        if (_.has(ret, 'remove')) {
          const _id = ret.remove;
          results = _.reject(results, (x) => {
            return (x.id === _id && x.pluginId === ret.pluginId);
          });
        }
      }
      this.setState({ results, selectionIndex });
    });
    ipc.send('__connect', null);
    setInterval(this.processToast.bind(this), 200);
    this.search('');
  }

  scrollTo(selectionIndex) {
    const listItem = this.refs[`item.${selectionIndex}`];
    if (listItem) {
      const listItem_dom = ReactDOM.findDOMNode(listItem);
      const listContainer_dom = ReactDOM.findDOMNode(this.refs.listContainer);

      const rect = listItem_dom.getBoundingClientRect();
      const parentRect = listContainer_dom.getBoundingClientRect();
      const isOutside = ((rect.bottom - rect.height) <= parentRect.top || (rect.top + rect.height) >= parentRect.bottom);

      if (isOutside) {
        $(listContainer_dom).scrollTo(listItem_dom);
      }
    }
  }

  handleSelection(key) {
    let selectionDelta = 0;
    if (key === 'ArrowUp') {
      selectionDelta = -1;
    } else if (key === 'ArrowDown') {
      selectionDelta = 1;
    } else if (key === 'PageUp') {
      selectionDelta = -5;
    } else if (key === 'PageDown') {
      selectionDelta = 5;
    }

    if (selectionDelta === 0) {
      return false;
    }

    const results = this.state.results;
    const upperSelectionIndex = results.length - 1;

    let newSelectionIndex = this.state.selectionIndex + selectionDelta;
    newSelectionIndex = _.clamp(newSelectionIndex, 0, upperSelectionIndex);

    this.setState({ selectionIndex: newSelectionIndex });
    this.scrollTo(newSelectionIndex);
    return true;
  }

  handleEsc(key) {
    if (key !== 'Escape') {
      return false;
    }
    rpc.call('close');
    return true;
  }

  search(query) {
    const ticket = incrTicket();
    this.lastSearchTicket = ticket;

    clearTimeout(this.lastSearchTimer);
    this.lastSearchTimer = setTimeout(() => {
      ipc.send('search', { ticket, query });
    }, 50);
  }

  handleKeyDown(evt) {
    const key = evt.key;
    if (this.handleSelection(key) || this.handleEsc(key) || this.handleEnter(key)) {
      evt.preventDefault();
    }
  }

  handleChange(evt) {
    const input = this.refs.input.getValue();
    this.setState({ input: input });
    this.scrollTo(0);
    this.search(input);
  }

  execute(item) {
    if (item === undefined) {
      return;
    }
    const args = {
      pluginId: item.pluginId,
      id: item.id,
      payload: item.payload
    };

    rpc.call('execute', args).then((ret) => {
      if (_.isString(ret) === false) {
        return;
      }
      this.setState({ input: ret, selectionIndex: 0 });
      this.search(ret);
    }).catch((err) => {
      console.log(err);
    });
  }

  handleEnter(key) {
    if (key !== 'Enter') {
      return false;
    }
    const results = this.state.results;
    const selectionIndex = this.state.selectionIndex;
    this.execute(results[selectionIndex]);
    return true;
  }

  handleUpdateSelectionIndex(evt, index) {
    this.setState({ selectionIndex: index });
  }

  handleItemClick(i, evt) {
    this.execute(this.state.results[i]);
  }

  handleKeyboardFocus(evt) {
    this.refs.input.focus();
  }

  parseIconUrl(iconUrl) {
    if (!_.isString(iconUrl)) {
      return null;
    }
    if (iconUrl.startsWith('#')) {
      const iconClass = iconUrl.substring(1);
      return <Avatar icon={<FontIcon className={iconClass} />} />;
    }
    return <Avatar src={ iconUrl } />;
  }

  render() {
    const results = this.state.results;
    const selectionIndex = this.state.selectionIndex;

    const list = [];
    for (let i = 0; i < results.length; ++i) {
      const result = results[i];
      const avatar = this.parseIconUrl(result.icon);

      list.push(
        <ListItem
          key={ `item.${i}` }
          value={ i }
          ref={ `item.${i}` }
          onKeyboardFocus={ this.handleKeyboardFocus.bind(this) }
          primaryText={<div dangerouslySetInnerHTML={{ __html: result.title }} />}
          secondaryText={<div dangerouslySetInnerHTML={{ __html: result.desc }} />}
          onClick={ this.handleItemClick.bind(this, i) }
          onKeyDown={ this.handleKeyDown.bind(this) }
          leftAvatar={avatar}
          />
      );
    }

    return (
      <div>
        <div style={{ position: 'fixed', height: '40px', 'zIndex': 1000, top: 0, width: '776px' }}>
          <TextField
            ref="input"
            style={{ fontSize: '20px' }}
            hintText="Enter your command!"
            fullWidth={true}
            value={ this.state.input }
            onKeyDown={ this.handleKeyDown.bind(this) }
            onChange={ this.handleChange.bind(this) }
            />
        </div>
        <div ref="listContainer" style={{ 'overflowX': 'hidden', 'overflowY': 'auto', height: '440px' }}>
          <SelectableList style={{ 'padding-top': '0px', 'padding-bottom': '0px' }}
                          valueLink={{ value: selectionIndex, requestChange: this.handleUpdateSelectionIndex.bind(this) }}>
            { list }
          </SelectableList>
        </div>
        <Notification isActive={this.state.toastOpen} message={this.state.toastMessage} />
      </div>
    );
  }
}

const appContainer = ReactDOM.render(<AppContainer />, document.getElementById('app'));

window.refresh = () => {
  appContainer.clearState();
};
