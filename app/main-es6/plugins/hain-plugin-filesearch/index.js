'use strict';

const fs = require('original-fs');
const readdir = require('./readdir');
const co = require('co');

const path = require('path');

const matchFunc = (filePath, stats) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!stats.isFile()) {
    return false;
  }
  return (ext === '.exe' || ext === '.lnk');
};

module.exports = (context) => {
  const matchutil = context.matchutil;
  const logger = context.logger;
  const shell = context.shell;
  const app = context.app;

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

  function startup() {
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

  function search(query, res) {
    const query_trim = query.replace(' ', '');
    const searched = matchutil.fuzzy(db, query_trim, (x) => x);
    const result = searched.slice(0, 20).map((x) => {
      const filePath = x.elem;
      const filePath_bold = matchutil.makeStringBoldHtml(filePath, x.matches);
      const filePath_base64 = new Buffer(filePath).toString('base64');
      return {
        id: filePath,
        title: path.basename(filePath, path.extname(filePath)),
        desc: filePath_bold,
        icon: `icon://${filePath_base64}`
      };
    });
    res.add(result);
  }

  function execute(id, payload) {
    logger.log(`${id} executed`);
    shell.openItem(id);
    app.close();
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

  return { startup, search, execute };
};
