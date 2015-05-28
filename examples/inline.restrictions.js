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
 *  2. Watch HTML files and inject the differences within your restrictions
 *
 */

var browserSync  = require("browser-sync").create();

browserSync.init({
    server:  ["app"],
    files:   ["app/css/**"],
    plugins: [
        {
            module: "bs-html-injector",
            options: {
                files: ["app/*.html"],
                restrictions: ["#blog-header"]
            }
        }
    ]
});
