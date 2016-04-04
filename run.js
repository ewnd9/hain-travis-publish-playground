#!/usr/bin/env node

const electronPath = require('electron-prebuilt');
const childProcess = require('child_process');

const args = process.argv.slice(2);
args.unshift(__dirname);

childProcess.spawn(electronPath, args, { stdio: 'inherit' });
