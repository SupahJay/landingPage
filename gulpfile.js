var gulp = require('gulp');
var less = require('gulp-less');
var rename = require("gulp-rename");
var csso = require('gulp-csso');
var path = require('path');
var pug = require('gulp-pug');
var glob = require('glob');
var server = require('browser-sync').create();
var alert = require("node-notifier");
var fs = require('fs');
var reload = __dirname;

// TASKS
gulp.task('less', function () {
	return gulp
		.src('**/styles.less', {
			base: './'
		})
		.pipe(
			less({
				paths: [path.join(__dirname, 'less', 'includes')]
			})
		)
		.pipe(gulp.dest('.'))
		//.pipe(server.stream());
		.pipe(server.reload({
			stream: true
		}));
});

gulp.task('wless', (done) => {
	gulp.watch('./**/*.less', gulp.series('less'));
	done();
});

gulp.task('pug',(done)=>{
	gulp.watch( '*.pug', ()=>{return gulp.src('*.pug').pipe(pug()).pipe(gulp.dest('./'))});
	done()
})

gulp.task('sync', function (done) {
	server.init({
		server: {
			injectChanges: true,
			baseDir: './'
		},
		open: false
	});
	gulp.watch(['./**/*.html', '!./dest/*']).on('change', () => {
		server.reload();
	});
	notify("Browser Sync", "Server Initiaded");
	done();
});

gulp.task("minify", function () {
	return gulp.src("./*.css")
		.pipe(csso())
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(gulp.dest('./'))
})

// DEFAULT
gulp.task('default', gulp.series('sync', 'wless'));


// FUNCTIONS
function notify(Title, Message) {
	alert.notify({
		title: Title,
		message: Message
	})
}