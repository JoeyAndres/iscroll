var path = require('path'),
    gulp = require('gulp'),
    less = require('gulp-less'),
    rename = require("gulp-rename"),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    babel = require("gulp-babel");

var paths = {
    js: ['./src/**/*.js'],
    meteor_js: ['./build/**/*.js']
};

// JS section.
gulp.task('js', function() {
    gulp.src(['./src/iscroll.js', './src/iscroll-lite.js', './src/iscroll-zoom.js'])
        .pipe(browserify())
        .pipe(babel({
            compact: false
        }))
        .pipe(gulp.dest('./build'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./build'));
});

gulp.task('meteor-js', function() {
    gulp.src('./build/iscroll.js')
        .pipe(gulp.dest('./meteor-packages/iscroll'));
    gulp.src('./build/iscroll-lite.js')
        .pipe(gulp.dest('./meteor-packages/iscroll-lite'));
    gulp.src('./build/iscroll-zoom.js')
        .pipe(gulp.dest('./meteor-packages/iscroll-zoom'));
});

// Watcher section.
gulp.task('watchers', function () {
    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.meteor_js, ['meteor-js']);
});

gulp.task('default', ['js', 'meteor-js', 'watchers']);