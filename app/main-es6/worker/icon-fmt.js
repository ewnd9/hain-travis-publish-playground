'use strict';

const path = require('path');

function parseIconUrl(baseDir, url) {
  if (url === undefined || url.length === 0)
    return '#fa fa-heart';
  if (url.startsWith('#'))
    return url;
  if (/^https?:/i.test(url))
    return url;
  return `file:///${path.join(baseDir, url)}`;
}

module.exports = { parseIconUrl };
