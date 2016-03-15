'use strict';

const _ = require('lodash');
const math = require('mathjs');

class MathPlugin {

  get config() {
    return {
      name: 'math plugin (using math.js)',
      help: '=1+1, 1 inch to cm, cos(45 deg)',
      icon: '#fa fa-calculator',
      prefix: '='
    };
  }

  * startup() { }

  * search(query, reply) {
    try {
      const ans = math.eval(query);
      if (_.isNumber(ans) || _.isString(ans) || (_.isObject(ans) && _.has(ans, 'value'))) {
        return [{
          id: 'math',
          title: `${query.trim()} = ${ans.toString()}`
        }];
      }
    } catch (e) {
    }

    return [{
      id: 'think',
      title: `${query.trim()} = ...`
    }];
  }

  * execute(id, payload) { }

}

module.exports = MathPlugin;
