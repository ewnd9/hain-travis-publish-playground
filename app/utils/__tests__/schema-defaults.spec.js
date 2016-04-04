/* global jest, describe, it, expect */
'use strict';

const defaults = require.requireActual('../schema-defaults');

describe('schema-defaults.js', () => {

  describe('defaults', () => {

    it('should return default value if default prop has provided', () => {
      const strVal = 'string value';
      const schema_str = {
        default: strVal
      };
      expect(defaults(schema_str)).toBe(strVal);

      const boolVal = true;
      expect(defaults({ default: boolVal })).toBe(boolVal);

      const numVal = 10;
      expect(defaults({ default: numVal })).toBe(numVal);

      const arrVal = [1, 2, 3];
      expect(defaults({ default: arrVal })).toBe(arrVal);

      const objVal = { a: 'a', b: 'b' };
      expect(defaults({ default: objVal })).toBe(objVal);
    });

    it('should return 0 if integer type has provided', () => {
      const schema = {
        type: 'integer'
      };
      expect(defaults(schema)).toEqual(0);
    });

    it('should return 0 if number type has provided', () => {
      const schema = {
        type: 'number'
      };
      expect(defaults(schema)).toEqual(0);
    });

    it('should return an array of zero length if array type has provided', () => {
      const schema = {
        type: 'array'
      };
      expect(defaults(schema)).toEqual([]);
    });

    it('should return an object that is filled with default values if object type has provided', () => {
      const schema = {
        type: 'object',
        properties: {
          strVal: {
            type: 'string',
            default: 'string value'
          },
          boolVal: {
            type: 'boolean',
            default: true
          }
        }
      };
      const expectedObj = {
        strVal: 'string value',
        boolVal: true
      };
      expect(defaults(schema)).toEqual(expectedObj);
    });

  });

});
