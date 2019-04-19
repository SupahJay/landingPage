var less = require('gulp-less');
var gulp = require('gulp');
var path = require('path');
var glob = require('glob');
var server = require('browser-sync').create();
var alert= require("node-notifier");
var fs = require('fs');
var rename = require("gulp-rename")
var csso = require('gulp-csso');
var reload = __dirname;
// todo: try make alert a function itself
//console.log(reload, path.join(__dirname, 'less', 'includes'))
//console.log(path.basename(process.cwd()))
//! https://stackoverflow.com/questions/39172536/running-npm-scripts-sequentially |||| https://stackoverflow.com/questions/36433461/how-do-i-add-a-custom-script-to-my-package-json-file-that-runs-a-javascript-file?noredirect=1&lq=1
gulp.task('less', function () {
	return gulp
		.src('**/*.less', {
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

gulp.task('sync', function (done) {
	server.init({
		server: {
			injectChanges: true,
			baseDir: './'
		},
		open: false
	});
	gulp.watch(['./**/*.html', '!./comp/*']).on('change', () => {
		updateComp();
		server.reload();
	});
	alert.notify({title:"Browser Sync",message:"Server Initiaded"})
	done();
});

gulp.task('default', gulp.series('sync', 'wless'));

function file(file) {
	return fs.readFileSync(file, {
		encoding: 'utf8'
	});
}

function tap(x) {
	console.log(x, 'tap');
	return x;
}

function updateComp(done) {
	try {
		glob('*.html', (err, items) => {
			items.forEach((individual) => {
				fs.readFile(individual, 'utf8', (err, string) => {
					if (string.search(/---[\s\S]*---/) >= 0) {
						var content = fs.readFileSync(individual, 'utf8').replace(/---[\s\S]*---/, '');

						var layout = string.match(/---[\s\S]*---/)[0].match(/layout:\s?\s?\w*/)[0].replace(/layout: ?/, '');
						var layoutFile = file('_layouts/' + layout + '.html').split(/{{\s?content\s?}}/);
						layoutFile.splice(1, 0, content);
						page = layoutFile.join('');
						page = page
							.replace(/{%-[\s\S]*?-%}/g, (x) => {
								return file(`_includes/${x.match(/\b\w*(?=.html)/)[0]}.html`);
							})
							.replace(/{{site.url}}\/landingPage/g, '..')
							.replace(/{%-[\s\S]*?-%}/g, '');

						fs.writeFile(`comp/${individual}`, page, () => {});
					}
				});
			});
		});
	} catch(err){
		notify("Error when compiling jekyll.",err)
	}
};

function notify(Title,Message){
	alert.notify({title:Title,message:Message})
}

gulp.task("minify", function(){
	return gulp.src("./*.css")
	.pipe(csso())
	.pipe(rename({suffix:".min"}))
	.pipe(gulp.dest('./'))
})