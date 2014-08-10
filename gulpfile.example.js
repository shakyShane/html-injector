var gulp         = require("gulp");
var browserSync  = require("/Users/shakyshane/Sites/os-browser-sync");
var htmlInjector = require("./index");

/**
 * Start BrowserSync
 */
gulp.task("browser-sync", function () {
    browserSync.use(htmlInjector);
    browserSync({
        logLevel: "silent",
        server: "test/fixtures",
        open: false
    });
});

/**
 * Default task, inject HTML when the files change
 */
gulp.task("default", ["browser-sync"], function () {
    gulp.watch("test/fixtures/*.html", htmlInjector);
});