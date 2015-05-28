/**
 *
 * Install:
 *      npm install browser-sync bs-html-injector
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server & use the `app` directory as the root
 *
 *  1. Watch all css files and inject when they change
 *  2. Watch HTML files and inject the difference when they change
 *
 */

var browserSync  = require("browser-sync").create();
var htmlInjector = require("bs-html-injector");

/**
 * Register the plugin
 */
browserSync.use(htmlInjector);

/**
 * Watch *.html files and trigger injection when they change
 */
browserSync.watch("app/*.html").on("change", function () {
    htmlInjector();
});

/**
 * Run the Server
 */
browserSync.init({
    server:  ["app"],
    files:   ["app/css/**"]
});


