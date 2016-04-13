'use strict';

const lo_isNumber = require('lodash.isnumber');
const lo_isString = require('lodash.isstring');
const lo_isObject = require('lodash.isobject');
const lo_has = require('lodash.has');

const math = require('mathjs');

module.exports = ({ app }) => {

  function search(query, res) {
    try {
      const ans = math.eval(query);
      if (lo_isNumber(ans) || lo_isString(ans) || (lo_isObject(ans) && lo_has(ans, 'value'))) {
        res.add({
          title: `${query.trim()} = ${ans.toString()}`,
          group: 'Math',
          payload: ans.toString()
        });
      }
    } catch (e) {
    }
  }

  function execute(id, payload) {
    app.setInput(`=${payload}`);
  }

  return { search, execute };
};
