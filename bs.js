var browserSync = require("browser-sync");
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

