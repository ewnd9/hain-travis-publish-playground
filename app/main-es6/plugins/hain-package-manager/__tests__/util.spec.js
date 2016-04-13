'use strict';

jest.unmock('../util');

const util = require('../util');

describe('util.js', () => {

  describe('hasCompatibleAPIVersions', () => {

    it('should return true if keywords has a compatible api version', () => {
      const apiVersions = ['hain0', 'hain-0.1.0'];
      const keywords = ['hain0'];
      const isCompatible = util.hasCompatibleAPIKeywords(apiVersions, keywords);
      expect(isCompatible).toBe(true);
    });

    it('should return false if keywords has no compatible api version', () => {
      const apiVersions = ['hain0', 'hain-0.1.0'];
      const keywords = ['hain1'];
      const isCompatible = util.hasCompatibleAPIKeywords(apiVersions, keywords);
      expect(isCompatible).toBe(false);
    });

  });

});
