'use strict';

const _ = require('lodash');

const React = require('react');
const ReactDOM = require('react-dom');

import { LeftNav, List, ListItem, Subheader, RaisedButton } from 'material-ui';
import { SelectableContainerEnhance } from 'material-ui/lib/hoc/selectable-enhance';
import { SchemaForm } from 'react-schema-form';
import injectTapEventPlugin from 'react-tap-event-plugin';
import utils from 'react-schema-form/lib/utils';

injectTapEventPlugin();
const SelectableList = SelectableContainerEnhance(List);

const RPCRenderer = require('./rpc-renderer');
const rpc = new RPCRenderer('prefwindow');

class Preferences extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedPrefId: null,
      prefItems: [],
      schema: null,
      model: {},
      modelCopy: {}
    };
    this.commitTimers = {};
  }

  onModelChange(key, val) {
    const newModel = this.state.model;
    utils.selectOrSet(key, newModel, val);
    // Do not commit if nothing changed
    if (_.isEqual(newModel, this.state.modelCopy))
      return;
    this.commitChanges(this.state.selectedPrefId, _.cloneDeep(newModel));
  }

  commitChanges(prefId, model) {
    const timer = this.commitTimers[prefId];
    clearTimeout(timer);
    this.commitTimers[prefId] = setTimeout(() => {
      rpc.send('updatePreferences', {
        prefId, model
      });
      this.setState({
        model,
        modelCopy: _.cloneDeep(model)
      });
    }, 150);
  }

  componentDidMount() {
    rpc.connect();
    rpc.on('on-get-pref-items', (evt, msg) => {
      const prefItems = msg;
      this.setState({ prefItems });

      if (prefItems.length > 0)
        this.selectPref(prefItems[0].id);
    });
    rpc.on('on-get-preferences', (evt, msg) => {
      this.setState({
        selectedPrefId: msg.prefId,
        schema: JSON.parse(msg.schema),
        model: msg.model,
        modelCopy: _.cloneDeep(msg.model),
        formKey: Math.random()
      });
    });
    rpc.send('getPrefItems');
  }

  selectPref(prefId) {
    rpc.send('getPreferences', prefId);
  }

  handleUpdateSelection(evt, value) {
    this.selectPref(value);
  }

  handleResetAll(evt) {
    rpc.send('resetPreferences', this.state.selectedPrefId);
  }

  render() {
    const listItems = [];
    const selectedPrefId = this.state.selectedPrefId;

    let lastPrefGroup = null;
    for (const prefItem of this.state.prefItems) {
      const prefId = prefItem.id;
      const prefGroup = prefItem.group;

      if (prefGroup !== lastPrefGroup) {
        const groupHeader = (
          <Subheader key={prefGroup} style={{ lineHeight: '32px', fontSize: 13 }}>{prefGroup}</Subheader>
        );
        listItems.push(groupHeader);
        lastPrefGroup = prefGroup;
      }

      const menuItem = (
        <ListItem key={prefId} value={prefId} primaryText={prefId} />
      );
      listItems.push(menuItem);
    }

    let schemaForm = null;
    if (this.state.schema) {
      schemaForm = (
        <SchemaForm key={this.state.formKey} schema={this.state.schema} form={['*']}
              model={this.state.model} onModelChange={this.onModelChange.bind(this)} />
      );
    }

    return (
      <div>
        <LeftNav>
        <SelectableList valueLink={{ value: selectedPrefId, requestChange: this.handleUpdateSelection.bind(this) }}>
          {listItems}
        </SelectableList>
        </LeftNav>
        <div style={{ paddingLeft: '265px', paddingTop: '5px' }}>
          <h1>{selectedPrefId}</h1>
          <div style={{ padding: '5px', paddingTop: '0px' }}>
            {schemaForm}
            <br />
            <div style={{ textAlign: 'right' }}>
              <RaisedButton label="Reset All" secondary={true} onTouchTap={this.handleResetAll.bind(this)} /><br />
            </div>
          </div>
        </div>
      </div>
   );
  }
}

ReactDOM.render(<Preferences />, document.getElementById('app'));
