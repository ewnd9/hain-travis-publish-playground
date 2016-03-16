'use strict';

const sanitizeHtml = require('sanitize-html');

function sanitize(text) {
  if (text === undefined) {
    return undefined;
  }
  return sanitizeHtml(text, {
    allowedTags: ['b', 'i', 'em', 'strong', 'span'],
    allowedAttributes: {
      'span': ['style']
    }
  });
}

module.exports = { sanitize };
