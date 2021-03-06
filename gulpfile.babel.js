var gulp = require('gulp'),
    del = require('del'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    eslint = require('gulp-eslint'),
    header = require('gulp-header'),
    pkg = require('./package.json'),
    mocha = require('gulp-mocha'),
    webserver = require('gulp-webserver');
    
var babelPlugins = [
  'check-es2015-constants',
  'transform-es2015-arrow-functions',
  'transform-es2015-block-scoping',
  ['transform-es2015-classes', {loose: true}],
  'transform-es2015-parameters',
  'transform-es2015-template-literals',
  'transform-es2015-modules-umd'
];

var paths = {
  scripts: ['src/**/justgiving-apiclient.js'],
  tests: ['tests/**/*.js']
};

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('clean', cb => del('./dist/justgiving-apiclient*', cb) );

gulp.task('build', ['build-full'], () =>
  gulp.src('dist/justgiving-apiclient.js')
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest('dist'))
);

gulp.task('build-full', ['lint', 'clean'], () => 
  gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(babel({plugins: babelPlugins, moduleId: 'JustGiving'}))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
);

gulp.task('watch', () => {
  gulp.watch(paths.scripts, ['test']);
  gulp.watch(paths.tests, ['test']);
});

gulp.task('lint', () =>
  gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
);

gulp.task('test', ['build'], () =>
  gulp.src(['tests/*.js', 'dist/justgiving-apiclient.js'], { read: false })
    .pipe(mocha())
);

gulp.task('webserver', () => {
  // eg http://localhost:8000/examples/method-samples.html or http://localhost:8000/examples/chained.knockout.html
  gulp.src('.')
    .pipe(webserver({
      livereload: true,
      directoryListing: true
    }));
});

gulp.task('default', ['watch', 'test', 'webserver'], () => {});
