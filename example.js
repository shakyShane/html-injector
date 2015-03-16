var browserSync  = require("browser-sync");
var htmlInjector = require("./index");

browserSync.use(htmlInjector, {
    files: "test/fixtures/*.html",
    //excludedTags: ["BODY"],
    //logLevel: "debug"
});

browserSync({
    server: "test/fixtures",
    files: "test/fixtures/css/**",
    open: false
});
