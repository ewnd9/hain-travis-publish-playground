'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const shell = require('gulp-shell');

const webpack = require('webpack');

gulp.task('main', () => {
  gulp.src('./main-es6/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('main'));
  gulp.src('./main-es6/**/*.json')
    .pipe(gulp.dest('main'));
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
  gulp.watch('./main-es6/**/*.js', ['main']);
  gulp.watch('./renderer/**/*', ['renderer']);
});

gulp.task('default', ['main', 'renderer']);
