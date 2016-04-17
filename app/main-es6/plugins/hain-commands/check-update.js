'use strict';

const got = require('got');

function checkForUpdate() {
  const url = 'https://api.github.com/repos/appetizermonster/hain/releases';
  return got(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json'
    },
    json: true
  }).then(res => {
    const latest = res.body[0];
    const latestUrl = latest.html_url;
    const latestVersion = latest.tag_name.substring(1);
    return {
      version: latestVersion,
      url: latestUrl
    };
  });
}

module.exports = checkForUpdate;
