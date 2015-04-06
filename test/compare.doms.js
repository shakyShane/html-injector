var createDom     = require("../lib/injector").createDom;
var assert        = require("chai").assert;
var HtmlInjector  = require("../lib/html-injector");
var multiline     = require("multiline");

describe("Comparing Simple doms", function(){

    it("returns element index when it has different children", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1>❤ unicorns</h1>
             </body>
         </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤</span> unicorns</h1>
             </body>
         </html>
         */});

        var oldDom = createDom(str1);
        var results = HtmlInjector().process(str2, oldDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].restrictions, "html");
        assert.equal(results[0].tagName, "H1");
        assert.equal(results[0].index, "0");
    });

    it("returns element index when it has missing children", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
             </body>
         </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤</span> unicorns</h1>
             </body>
         </html>
         */});

        var oldDom = createDom(str1);
        var results = HtmlInjector().process(str2, oldDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].restrictions, "html");
        assert.equal(results[0].tagName, "BODY");
        assert.equal(results[0].index, "0");
    });

    it("Removes duplicate diffs if on same element", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤s</span> unicorns <i>What you saying?</i></h1>
             </body>
         </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
             <body>
                <h1><span>❤</span> unicorns</h1>
             </body>
         </html>
         */});

        var oldDom = createDom(str1);
        var results = HtmlInjector().process(str2, oldDom);

        assert.equal(results.length, 2);
        assert.equal(results[0].tagName, "SPAN");
        assert.equal(results[1].tagName, "H1");
    });

    it("Removes duplicate diffs if on same element", function(){

        var str1 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty cool</h1>
            </body>
            </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
                <style>
                    .hidden {}
                </style>
                <link href="style.css"></link>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty cool</h1>
            </body>
            </html>
         */});

        var oldDom = createDom(str1);
        var results = HtmlInjector().process(str2, oldDom);

        assert.equal(results.length, 1);
        assert.equal(results[0].tagName, "HEAD");
    });
    it("Returns diffs from mulitple elements", function(){

        var str1 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty cool</h1>
            </body>
            </html>
         */});
        var str2 = multiline.stripIndent(function(){/*
            <!doctype html>
            <html lang="en-US">
            <head>
                <meta charset="UTF-8">
                <title>This has a Title</title>
                <style>
                    .hidden {}
                </style>
                <link href="style.css"></link>
            </head>
            <body>
                <h1>HTML injector</h1>
                <h1 class="hidden" style="background: red;">HTML injector is prettty coolsss</h1>
            </body>
            </html>
         */});

        var oldDom = createDom(str1);
        var results = HtmlInjector().process(str2, oldDom);

        assert.equal(results.length, 2);
        assert.equal(results[0].tagName, "HEAD");
        assert.equal(results[1].tagName, "H1");
    });
});

describe("Removing excluded", function(){

    it("returns a filtered list", function(){

        var str1 = multiline.stripIndent(function(){/*
         <!doctype html>
         <html>
         <body>
         <h1>❤ unicornsss</h1>
         <h2><span>HATE</span> unicornsss</h2>
         <h3>Hi there</h3>
         </body>
         </html>
         */});
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

        var oldDom = createDom(str1);
        var results = HtmlInjector().process(str2, oldDom, null, {excludedTags: ["H1", "H3"]});


        assert.equal(results.length, 1);

        assert.equal(results[0].restrictions, "html");
        assert.equal(results[0].index, 0); // should ignore outer H3
        assert.equal(results[0].tagName, "H2");
    });
});