'use strict';

const got = require('got');
const util = require('./util');

const QUERY_LIMIT = 500;
const QUERY_ENC = encodeURIComponent('hain-plugin');
const FIELDS = 'name,rating,version,description,keywords,author';

function findCompatiblePackages(backendUrl, apiVersions) {
  const url = `${backendUrl}/query?q=name:${QUERY_ENC}&fields=${FIELDS}&default_operator=AND&sort=rating:desc&size=${QUERY_LIMIT}`;
  return got(url, { json: true }).then(res => {
    const results = res.body.results;
    const compatibleResults = results.filter(x => util.hasCompatibleAPIKeywords(apiVersions, x.keywords));
    return compatibleResults.map(x => {
      return {
        name: x.name[0],
        version: x.version[0],
        desc: x.description[0],
        author: x.author[0] || ''
      };
    });
  });
}

module.exports = { findCompatiblePackages };
