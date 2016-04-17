'use strict';

const fs = require('original-fs');
const co = require('co');
const lo_reject = require('lodash.reject');
const path = require('path');

const readdir = require('./readdir');

const RECENT_ITEM_COUNT = 100;
const RECENT_ITEM_WEIGHT = 1.2;

const matchFunc = (filePath, stats) => {
  const ext = path.extname(filePath).toLowerCase();
  if (stats.isDirectory())
    return true;
  return (ext === '.exe' || ext === '.lnk');
};

function injectEnvVariable(dirPath) {
  let _path = dirPath;
  for (const envVar in process.env) {
    const value = process.env[envVar];
    _path = _path.replace(`\${${envVar}}`, value);
  }
  return _path;
}

function injectEnvVariables(dirArr) {
  const newArr = [];
  for (let i = 0; i < dirArr.length; ++i) {
    const dirPath = dirArr[i];
    newArr.push(injectEnvVariable(dirPath));
  }
  return newArr;
}

module.exports = (context) => {
  const matchutil = context.matchutil;
  const logger = context.logger;
  const shell = context.shell;
  const app = context.app;
  const initialPref = context.preferences.get();
  const localStorage = context.localStorage;
  const toast = context.toast;
  let _recentUsedItems = [];

  const recursiveSearchDirs = injectEnvVariables(initialPref.recursiveFolders || []);
  const flatSearchDirs = injectEnvVariables(initialPref.flatFolders || []);

  const db = {};
  const lazyIndexingKeys = {};

  function* refreshIndex(dirs, recursive) {
    for (const dir of dirs) {
      logger.log(`refreshIndex ${dir}`);
      if (fs.existsSync(dir) === false) {
        logger.log(`can't find a dir: ${dir}`);
        continue;
      }
      const files = yield co(readdir(dir, recursive, matchFunc));
      logger.log(`index updated ${dir}`);
      db[dir] = files;
    }
  }

  function lazyRefreshIndex(dir, recursive) {
    const _lazyKey = lazyIndexingKeys[dir];
    if (_lazyKey !== undefined) {
      clearTimeout(_lazyKey);
    }

    lazyIndexingKeys[dir] = setTimeout(() => {
      co(refreshIndex([dir], recursive));
    }, 5000);
  }

  function* setupWatchers(dirs, recursive) {
    for (const dir of dirs) {
      const _dir = dir;
      fs.watch(_dir, {
        persistent: true,
        recursive: recursive
      }, (evt, filename) => {
        lazyRefreshIndex(_dir, recursive);
      });
    }
  }

  function addRecentItem(item) {
    const idx = _recentUsedItems.indexOf(item);
    if (idx >= 0)
      _recentUsedItems.splice(idx, 1);

    if (fs.existsSync(item))
      _recentUsedItems.unshift(item);

    _recentUsedItems = _recentUsedItems.slice(0, RECENT_ITEM_COUNT);
    localStorage.setItem('recentUsedItems', _recentUsedItems);
  }

  function updateRecentItems() {
    const aliveItems = [];
    for (const item of _recentUsedItems) {
      if (fs.existsSync(item))
        aliveItems.push(item);
    }
    _recentUsedItems = aliveItems;
  }

  function startup() {
    _recentUsedItems = localStorage.getItemSync('recentUsedItems') || [];
    updateRecentItems();

    co(function* () {
      yield* refreshIndex(recursiveSearchDirs, true);
      yield* refreshIndex(flatSearchDirs, false);
      yield* setupWatchers(recursiveSearchDirs, true);
      yield* setupWatchers(flatSearchDirs, false);
    }).catch((err) => {
      logger.log(err);
      logger.log(err.stack);
    });
  }

  function computeRatio(filePath) {
    let ratio = 1;
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();
    if (ext !== '.lnk' && ext !== '.exe')
      ratio *= 0.5;
    if (ext === '.lnk')
      ratio *= 1.5;
    if (basename.indexOf('uninstall') >= 0 || basename.indexOf('remove') >= 0)
      ratio *= 0.9;
    return ratio;
  }

  function _fuzzyResultToSearchResult(results, group, scoreWeight) {
    const _group = group || 'Files & Folders';
    const _scoreWeight = scoreWeight || 1;
    return results.map(x => {
      const filePath = x.elem;
      const filePath_bold = matchutil.makeStringBoldHtml(filePath, x.matches);
      const filePath_base64 = new Buffer(filePath).toString('base64');
      const score = x.score * computeRatio(filePath) * _scoreWeight;
      return {
        id: filePath,
        title: path.basename(filePath, path.extname(filePath)),
        desc: filePath_bold,
        icon: `icon://${filePath_base64}`,
        group: _group,
        score
      };
    });
  }

  function search(query, res) {
    const query_trim = query.replace(' ', '');
    const recentFuzzyResults = matchutil.fuzzy(_recentUsedItems, query_trim, x => x).slice(0, 2);
    const selectedRecentItems = recentFuzzyResults.map(x => x.elem);
    let recentSearchResults = [];

    if (recentFuzzyResults.length > 0)
      recentSearchResults = _fuzzyResultToSearchResult(recentFuzzyResults, 'Recent Items', RECENT_ITEM_WEIGHT);

    const fileFuzzyResults = matchutil.fuzzy(db, query_trim, x => x);
    let fileSearchResults = _fuzzyResultToSearchResult(fileFuzzyResults.slice(0, 10));

    // Reject if it is duplicated with recent items
    fileSearchResults = lo_reject(fileSearchResults, x => selectedRecentItems.indexOf(x.id) >= 0);

    const searchResults = recentSearchResults.concat(fileSearchResults);
    res.add(searchResults);
  }

  function execute(id, payload) {
    // Update recent item, and it will be deleted if file don't exists
    addRecentItem(id);

    if (fs.existsSync(id) === false) {
      toast.enqueue('Sorry, Could\'nt Find a File');
      return;
    }

    shell.openItem(id);
    app.close();
  }

  return { startup, search, execute };
};
