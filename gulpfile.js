const gulp = require('gulp');

gulp.task('build:icons', function(done) {
    // For now, we'll just copy the SVG file to the dist folder
    return gulp.src('src/nodes/SmartSuite/SmartSuite.svg')
        .pipe(gulp.dest('dist/nodes/SmartSuite/'));
}); 