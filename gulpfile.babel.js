/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are splitted in several files in the gulp directory
 *  because putting all here was really too long
 */

'use strict';

var fs = require('fs');

var babelrc = fs.readFileSync('./.babelrc');
var config;

try {
    config = JSON.parse(babelrc);
} catch (err) {
    console.error('==>     ERROR: Error parsing your .babelrc.');
    console.error(err);
}

require('babel-core/register')(config);
//require("babel-register");
require("babel-polyfill");
/*
require("babel-core");
require('babel-polyfill');*/

var gulp = require('gulp'),
    path = require('path'),
    minifyCSS = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    ngModuleSort = require('gulp-ng-module-sort'),
    concat = require('gulp-concat'),
    addsrc = require('gulp-add-src'),
    series = require('stream-series'),
    path = require('path'),
    mergeStream = require('merge-stream'),
    gutil = require('gulp-util'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps');


function errorHandler(title) {
    return function (err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'del']
});


gulp.task('css', function () {
    gulp.src('public/bower_components/bootstrap/dist/css/bootstrap.min.css')
        .pipe(addsrc.append('public/bower_components/angular-bootstrap/ui-bootstrap-csp.css'))
        .pipe(addsrc.append('public/bower_components/angular-toastr/dist/angular-toastr.css'))
        .pipe(addsrc.append('public/bower_components/animate.css/animate.css'))
        .pipe(addsrc.append('public/bower_components/ionicons/css/ionicons.min.css'))
        .pipe(addsrc.append('public/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.css'))
        .pipe(addsrc.append('public/styles.css'))
        //.pipe(sourcemaps.init())
        .pipe(minifyCSS())
        //.pipe(sourcemaps.write('source-maps'))
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('public/build')).on('error', errorHandler('CSS'));
});

gulp.task('vendor', function () {
    gulp.src('public/bower_components/jquery/dist/jquery.min.js')
        .pipe(addsrc.append('public/bower_components/underscore/underscore-min.js'))
        .pipe(addsrc.append('public/bower_components/bootstrap/dist/js/bootstrap.min.js'))
        .pipe(addsrc.append('public/bower_components/angular/angular.js'))
        .pipe(addsrc.append('public/bower_components/lodash/lodash.js'))
        .pipe(addsrc.append('public/bower_components/angular-resource/angular-resource.js'))
        .pipe(addsrc.append('public/bower_components/angular-ui-router/release/angular-ui-router.js'))
        .pipe(addsrc.append('public/bower_components/angular-animate/angular-animate.js'))
        .pipe(addsrc.append('public/bower_components/angular-sanitize/angular-sanitize.js'))
        .pipe(addsrc.append('public/bower_components/angular-cookies/angular-cookies.js'))
        .pipe(addsrc.append('public/bower_components/angular-messages/angular-messages.js'))
        .pipe(addsrc.append('public/bower_components/angular-bootstrap/ui-bootstrap.js'))
        .pipe(addsrc.append('public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js'))
        .pipe(addsrc.append('public/bower_components/angular-toastr/dist/angular-toastr.js'))
        .pipe(addsrc.append('public/bower_components/angular-toastr/dist/angular-toastr.tpls.js'))
        .pipe(addsrc.append('public/bower_components/angular-touch/angular-touch.js'))
        .pipe(addsrc.append('public/bower_components/async/dist/async.min.js'))
        .pipe(addsrc.append('public/bower_components/es6-shim/es6-shim.min'))
        .pipe(addsrc.append('public/bower_components/moment/moment.js'))
        .pipe(addsrc.append('public/bower_components/crypto-js/crypto-js.js'))
        .pipe(addsrc.append('public/bower_components/ng-file-upload/ng-file-upload-shim.js'))
        .pipe(addsrc.append('public/bower_components/ng-file-upload/ng-file-upload.js'))
        .pipe(addsrc.append('public/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.js'))
        .pipe(concat('vendors.min.js'))
        //.pipe(uglify())
        .pipe(sourcemaps.write('source-maps'))
        .pipe(gulp.dest('public/build'));
});


gulp.task('app', function () {
    return series(gulp.src('public/js/app.js'),
        gulp.src('public/js/helpers/*'),
        gulp.src('public/js/services/*'),
        gulp.src('public/js/components/*'),
        gulp.src('public/js/controllers/*'))
        .pipe(ngModuleSort())
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(babel())
        .pipe(sourcemaps.write('app-source-maps'))
        .pipe(gulp.dest('public/build'));
});

gulp.task('clean', function () {
    return $.del([path.join('public/build', '/')]);
});

gulp.task('default', ['css', 'vendor', 'app']);