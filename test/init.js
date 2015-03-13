var browserSync   = require("browser-sync");
var createDom     = require("../lib/injector").createDom;
var htmlInjector  = require("../index");
var assert        = require("chai").assert;
var multiline     = require("multiline");

describe(".plugin()", function () {
    //it("should run with BrowserSync", function (done) {
    //    browserSync.use(htmlInjector);
    //    var instance = browserSync({}, done);
    //});
    //it("should respond to file:changed event", function (done) {
    //    browserSync.use(htmlInjector);
    //    var instance = browserSync({}, done);
    //});
    it.only("should respond e2e", function (done) {
        //browserSync.use(htmlInjector);
        //var instance = browserSync({}, done);
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
         <body>
         <h1>❤ unicornsss</h1>
         <h2><span>HATE</span> unicornsssas</h2>
         <h3 class="hidden">Hi there</h3>
         </body>
         </html>
         */});
        var str3 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
         <body>
         <h1>❤ unicornsss</h1>
         <h2><span>HATE</span> unicornsssas</h2>
         <h3 class="hidden">Hi there</h3>
         <p>Another</p>
         <span>Hi there</span>
         </body>
         </html>
         */});

        var dom1  = createDom(str2);
        var dom2  = createDom(str3);
        var diffs = htmlInjector.getDiffs(dom1, dom2, {excludedTags: []});

        if (diffs) {
            //oldDom = newDom;
            console.log(diffs);
        }

        done();


        //if (diffs) {
        //    logger.setOnce("useLevelPrefixes", true).warn("Setting new comparison");
        //    oldDom = newDom;
        //    logger.debug("Differences found, injecting...");
        //    inject(newDom.parentWindow, diffs);
        //}

    });
});
