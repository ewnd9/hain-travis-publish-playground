'use strict';

const lo_assign = require('lodash.assign');
const got = require('got');

function _getDownloadsCount(packages, period) {
  const query = packages.join(',');
  const query_enc = encodeURIComponent(query);
  const baseUrl = `http://api.npmjs.org/downloads/point/${period}/${query_enc},`
  return got(baseUrl, { json: true }).then(res => res.body);
}

function splitIntoChunks(arr, chunkSize) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const begin = i;
    const end = begin + chunkSize;
    chunks.push(arr.slice(begin, end));
  }
  return chunks;
}

function getDownloadsCount(packages, period) {
  const packageChunks = splitIntoChunks(packages, 20);
  const promises = [];
  for (const packageChunk of packageChunks) {
    const promise = _getDownloadsCount(packageChunk, period || 'last-month');
    promises.push(promise);
  }
  return Promise.all(promises).then(results => {
    let merged = {};
    for (const ret of results) {
      merged = lo_assign(merged, ret);
    }
    return merged;
  });
}

module.exports = getDownloadsCount;
