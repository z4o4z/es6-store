var
  gulp        = require('gulp'),
  uglify      = require('gulp-uglify'),
  rename      = require('gulp-rename'),
  babel       = require('gulp-babel'),
  sourcemaps  = require('gulp-sourcemaps');

/**
 *	JS
 */

gulp.task('build-js',  function ( )
{
  return gulp.src("src/Store.js")
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest("dist/"))
    .pipe(uglify())
    .pipe(rename("Store.min.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/"));
});

/**
 *	Build & watch
 */

gulp.task('build', ['build-js']);

gulp.task('watch', function () {
  gulp.watch("src/Store.js", ['build-js']);
});

gulp.task('default', ['build', 'watch']);