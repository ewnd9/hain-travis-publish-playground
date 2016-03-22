'use strict';

const path = require('path');

const HAIN_APPDATA = `${process.env.LOCALAPPDATA}/hain`;
const LOCAL_STORAGE_DIR = `${HAIN_APPDATA}/localStorages`;

const INTERNAL_PLUGIN_REPO = path.join(__dirname, '../plugins');
const MAIN_PLUGIN_REPO = path.resolve(`${HAIN_APPDATA}/plugins`);
const DEV_PLUGIN_REPO = path.resolve(`${HAIN_APPDATA}/devplugins`);

const PLUGIN_REPOS = [
  INTERNAL_PLUGIN_REPO,
  MAIN_PLUGIN_REPO,
  DEV_PLUGIN_REPO
];

module.exports = {
  INTERNAL_PLUGIN_REPO,
  MAIN_PLUGIN_REPO,
  DEV_PLUGIN_REPO,
  LOCAL_STORAGE_DIR,
  PLUGIN_REPOS
};
