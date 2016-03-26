'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const packager = require('electron-packager');
const path = require('path');
const install = require('gulp-install');
const zip = require('gulp-zip');
const electronInstaller = require('electron-winstaller');
const fs = require('fs');
const del = require('del');

gulp.task('deps', () => {
  return gulp.src('./app/package.json')
    .pipe(install({ production: true }));
});

gulp.task('clean:renderer', () => {
  return del(['./app/renderer']);
});

gulp.task('renderer', ['deps', 'clean:renderer'], () => {
  const js = gulp.src('./app/renderer-jsx/**/*.js*')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015', 'react']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/renderer'));
  return js;
});

gulp.task('build', ['renderer', 'deps'], (done) => {
  packager({
    arch: 'ia32',
    dir: path.join(__dirname, 'app'),
    platform: 'win32',
    asar: true,
    ignore: /(renderer-jsx)/i,
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
    loadingGif: path.resolve('./build/installer.gif'),
    noMsi: true
  }).then(() => {
    fs.renameSync('./out/Setup.exe', './out/HainSetup-ia32.exe');
    done();
  }).catch((err) => done(err));
});

gulp.task('build-all', ['build-zip', 'build-installer']);

gulp.task('watch', ['renderer'], () => {
  const opts = {
    debounceDelay: 2000
  };
  gulp.watch('./app/renderer-jsx/**/*', opts, ['renderer']);
});

gulp.task('default', ['renderer']);
