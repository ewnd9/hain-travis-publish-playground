'use strict';

const fs = require('original-fs');
const readdir = require('./readdir');
const co = require('co');

const path = require('path');
const shell = require('electron').shell;

const matchFunc = (filePath, stats) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!stats.isFile()) {
    return false;
  }
  return (ext === '.exe' || ext === '.lnk');
};

module.exports = (context) => {

  const matcher = context.matcher;
  const logger = context.logger;
  const recursiveSearchDirs = [
    `${process.env.USERPROFILE}\\Desktop`,
    `${process.env.ProgramData}\\Microsoft\\Windows\\Start Menu\\Programs`,
    `${process.env.APPDATA}\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar`,
    `${process.env.APPDATA}\\Microsoft\\Windows\\Start Menu`
  ];
  const flatSearchDirs = [
    `${process.env.SystemRoot}\\System32`,
    `${process.env.SystemRoot}`
  ];
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

  function* startup() {
    yield* refreshIndex(recursiveSearchDirs, true);
    yield* refreshIndex(flatSearchDirs, false);
    yield* setupWatchers(recursiveSearchDirs, true);
    yield* setupWatchers(flatSearchDirs, false);
  }

  function* search(query) {
    const query_trim = query.replace(' ', '');
    const searched = matcher.fuzzy(db, query_trim, (x) => x);
    return searched.slice(0, 20).map((x) => {
      const filePath = x.elem;
      const filePath_bold = matcher.makeStringBoldHtml(filePath, x.matches);
      const filePath_base64 = new Buffer(filePath).toString('base64');
      return {
        id: filePath,
        title: path.basename(filePath, path.extname(filePath)),
        desc: filePath_bold,
        icon: `icon://${filePath_base64}`
      };
    });
  }

  function* execute(id, payload) {
    logger.log(`${id} executed`);
    shell.openItem(id);
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

  return {
    startup: co.wrap(startup),
    search: co.wrap(search),
    execute: co.wrap(execute)
  };
};
