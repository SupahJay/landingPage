var gulp = require('gulp');
var less = require('gulp-less');
var rename = require("gulp-rename");
var csso = require('gulp-csso');
var path = require('path');
var glob = require('glob');
var server = require('browser-sync').create();
var alert = require("node-notifier");
var Liquid = require('liquidjs');
var yalm = require('front-matter');
var fs = require('fs');
var reload = __dirname;
var engine = new Liquid({
    root:'_includes'
});
var jekyllValues = {
	site:{
		url:"../"
	},
	projects: fs.readdirSync('content/_projects/').map( file => {
		return yalm(fs.readFileSync(`content/_projects/${ file }`, 'utf8')).attributes
	})
};
function updateProjects(){
	jekyllValues.projects = fs.readdirSync('content/_projects/').map( file => {
		return yalm(fs.readFileSync(`content/_projects/${ file }`, 'utf8')).attributes
	})
}

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

gulp.task('nodeJkll',(done)=>{
    gulp.watch( '*.html', (done)=>{
		var data = yalm(fs.readFileSync('index.html', 'utf8'));
		updateProjects();
        engine
        .parseAndRender(data.body, {...jekyllValues, ...data.attributes})
        .then( x => fs.writeFile("dest/index.html", x, (c)=>console.log(c)));
        done()
    });
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
gulp.task('default', gulp.series('sync', 'wless', 'nodeJkll'));


// FUNCTIONS
function notify(Title, Message) {
	alert.notify({
		title: Title,
		message: Message
	})
}