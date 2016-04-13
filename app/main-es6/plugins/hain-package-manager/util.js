'use strict';

function hasCompatibleAPIKeywords(apiVersions, keywords) {
  for (const keyword of keywords) {
    if (apiVersions.indexOf(keyword) >= 0)
      return true;
  }
  return false;
}

module.exports = { hasCompatibleAPIKeywords };
