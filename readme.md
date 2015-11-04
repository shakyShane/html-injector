### HTML Injector [![Build Status](https://travis-ci.org/shakyShane/html-injector.svg?branch=master)](https://travis-ci.org/shakyShane/html-injector)
[Browsersync](http://www.browsersync.io/) plugin for injecting HTML changes without reloading the browser. Requires an existing page with a `<body>` tag.

## Install (Node V4.0.0 & above)

```bash
$ npm i browser-sync bs-html-injector
```

## Install (Node V0.10.x 0.12.x)

```bash
$ npm i browser-sync bs-html-injector@2
```

## Examples & Recipes including html-injection
* [Examples folder](https://github.com/shakyShane/html-injector/tree/master/examples)
* [HTML/CSS injection example](https://github.com/BrowserSync/recipes/tree/master/recipes/html.injection)
* [Grunt, SASS, HTML/CSS injection example](https://github.com/BrowserSync/recipes/tree/master/recipes/grunt.html.injection)

##Options

**files** - String|Array
File watching patterns that will trigger the injection. NOTE: Ensure you are 
not also watching the same file through the regular Browsersync
config - this will cause a full reload and the inject will not happen

```js
browserSync.use(require("bs-html-injector"), {
    files: ["app/*.html", "app/templates/**"]
});
```

**restrictions** - Array
Limit the comparisons to a certain elements.

```js
browserSync.use(require("bs-html-injector"), {
    files: "app/*.html",
    restrictions: ['#header', '#footer']
});
```

**excludedTags** - Array
When working from scratch within the `body` tag, the plugin will work just fine. But when you start
working with nested elements, you might want to add the following configuration to improve the 
injecting.

```js
browserSync.use(require("bs-html-injector"), {
    files: "app/*.html",
    excludedTags: ["BODY"]
});
```


###Example
Create a file called `bs.js` and enter the following: (update the paths to match yours)

```js
// requires version 2.0 of Browsersync or higher.
var browserSync  = require("browser-sync").create();
var htmlInjector = require("bs-html-injector");

// register the plugin
browserSync.use(htmlInjector, {
    // Files to watch that will trigger the injection
    files: "app/*.html" 
});

// now run Browsersync, watching CSS files as normal
browserSync.init({
  files: "app/styles/*.css"
});
```

###Gulp example

```js
var gulp         = require("gulp");
var browserSync  = require("browser-sync").create();
var htmlInjector = require("bs-html-injector");

/**
 * Start Browsersync
 */
gulp.task("browser-sync", function () {
    browserSync.use(htmlInjector, {
        files: "app/*.html"
    });
    browserSync.init({
        server: "test/fixtures"
    });
});

/**
 * Default task
 */
gulp.task("default", ["browser-sync"], function () {
    gulp.watch("test/fixtures/*.html", htmlInjector);
});
```

### Grunt example
```js
// This shows a full config file!
module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            files: 'app/scss/**/*.scss',
            tasks: ['bsReload:css']
        },
        sass: {
            dev: {
                files: {
                    'app/css/main.css': 'app/scss/main.scss'
                }
            }
        },
        browserSync: {
            dev: {
                options: {
                    watchTask: true,
                    server: './app',
                    plugins: [
                        {
                            module: "bs-html-injector",
                            options: {
                                files: "./app/*.html"
                            }
                        }
                    ]
                }
            }
        },
        bsReload: {
            css: "main.css"
        }
    });

    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');

    // define default task
    grunt.registerTask('default', ['browserSync', 'watch']);
};
```
