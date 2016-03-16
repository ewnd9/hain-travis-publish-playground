'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const shell = require('gulp-shell');

const webpack = require('webpack');

gulp.task('main', () => {
  gulp.src('./app/main-es6/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/main'));
  gulp.src('./app/main-es6/**/*.json')
    .pipe(gulp.dest('./app/main'));
});

gulp.task('renderer', (complete) => {
  webpack(require('./webpack.config.js'), (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('webpack', stats.toString());
    complete();
  });
});

gulp.task('watch', ['main', 'renderer'], () => {
  gulp.watch('./app/main-es6/**/*', ['main']);
  gulp.watch('./app/renderer/**/*', ['renderer']);
});

gulp.task('default', ['main', 'renderer']);
