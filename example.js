var browserSync = require("/Users/shakyshane/Sites/os-browser-sync");
var htmlInjector = require("./index");

browserSync.use(htmlInjector, {
    files: "test/fixtures/*.html",
    excludedTags: ["BODY"]
});
browserSync({
    logLevel: "debug",
    server: "test/fixtures",
    open: false
});

