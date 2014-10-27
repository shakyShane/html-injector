var compareDoms   = require("../lib/injector").compareDoms;
var stripDupes    = require("../lib/utils").removeDupes;
var stripExcluded = require("../lib/utils").removeExcluded;
var jsdom         = require("jsdom").jsdom;
var assert        = require("chai").assert;
var _             = require("lodash");
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

        var oldDom = jsdom(str1);
        var newDom = jsdom(str2);

        var diffs = stripDupes(compareDoms(oldDom, newDom));

        assert.equal(diffs.length, 1);
        assert.equal(diffs[0].tagName, "H1");
        assert.equal(diffs[0].index, "0");
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

        var oldDom = jsdom(str1);
        var newDom = jsdom(str2);

        var diffs = stripDupes(compareDoms(oldDom, newDom));

        assert.equal(diffs.length, 1);
        assert.equal(diffs[0].tagName, "BODY");
        assert.equal(diffs[0].index, "0");
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

        var oldDom = jsdom(str1);
        var newDom = jsdom(str2);

        var diffs = stripDupes(compareDoms(oldDom, newDom));

        assert.equal(diffs.length, 2);
        assert.equal(diffs[0].tagName, "SPAN");
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

        var oldDom = jsdom(str1);
        var newDom = jsdom(str2);

        var diffs = stripDupes(compareDoms(oldDom, newDom));

        assert.equal(diffs.length, 1);
        assert.equal(diffs[0].tagName, "HEAD");
        assert.equal(diffs[0].index, "0");
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

        var oldDom = jsdom(str1);
        var newDom = jsdom(str2);

        var diffs = stripDupes(compareDoms(oldDom, newDom));

        assert.equal(diffs.length, 2);
        assert.equal(diffs[0].tagName, "HEAD");
        assert.equal(diffs[1].tagName, "H1");
    });

});

describe("Removing excluded", function(){

    it("returns a filtereed list", function(){

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

        var oldDom = jsdom(str1);
        var newDom = jsdom(str2);

        var diffs = stripExcluded(stripDupes(compareDoms(oldDom, newDom)), ["H1", "H3"]);

        assert.equal(diffs.length, 1);
        assert.equal(diffs[0].tagName, "H2");
    });
});