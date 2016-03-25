'use strict';

const _ = require('lodash');
const math = require('mathjs');

module.exports = (pluginContext) => {
  const shell = pluginContext.shell;

  function search(query, res) {
    try {
      const ans = math.eval(query);
      if (_.isNumber(ans) || _.isString(ans) || (_.isObject(ans) && _.has(ans, 'value'))) {
        res.add({
          title: `${query.trim()} = ${ans.toString()}`,
          score: 0.5,
          group: 'Math'
        });
      }
    } catch (e) {
    }
  }

  function execute(id, payload) {}

  return { search, execute };
};
