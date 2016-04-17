'use strict';

jest.unmock('../check-update');
const mock_got = require('got');
const checkForUpdate = require('../check-update');

describe('checkUpdate', () => {

  pit('should return latest version and url', () => {
    const latestVersion = '0.2.0';
    const downloadUrl = 'download-0.2.0';

    const githubAPIData = [{
      tag_name: `v${latestVersion}`,
      html_url: downloadUrl
    }, {
      tag_name: 'v0.1.0',
      html_url: 'fake'
    }];

    mock_got.mockReturnValueOnce(Promise.resolve({
      body: githubAPIData
    }));

    return checkForUpdate().then(res => {
      expect(res).toEqual({
        version: latestVersion,
        url: downloadUrl
      });
    });
  });

});
