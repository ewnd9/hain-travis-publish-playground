'use strict';

import React from 'react';
import { Card, CardTitle, CardText, TextField,
         RaisedButton, Checkbox, IconButton, FontIcon } from 'material-ui';

import { Validator } from 'jsonschema';
import _ from 'lodash';

import schemaDefaults from '../../utils/schema-defaults';

const validator = new Validator();

function findErrorMessage(errors, path) {
  const errorPath = `instance${path}`;
  for (const error of errors) {
    if (error.property === errorPath)
      return error.message;
  }
  return undefined;
}

class BooleanComponent extends React.Component {
  handleCheck(obj, val) {
    const { onChange, path } = this.props;
    onChange(path, val);
  }

  render() {
    const { schema, model, name } = this.props;
    const title = schema.title || name;
    const checked = model || false;
    return (
      <div>
        <Checkbox name="check" label={title} checked={checked}
                  onCheck={this.handleCheck.bind(this)} />
      </div>
    );
  }
}

class NumberComponent extends React.Component {
  constructor(props) {
    super();
    this.state = {
      val: props.model || 0
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      val: nextProps.model || 0
    });
  }

  handleChange(evt, val) {
    let _val = val;
    if (_val.length === 0)
      _val = '0';

    const incomleteRegEx = /^\d+.?\d*$/;
    if (!incomleteRegEx.test(_val))
      return;

    this.setState({ val: _val });

    const completeRegEx = /^\d+(.\d+)?$/;
    if (!completeRegEx.test(_val))
      return;

    let num = Number(_val);
    if (isNaN(num))
      num = 0;

    const { onChange, path } = this.props;
    onChange(path, num);
  }

  render() {
    const { schema, name, path, errors } = this.props;
    const { val } = this.state;
    const title = schema.title || name;
    const error = findErrorMessage(errors, path);

    return (
      <div>
        <TextField name="number" value={val} errorText={error}
                   floatingLabelText={title} fullWidth={true}
                   onChange={this.handleChange.bind(this)} />
      </div>
    );
  }
}

class TextComponent extends React.Component {
  handleChange(evt, val) {
    const { onChange, path } = this.props;
    onChange(path, val);
  }

  render() {
    const { schema, model, name, path, errors } = this.props;
    const title = schema.title || name;
    const error = findErrorMessage(errors, path);

    return (
      <div>
        <TextField name="text" value={model} errorText={error}
                   floatingLabelText={title} fullWidth={true}
                   onChange={this.handleChange.bind(this)} />
      </div>
    );
  }
}

class ArrayComponent extends React.Component {
  handleRemove(index) {
    const { path, model, onChange } = this.props;
    const arr = model || [];
    arr.pop();
    onChange(path, arr);
  }

  handleAdd() {
    const { schema, path, model, onChange } = this.props;
    const childSchema = schema.items;
    const childDefaultValue = schemaDefaults(childSchema);
    const arr = model || [];

    arr.push(childDefaultValue);
    onChange(path, arr);
  }

  render() {
    const { schema, model, name, path, onChange, errors } = this.props;
    const title = schema.title || name;
    const arr = model || [];

    let titleComponent = null;
    if (title) {
      titleComponent = (
        <div>
          <h3>{title}</h3>
        </div>
      );
    }

    const childSchema = schema.items;
    const ChildComponent = selectComponent(childSchema.type);
    const childComponents = [];

    for (let i = 0; i < arr.length; ++i) {
      const childValue = arr[i];
      const childPath = `${path}[${i}]`;
      const childComponent = (
        <ChildComponent path={childPath} model={childValue}
                        schema={childSchema} onChange={onChange}
                        errors={errors} />
      );
      let wrappedComponent = null;
      if (childSchema.type === 'object') {
        wrappedComponent = (
          <div key={i}>
          <Card>
            <CardText>
              {childComponent}
              <IconButton iconClassName="fa fa-remove" iconStyle={{ fontSize: '12px' }}
                style={{ width: '38px', height: '38px' }}
                onTouchTap={this.handleRemove.bind(this, i)} />
            </CardText>
          </Card>
          <br />
          </div>
        );
      } else {
        wrappedComponent = (
          <div>
            <table width="100%">
              <tr>
                <td>{childComponent}</td>
                <td width="48px">
                  <IconButton iconClassName="fa fa-remove" iconStyle={{ fontSize: '15px' }}
                      onTouchTap={this.handleRemove.bind(this, i)} />
                </td>
              </tr>
            </table>
          </div>
        );
      }
      childComponents.push(wrappedComponent);
    }

    return (
      <div>
        {titleComponent}
        {childComponents}
        &nbsp;
        <div style={{ textAlign: 'left' }}>
          <RaisedButton primary={true}
                        onTouchTap={this.handleAdd.bind(this)} style={{ minWidth: 50 }}>
            <FontIcon className="fa fa-plus" style={{ fontSize: '15px', color: 'white' }}/>
          </RaisedButton>
        </div>
      </div>
    );
  }
}

class ObjectComponent extends React.Component {
  render() {
    const { schema, model, name, path, onChange, errors } = this.props;
    const title = schema.title || name;
    const properties = schema.properties;
    const childComponents = [];
    const obj = model || {};

    let titleComponent = null;
    if (title) {
      titleComponent = (
        <div>
          <h3>{title}</h3>
        </div>
      );
    }

    for (const childName in properties) {
      const property = properties[childName];
      const type = property.type;
      const Component = selectComponent(type);
      const childModel = obj[childName];
      const childPath = `${path}.${childName}`;

      childComponents.push(
        <div>
          <Component key={childName} name={childName} path={childPath}
                   schema={property} model={childModel}
                   onChange={onChange} errors={errors} />
          <br />
        </div>
      );
    }

    return (
      <div>
        {titleComponent}
        {childComponents}
      </div>
    );
  }
}

const components = {
  'object': ObjectComponent,
  'array': ArrayComponent,
  'string': TextComponent,
  'integer': NumberComponent,
  'number': NumberComponent,
  'boolean': BooleanComponent
};

function selectComponent(type) {
  const component = components[type];
  if (component === undefined)
    console.log(`Can't find a type: ${type}`);
  return component;
}

class SchemaForm extends React.Component {
  constructor(props) {
    super();
    this.state = this.convertToState(props);
  }

  convertToState(props) {
    return {
      title: props.title,
      schema: props.schema,
      model: props.model
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.convertToState(nextProps));
  }

  handleChange(path, val) {
    const model = this.state.model;
    _.set(model, path, val);
    this.setState({ model });
    this.props.onChange(model);
  }

  render() {
    const { title, schema, model } = this.state;
    const FormComponent = selectComponent(schema.type);
    const errors = validator.validate(model, schema).errors;

    let headerComponent = null;

    if (title) {
      headerComponent = (<CardTitle title={title} />);
    }

    return (
      <div>
        {headerComponent}
        <CardText>
          <FormComponent path="" title={title} schema={schema} model={model}
                        onChange={this.handleChange.bind(this)}
                        errors={errors} />
        </CardText>
      </div>
    );
  }
}

module.exports = SchemaForm;
