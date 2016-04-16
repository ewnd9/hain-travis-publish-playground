'use strict';

const sanitizeHtml = require('sanitize-html');

function sanitize(text) {
  if (text === undefined) {
    return undefined;
  }
  return sanitizeHtml(text, {
    allowedTags: ['b', 'i', 'u', 'em', 'strong', 'span'],
    allowedAttributes: {
      'i': ['class'],
      'span': ['class', 'style']
    }
  });
}

module.exports = { sanitize };
