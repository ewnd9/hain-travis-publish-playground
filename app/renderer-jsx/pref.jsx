'use strict';

const lo_isEqual = require('lodash.isequal');
const lo_cloneDeep = require('lodash.clonedeep');

const React = require('react');
const ReactDOM = require('react-dom');

import { LeftNav, List, ListItem, Subheader, RaisedButton } from 'material-ui';
import { SelectableContainerEnhance } from 'material-ui/lib/hoc/selectable-enhance';
import SchemaForm from './schema-form/schema-form';
import injectTapEventPlugin from 'react-tap-event-plugin';

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

  onModelChange(newModel) {
    // Do not commit if nothing changed
    if (lo_isEqual(newModel, this.state.modelCopy))
      return;
    this.commitChanges(this.state.selectedPrefId, lo_cloneDeep(newModel));
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
        modelCopy: lo_cloneDeep(model)
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
        modelCopy: lo_cloneDeep(msg.model)
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
        <SchemaForm schema={this.state.schema} model={this.state.model} title={selectedPrefId}
                    onChange={this.onModelChange.bind(this)} />
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
          <div style={{ padding: '5px', paddingTop: '0px' }}>
            {schemaForm}
            <br />
            <div style={{ textAlign: 'right' }}>
              <RaisedButton label="Reset to Default" secondary={true} onTouchTap={this.handleResetAll.bind(this)} /><br />
            </div>
          </div>
        </div>
      </div>
   );
  }
}

ReactDOM.render(<Preferences />, document.getElementById('app'));
