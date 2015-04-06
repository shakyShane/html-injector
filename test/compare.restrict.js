var createDom     = require("../lib/injector").createDom;
var HtmlInjector  = require("../lib/html-injector");
var assert        = require("chai").assert;
var multiline     = require("multiline");

describe("Comparing doms with restricted selector", function () {

    var html1, html2;

    before(function () {
        html1 = multiline.stripIndent(function(){/*
         <h3>NO</h3>
         <div id="shane">
         <h1>❤ unicornsss</h1>
         <h2><span>HATE</span> unicornsssas</h2>
         <h3 class="hiddenz">Hi there</h3>
         </div>
         */});

        html2 = multiline.stripIndent(function(){/*
         <h3>NO</h3>
         <div id="shane">
         <h1>❤ unicornsss</h1>
         <h2><span>HATE</span> unicornsssas</h2>
         <h3 class="hidden">Hi there</h3>
         </div>
         */});
    });

    it("should compare correctly when no restriction given", function (done) {

        var oldDom = createDom(html1);
        var results = HtmlInjector().process(html2, oldDom);
        assert.equal(results.length, 1);
        assert.equal(results[0].restrictions, "html");
        assert.equal(results[0].index, 1);
        assert.equal(results[0].tagName, "H3");
        done();
    });

    it("should compare correctly when `id` selector given", function (done) {

        var oldDom = createDom(html1);
        var results = HtmlInjector().process(html2, oldDom, null, {restrictions: ["#shane"]});

        assert.equal(results.length, 1);
        assert.equal(results[0].restrictions, "#shane");
        assert.equal(results[0].index, 0); // should ignore outer H3
        assert.equal(results[0].tagName, "H3");

        done();
    });
});
