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

const webpack = require('webpack');

gulp.task('main', () => {
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

gulp.task('renderer', (done) => {
  webpack(require('./webpack.config.js'), (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('webpack', stats.toString());
    done();
  });
});

gulp.task('deps', () => {
  return gulp.src('./app/package.json')
    .pipe(install({ production: true }));
});

gulp.task('build', ['main', 'renderer', 'deps'], (done) => {
  packager({
    arch: 'x64',
    dir: path.join(__dirname, 'app'),
    platform: 'win32',
    asar: true,
    overwrite: true,
    icon: path.join(__dirname, 'build', 'icon.ico')
  }, (err, appPath) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    return done();
  });
});

gulp.task('build-zip', ['build'], () => {
  return gulp.src('./Hain-win32-x64/**/*')
            .pipe(zip('Hain-win32-x64.zip'))
            .pipe(gulp.dest('./'));
});

gulp.task('watch', ['main', 'renderer'], () => {
  gulp.watch('./app/main-es6/**/*', ['main']);
  gulp.watch('./app/renderer/**/*', ['renderer']);
});

gulp.task('default', ['main', 'renderer']);
