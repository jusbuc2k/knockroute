/// <binding AfterBuild='minify-compat, build' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/
var pkg = require('./package.json');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var header = require('gulp-header');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * Copyright 2016 Justin R. Buchanan ',
  ' * @version v<%= pkg.version %>',  
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('minify', function () {
    return gulp.src([
        './src/knockroute.js'
    ])
    .pipe(concat('knockroute.js'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename('knockroute.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('typings', function () {
    return gulp.src([
        './knockroute.d.ts'
    ])
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-compat', function () {
    return gulp.src([
        './lib/es6-promise.js',
        './lib/Array.map.js',
        './src/knockroute.js'
    ])
    .pipe(concat('knockroute-compat.js'))
    .pipe(header('// Includes es6-promise polyfill from https://github.com/jakearchibald/es6-promise \n'))
    .pipe(header('// Includes Array map polyfill from http://es5.github.io/#x15.4.4.19 \n'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(header('// Includes es6-promise polyfill from https://github.com/jakearchibald/es6-promise \n'))
    .pipe(header('// Includes Array map polyfill from http://es5.github.io/#x15.4.4.19 \n'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename('knockroute-compat.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['typings', 'minify', 'minify-compat']);