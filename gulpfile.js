'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const packager = require('electron-packager');
const path = require('path');
const install = require('gulp-install');
const merge = require('merge-stream');
const zip = require('gulp-zip');
const electronInstaller = require('electron-winstaller');
const fs = require('fs');

const webpack = require('webpack');

gulp.task('deps', () => {
  return gulp.src('./app/package.json')
    .pipe(install({ production: true }));
});

gulp.task('main', ['deps'], () => {
  const js = gulp.src('./app/main-es6/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/main'));
  const json = gulp.src('./app/main-es6/**/*.json')
    .pipe(gulp.dest('./app/main'));
  return merge(js, json);
});

gulp.task('renderer', ['deps'], (done) => {
  webpack(require('./webpack.config.js'), (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('webpack', stats.toString());
    done();
  });
});

gulp.task('build', ['main', 'renderer', 'deps'], (done) => {
  packager({
    arch: 'ia32',
    dir: path.join(__dirname, 'app'),
    platform: 'win32',
    asar: true,
    ignore: /(main-es6|renderer)/i,
    overwrite: true,
    out: path.join(__dirname, 'out'),
    icon: path.join(__dirname, 'build', 'icon.ico'),
    'version-string': {
      ProductName: 'Hain',
      CompanyName: 'Heejin Lee'
    }
  }, (err, appPath) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    return done();
  });
});

gulp.task('build-zip', ['build'], () => {
  return gulp.src('./out/Hain-win32-ia32/**/*')
            .pipe(zip('Hain-win32-ia32.zip'))
            .pipe(gulp.dest('./out/'));
});

gulp.task('build-installer', ['build'], (done) => {
  electronInstaller.createWindowsInstaller({
    appDirectory: './out/Hain-win32-ia32',
    outputDirectory: './out',
    authors: 'Heejin Lee',
    title: 'Hain',
    iconUrl: 'https://raw.githubusercontent.com/appetizermonster/Hain/master/build/icon.ico',
    setupIcon: path.resolve('./build/icon.ico'),
    noMsi: true
  }).then(() => {
    fs.renameSync('./out/Setup.exe', './out/HainSetup-ia32.exe');
    done();
  }).catch((err) => done(err));
});

gulp.task('build-all', ['build-zip', 'build-installer']);

gulp.task('watch', ['main', 'renderer'], () => {
  gulp.watch('./app/main-es6/**/*', ['main']);
  gulp.watch('./app/renderer/**/*', ['renderer']);
});

gulp.task('default', ['main', 'renderer']);
