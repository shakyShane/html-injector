var browserSync  = require("browser-sync").create();

browserSync.init({
    server:  ["test/fixtures"],
    files:   ["test/fixtures/css/**"],
    plugins: ["bs-html-injector"]
});
