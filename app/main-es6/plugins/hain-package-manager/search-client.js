'use strict';

const got = require('got');
const util = require('./util');

const QUERY_LIMIT = 500;
const QUERY_ENC = encodeURIComponent('hain-plugin');
const FIELDS = 'name,rating,version,description,keywords,author,modified';

const downloadsCount = require('./downloads-count');

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
        modified: x.modified[0].substring(0, 10),
        author: x.author[0] || ''
      };
    });
  });
}

function findCompatiblePackagesWithDownloads(backendUrl, apiVersions) {
  return findCompatiblePackages(backendUrl, apiVersions).then(pkgs => {
    const pkgInfos = pkgs;
    const packageNames = pkgInfos.map(x => x.name);
    return downloadsCount(packageNames).then((ret) => {
      for (const pkgName in ret) {
        const i = packageNames.indexOf(pkgName);
        const info = ret[pkgName];
        pkgInfos[i].downloads = info.downloads;
      }
      return pkgInfos;
    });
  });
}

module.exports = { findCompatiblePackages, findCompatiblePackagesWithDownloads };
