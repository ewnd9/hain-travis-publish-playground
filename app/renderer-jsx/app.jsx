/* global $ */
'use strict';

const _ = require('lodash');

const React = require('react');
const ReactDOM = require('react-dom');

const RPCRenderer = require('./rpc-renderer');
const rpc = new RPCRenderer('mainwindow');
const remote = require('electron').remote;

import { TextField, Avatar, SelectableContainerEnhance, List, ListItem, Subheader, FontIcon } from 'material-ui';
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
    const contents = this.toastQueue.shift();
    const message = contents.message;
    const duration = contents.duration || 2000;
    this.setState({ toastMessage: message, toastOpen: true });
    this.autoHideToast(duration);
  }

  autoHideToast(duration) {
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.setState({ toastOpen: false });
    }, duration);
  }

  componentDidMount() {
    this.refs.input.focus();
    rpc.connect();
    rpc.on('on-toast', (evt, msg) => {
      const { message, duration } = msg;
      this.toastQueue.push({ message, duration });
    });
    rpc.on('on-log', (evt, msg) => {
      console.log(msg);
    });
    rpc.on('set-input', (evt, args) => {
      this.setInput(args);
    });
    rpc.on('on-result', (evt, msg) => {
      const { ticket, type, payload } = msg;
      if (this.lastSearchTicket !== ticket)
        return;

      let results = this.state.results;
      let selectionIndex = this.state.selectionIndex;
      if (this.lastResultTicket !== ticket) {
        results = [];
        selectionIndex = 0;
        this.lastResultTicket = ticket;
      }

      if (type === 'add') {
        results = results.concat(payload);
        results = _.orderBy(results, ['score'], ['desc']);

        // Grouping results
        const groups = _.uniq(_.map(results, x => x.group));
        const groupedResults = [];
        for (const x of groups) {
          for (const k of results) {
            if (k.group !== x)
              continue;
            groupedResults.push(k);
          }
        }
        results = groupedResults;
      } else if (type === 'remove') {
        const _id = payload.id;
        results = _.reject(results, (x) => {
          return (x.id === _id && x.pluginId === payload.pluginId);
        });
      }

      this.setState({ results, selectionIndex });
    });
    setInterval(this.processToast.bind(this), 200);
    this.search('');
  }

  setInput(args) {
    this.setState({ input: args, selectionIndex: 0 });
    this.refs.input.focus();
    this.search(args);
  }

  scrollTo(selectionIndex) {
    const listItem = this.refs[`item.${selectionIndex}`];
    const header = this.refs[`header.${selectionIndex}`];
    const target = header || listItem;
    if (target) {
      const target_dom = ReactDOM.findDOMNode(target);
      const listContainer_dom = ReactDOM.findDOMNode(this.refs.listContainer);

      const rect = target_dom.getBoundingClientRect();
      const parentRect = listContainer_dom.getBoundingClientRect();
      const isOutside = ((rect.bottom - rect.height) <= parentRect.top || (rect.top + rect.height) >= parentRect.bottom);

      if (isOutside) {
        $(listContainer_dom).scrollTo(target_dom);
      }
    }
  }

  search(query) {
    const ticket = incrTicket();
    this.lastSearchTicket = ticket;

    clearTimeout(this.lastSearchTimer);
    this.lastSearchTimer = setTimeout(() => {
      rpc.send('search', { ticket, query });
    }, 50);
    clearTimeout(this.lastClearTimer);
    this.lastClearTimer = setTimeout(() => {
      if (this.lastResultTicket === ticket)
        return;
      this.setState({ results: [], selectionIndex: 0 });
    }, 250);
  }

  execute(item) {
    if (item === undefined)
      return;
    if (item.redirect) {
      this.setInput(item.redirect);
      return;
    }

    const params = {
      pluginId: item.pluginId,
      id: item.id,
      payload: item.payload
    };
    rpc.call('execute', params);
  }

  handleSelection(selectionDelta) {
    const results = this.state.results;
    const upperSelectionIndex = results.length - 1;

    let newSelectionIndex = this.state.selectionIndex + selectionDelta;
    newSelectionIndex = _.clamp(newSelectionIndex, 0, upperSelectionIndex);

    this.setState({ selectionIndex: newSelectionIndex });
    this.scrollTo(newSelectionIndex);
  }

  handleEsc() {
    rpc.call('close');
  }

  handleEnter() {
    const results = this.state.results;
    const selectionIndex = this.state.selectionIndex;
    this.execute(results[selectionIndex]);
  }

  handleTab() {
    const results = this.state.results;
    const selectionIndex = this.state.selectionIndex;
    const item = results[selectionIndex];
    if (item && item.redirect)
      this.setInput(item.redirect);
  }

  handleKeyDown(evt) {
    const key = evt.key;
    const keyHandlers = {
      Escape: this.handleEsc.bind(this),
      ArrowUp: this.handleSelection.bind(this, -1),
      ArrowDown: this.handleSelection.bind(this, 1),
      PageUp: this.handleSelection.bind(this, -5),
      PageDown: this.handleSelection.bind(this, 5),
      Enter: this.handleEnter.bind(this),
      Tab: this.handleTab.bind(this)
    };
    const selectedHandler = keyHandlers[key];
    if (selectedHandler !== undefined) {
      selectedHandler();
      evt.preventDefault();
    }
  }

  handleChange(evt) {
    const input = this.refs.input.getValue();
    this.setState({ input: input });
    this.scrollTo(0);
    this.search(input);
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
    return <Avatar src={iconUrl} />;
  }

  render() {
    const results = this.state.results;
    const selectionIndex = this.state.selectionIndex;

    const list = [];
    let lastGroup = null;
    for (let i = 0; i < results.length; ++i) {
      const result = results[i];
      const avatar = this.parseIconUrl(result.icon);
      if (result.group !== lastGroup) {
        const headerId = `header.${i}`;
        list.push(
          <div key={headerId} ref={headerId}>
            <Subheader style={{ lineHeight: '32px', fontSize: 13 }}>{ result.group }</Subheader>
          </div>
        );
        lastGroup = result.group;
      }
      const itemId = `item.${i}`;
      list.push(
        <ListItem
          key={itemId}
          ref={itemId}
          value={i}
          onKeyboardFocus={this.handleKeyboardFocus.bind(this)}
          style={{ fontSize: 15, lineHeight: '13px' }}
          primaryText={<div dangerouslySetInnerHTML={{ __html: result.title }} />}
          secondaryText={<div style={{ fontSize: 13 }} dangerouslySetInnerHTML={{ __html: result.desc }} />}
          onClick={this.handleItemClick.bind(this, i)}
          onKeyDown={this.handleKeyDown.bind(this)}
          leftAvatar={avatar}
          />
      );
    }

    const containerStyles = { overflowX: 'hidden', overflowY: 'auto', height: '440px' };
    return (
      <div>
        <div style={{ position: 'fixed', height: '40px', 'zIndex': 1000, top: 0, width: '776px' }}>
          <TextField
            ref="input"
            style={{ fontSize: '20px' }}
            hintText="Enter your command!"
            fullWidth={true}
            value={this.state.input}
            onKeyDown={this.handleKeyDown.bind(this)}
            onChange={this.handleChange.bind(this)}
            />
        </div>
        <div>
          <div ref="listContainer" style={containerStyles}>
            <SelectableList style={{ paddingTop: '0px', paddingBottom: '0px' }}
                            valueLink={{ value: selectionIndex, requestChange: this.handleUpdateSelectionIndex.bind(this) }}>
              {list}
            </SelectableList>
          </div>
        </div>
        <Notification isActive={this.state.toastOpen} message={<div dangerouslySetInnerHTML={{ __html: this.state.toastMessage }} />} />
      </div>
    );
  }
}

const appContainer = ReactDOM.render(<AppContainer />, document.getElementById('app'));

window.clearQuery = () => {
  appContainer.clearState();
};
