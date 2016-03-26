'use strict';

const _ = require('lodash');

const React = require('react');
const ReactDOM = require('react-dom');

import { LeftNav, MenuItem } from 'material-ui';
import { SchemaForm } from 'react-schema-form';

const schema = {
  title: 'Test schema',
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', title: 'Title', default: 'default title', minLength: 3 },
    done: { type: 'boolean', title: 'Done?', default: false }
  }
};

const form = ['*'];
const model = {
  title: 'haha',
  done: true
};

class Preferences extends React.Component {
  onModelChange(evt) {
    console.log(evt);
  }
  render() {
    return (<div>
          <SchemaForm schema={ schema } form={ ['*'] } model={ model } onModelChange={ this.onModelChange.bind(this) }/>
    </div>);
  }
}

ReactDOM.render(<Preferences />, document.getElementById('app'));
