'use strict';

const _ = require('lodash');

function fuzzyMatchFallback(elem, keyword, testStr, matchScore) {
  let add = 0;
  let srcStr = keyword;
  let _score = matchScore;
  for (let i = 0; i < testStr.length; ++i) {
    const chr = testStr.charAt(i);
    const occurIndex = srcStr.indexOf(chr);
    if (occurIndex < 0) {
      add *= 0.5;
      _score = 0;
      break;
    }
    add++;
    srcStr = srcStr.substring(0, occurIndex) + srcStr.substring(occurIndex + 1);
  }

  _score = add + (_score * 0.5);
  return { elem: elem, matches: [], score: _score };
}

function fuzzyMatch(elem, testStr, keywordGetter) {
  const srcStr = keywordGetter(elem).toLowerCase();

  const lengthScore = Math.max(0, 100 - srcStr.length) / 101;
  let matchScore = lengthScore;

  let pattern_i = testStr.length - 1;
  let add = 1;
  const matches = [];

  for (let i = srcStr.length - 1; i >= 0; --i) {
    if (pattern_i < 0 || srcStr.charCodeAt(i) !== testStr.charCodeAt(pattern_i)) {
      add *= 0.5;
      continue;
    }

    pattern_i--;
    add = Math.max(2, 1 + add * 2);
    matchScore += add;
    matches.push(i);
  }

  const success = (pattern_i < 0);
  if (success) {
    return { elem: elem, matches: matches.reverse(), score: matchScore };
  }
  return fuzzyMatchFallback(elem, srcStr, testStr, matchScore);
}

function headMatch(elem, testStr, keywordGetter) {
  const srcStr = keywordGetter(elem);
  const testLength = Math.min(srcStr.length, testStr.length);
  const matches = [];
  for (let i = 0; i < testLength; ++i) {
    if (srcStr.charCodeAt(i) !== testStr.charCodeAt(i)) {
      return { elem: elem, matches: [], score: 0 };
    }
    matches.push(i);
  }
  return { elem: elem, matches: matches, score: 1 };
}

function search(elems, testStr, keywordGetter, matchFunc) {
  const results = [];

  if (testStr === null || testStr === undefined || testStr.length === 0) {
    return results;
  }

  const testStr_norm = testStr.toLowerCase();
  if (_.isArray(elems)) {
    // array
    for (let i = 0; i < elems.length; ++i) {
      const matchResult = matchFunc(elems[i], testStr_norm, keywordGetter);
      if (matchResult.score === 0) continue;
      results.push(matchResult);
    }
  } else if (_.isObject(elems)) {
    // object like { [], [], [], ... }
    for (const prop in elems) {
      const arr = elems[prop];
      for (let i = 0; i < arr.length; ++i) {
        const matchResult = matchFunc(arr[i], testStr_norm, keywordGetter);
        if (matchResult.score === 0) continue;
        results.push(matchResult);
      }
    }
  } else {
    // can't process
    return results;
  }
  return _.sortBy(results, (x) => -x.score); // stable sort
}

function fuzzy(elems, testStr, keywordGetter) {
  return search(elems, testStr, keywordGetter, fuzzyMatch);
}

function head(elems, testStr, keywordGetter) {
  return search(elems, testStr, keywordGetter, headMatch);
}

function makeStringBoldHtml(str, boldIndices) {
  if (boldIndices === null || boldIndices.length === 0) {
    return str;
  }
  let p = '';
  let b_i = 0;
  for (let i = 0; i < str.length; ++i) {
    if (i === boldIndices[b_i]) {
      p += `<b>${str.charAt(i) }</b>`;
      b_i++;
    } else {
      p += str.charAt(i);
    }
  }
  return p;
}

module.exports = {
  fuzzy: fuzzy,
  head: head,
  makeStringBoldHtml: makeStringBoldHtml
};
