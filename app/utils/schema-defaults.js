'use strict';

const _ = require('lodash');

function defaults(schema) {
  if (schema.default)
    return schema.default;

  const type = schema.type;
  if (type === 'string')
    return '';
  else if (type === 'integer' || type === 'number')
    return 0;
  else if (type === 'array')
    return [];
  else if (type === 'object') {
    const obj = {};
    const properties = schema.properties;
    if (properties === undefined)
      return obj;

    for (const prop in properties) {
      const propSchema = properties[prop];
      const propDefaults = defaults(propSchema);
      obj[prop] = propDefaults;
    }

    return obj;
  }

  return null;
}

module.exports = defaults;
