var gulp = require('gulp'),
	bump =  require('gulp-bump'),
	notify = require('gulp-notify'),
	browserSync = require("browser-sync"),
	plumber = require('gulp-plumber'),
	swig = require('gulp-swig'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'),
	sass = require('gulp-sass'),
	minifyCSS = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	vendor = require('gulp-concat-vendor')
	inject = require("gulp-inject"),
	minifyHtml = require('gulp-minify-html'),
	ngHtml2Js = require('gulp-ng-html2js'),
	ngAnnotate = require('gulp-ng-annotate'),
	templateCache = require('gulp-angular-templatecache'),
	p = require('./package.json'),
	src = {
		root: 'src/',
		styles: 'src/common/styles/main.scss',
		scripts: ['src/vendor/angular/*.min.js',
				      'src/vendor/angular-sanitize/angular-sanitize.min.js',
              'src/vendor/angular-material/angular-material.min.js',
		          'src/app.js',
		          'src/common/scripts/**/*.js',
		          'src/modules/**/*.js'],
		vendor: 'src/vendor/'
	},
	dist = {
		root: 'dist/',
		assets: 'dist/assets/'
	};


// =============================================================================
// BROWSER SYNC
// =============================================================================

gulp.task('browser-sync', function() {
    browserSync({
    	notify: false,
        server: {
	        baseDir: dist.root,
        },
        middleware: function (req, res, next) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			next();
		}
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});


// =============================================================================
// CLEAN
// =============================================================================

gulp.task('clean', function() {
	return gulp.src(dist.root)
	.pipe(plumber())
	.pipe(clean());
});

gulp.task('clean-scripts', function () {
  return gulp.src(dist.assets, {read: false})
    .pipe(plumber())
    .pipe(clean());
});

gulp.task('clean-styles', function () {
  return gulp.src(dist.assets+'main-*.css', {read: false})
    .pipe(plumber())
    .pipe(clean());
});


// =============================================================================
// SASS COMPILER - minifying pipes are commented out
// =============================================================================

gulp.task('styles', ['clean-styles'], function() {
	return gulp.src(src.styles)
		.pipe(plumber())
		.pipe(sourcemaps.init())
			.pipe(sass())
			.pipe(rename({ suffix: '-'+p.version+'.min' }))
		.pipe(minifyCSS())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(dist.assets))
		.pipe(browserSync.reload({stream:true}))
		.pipe(notify({ message: "Sass has been compiled."}));
});


// =============================================================================
// JAVASCRIPT COMPRESSORS
// =============================================================================

gulp.task('app-scripts', function() {
	return gulp.src(['!src/vendor/**/*.js', 'src/**/*.js'])
	.pipe(plumber())
	.pipe(sourcemaps.init())
		.pipe(concat('app-'+p.version+'.min.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
	.pipe(sourcemaps.write('./maps'))
	.pipe(gulp.dest(dist.assets))
	.pipe(browserSync.reload({stream:true}))
	.pipe(notify({ message: "App JavaScript has been compressed."}));
});

gulp.task('vendor-scripts', function() {
    return gulp.src(['!src/vendor/jquery','!src/vendor/bootstrap-sass-official','src/vendor/*'])
        .pipe(vendor('vendor-'+p.version+'.min.js'))
		.pipe(plumber())
		.pipe(sourcemaps.init())
		//.pipe(uglify())
		.pipe(ngAnnotate())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(dist.assets))
		.pipe(browserSync.reload({stream:true}))
		.pipe(notify({ message: "Vendor JavaScript has been compressed."}));
});


// =============================================================================
// JSHINT
// =============================================================================

gulp.task('lint', function() {
  return gulp.src(src.root+'**/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// =============================================================================
// BUMP - change version numbers
// =============================================================================

gulp.task('bumpPatch', function() { //  0.0.1
	gulp.src('./*.json')
	.pipe(plumber())
	.pipe(bump())
	.pipe(gulp.dest('./'));
});

gulp.task('bumpMinor', function() { //  0.1.0
	gulp.src('./*.json')
	.pipe(plumber())
	.pipe(bump({type:'minor'}))
	.pipe(gulp.dest('./'));
});

gulp.task('bumpMajor', function() { //  1.0.0
	gulp.src('./*.json')
	.pipe(plumber())
	.pipe(bump({type:'major'}))
	.pipe(gulp.dest('./'));
});

gulp.task('bumpReset', function() {
	gulp.src('./*.json')
	.pipe(plumber())
	.pipe(bump({version:'0.0.0'}))
	.pipe(gulp.dest('./'));
});


// =============================================================================
// INDEX
// =============================================================================

gulp.task('index', function () {
  var target = gulp.src(src.root+'index.html')
  					.pipe(rename("index.html"));
  var version = p.version;
  var sources = gulp.src([dist.assets+'vendor-'+version+'.min.js', dist.assets+'app-'+version+'.min.js', dist.assets+'partials-'+version+'.min.js',
  						  dist.assets+'main-'+version+'.min.css'], {read: false});
  var options = {
		relative: false,
		ignorePath: 'dist/',
		addRootSlash: true
	}
  target.pipe(plumber()).pipe(inject(sources, options))
  	.pipe(gulp.dest(dist.root));
});

gulp.task('partials', function() {
	gulp.src(['src/common/**/*.html','src/modules/**/*.html'])
		.pipe(plumber())
		.pipe(templateCache({standalone:true}))
		.pipe(concat('partials-'+p.version+'.min.js'))
		.pipe(gulp.dest('dist/assets'));
});

gulp.task('assets', function() {
  gulp.src(src.root+'common/images/**/*')
  .pipe(plumber())
  .pipe(gulp.dest(dist.assets+'images/'));
  gulp.src(src.root+'common/data/**/*')
  .pipe(plumber())
  .pipe(gulp.dest(dist.assets+'data/'));
  gulp.src(src.root+'common/fonts/**/*')
  .pipe(plumber())
  .pipe(gulp.dest(dist.assets+'fonts/'));
});


// =============================================================================
// WATCH - watches whatever files are listed and runs the associated task if those files change.
// =============================================================================

gulp.task('watch', function() {
	gulp.watch(["src/**/*.scss"], ["styles"]);
	gulp.watch(["src/**/*.js"], ["app-scripts"]);
	gulp.watch(["src/**/*.html"], ["index", "partials", "bs-reload"]);
});


// =============================================================================
// DEFAULT TASK - what gets run when you type 'gulp' into command line
// =============================================================================

gulp.task('default', ['styles', 'vendor-scripts', 'app-scripts', 'partials', 'assets'], function() {
	gulp.start("index", 'browser-sync', "watch" );
});
