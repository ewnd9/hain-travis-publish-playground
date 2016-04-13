'use strict';

let _got_body = {};
const mockGot = () => {
  if (_got_body === null)
    return Promise.reject();
  return Promise.resolve({
    body: _got_body
  });
};

jest.unmock('../search-client');
jest.unmock('../util');
jest.mock('got', () => mockGot);

const searchClient = require('../search-client');

function makeBackendContentsWith(packages, apiVersion) {
  const _newArr = [];
  for (const pkg of packages) {
    const _wrap = {
      version: [pkg.version],
      name: [pkg.name],
      description: [pkg.desc],
      author: [pkg.author],
      keywords: [apiVersion]
    };
    _newArr.push(_wrap);
  }
  return _newArr;
}

describe('search-client.js', () => {

  describe('findCompatiblePackages', () => {

    pit('should return compatible packages from the backend', () => {
      const apiVersion = 'hain0';
      const packages = [
        {
          version: '0.0.1',
          name: 'hain-plugin-test',
          author: 'tester',
          desc: 'test desc'
        }
      ];

      _got_body = {
        results: makeBackendContentsWith(packages, apiVersion)
      };

      return searchClient.findCompatiblePackages('fakeBackend', [apiVersion])
             .then(retPackages => {
               expect(retPackages).toEqual(packages);
             });
    });

    pit('should reject if `got` has rejected', (done) => {
      _got_body = null; // to make mockGot reject promise

      return searchClient.findCompatiblePackages('fakeBackend', [])
             .then((ret) => {
               throw new Error('Promise should not be resolved');
             }, (err) => {
               // done
             });
    });

  });

});
