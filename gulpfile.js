var path = require('path'),
    gulp = require('gulp'),
    less = require('gulp-less'),
    rename = require("gulp-rename"),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    babel = require("gulp-babel");

var paths = {
    js: ['./src/**/*.js']
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

// Watcher section.
gulp.task('watchers', function () {
    gulp.watch(paths.js, ['js']);
});

gulp.task('default', ['js', 'watchers']);