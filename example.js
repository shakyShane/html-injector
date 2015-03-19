var browserSync  = require("browser-sync");
var htmlInjector = require("./index");

browserSync.use(htmlInjector, {
    files: "test/fixtures/*.html",
    selector: [".blog-masthead", "#haderz"],
    enabled: true
    //excludedTags: ["BODY"],
    //logLevel: "debug"
});

browserSync({
    server: "test/fixtures",
    files: "test/fixtures/css/**",
    port: 3001,
    open: false
});
