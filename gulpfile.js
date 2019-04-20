var Liquid = require('liquidjs');
var gulp = require('gulp');
var yalm = require('front-matter');
var fs = require('fs');
var engine = new Liquid({
    root:'_includes'
});

gulp.task( 'default', (done)=>{
    gulp.watch( '*.html', (done)=>{
        var data = yalm(fs.readFileSync('index.html', 'utf8'));
        engine
        .parseAndRender(data.body, data.attributes)
        .then( x => fs.writeFile("dest/index.html", x, (c)=>console.log(c)));
        done()
    });
    done()
})
