[![Stories in Ready](https://badge.waffle.io/shakyShane/html-injector.png?label=ready&title=Ready)](https://waffle.io/shakyShane/html-injector)
###HTML Injector [![Build Status](https://travis-ci.org/shakyShane/html-injector.svg?branch=master)](https://travis-ci.org/shakyShane/html-injector)
[BrowserSync](http://www.browsersync.io/) plugin for injecting HTML changes without reloading the browser. Requires an existing page with a `<body>` tag.

##Install 

```bash
$ npm install browser-sync bs-html-injector
```

###Example
Create a file called `bs.js` and enter the following: (update the paths to match yours)

```js
// requires version 1.3.4 of BrowserSync or higher.
var browserSync  = require("browser-sync");
var htmlInjector = require("bs-html-injector");


// register the plugin
browserSync.use(htmlInjector, {
    // Files to watch that will trigger the injection
    files: "app/*.html" 
});

// now run BrowserSync, watching CSS files as normal
browserSync({
  files: "app/styles/*.css"
});
```

###Gulp example

```js
var gulp         = require("gulp");
var browserSync  = require("browser-sync");
var htmlInjector = require("bs-html-injector");

/**
 * Start BrowserSync
 */
gulp.task("browser-sync", function () {
    browserSync.use(htmlInjector, {});
    browserSync({
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

##Options

**files** - String|Array
File watching patterns that will trigger the injection

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
