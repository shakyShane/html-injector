var fs     = require("fs");
var jsdom  = require("jsdom").jsdom;

var complex1  = fs.readFileSync("./test/fixtures/store-product.html", "utf-8");
var complex2  = fs.readFileSync("./test/fixtures/store-product-alt.html", "utf-8");
var simple    = fs.readFileSync("./dom1.html", "utf-8");
var simple2   = fs.readFileSync("./dom2.html", "utf-8");
var jquery    = fs.readFileSync("./jquery.js", "utf-8");

console.time("compare");

var oldDom = jsdom(complex1);
var newDom = jsdom(complex2);

var window = newDom.parentWindow;
var body = window.document.body.innerHTML;

var compare = require('dom-compare').compare;

var result = compare(oldDom, newDom);
var same = result.getResult(); // false cause' trees are different

if (!same) {

    var cldiff = result.getDifferences(); // array of diff-objects
    var reporter = require('dom-compare').GroupingReporter;
    var diffs = reporter.getDefferences(result);

    console.log("Doms don't match - here's why: ");

    var xpath = require('xpath')
        , dom = require('xmldom').DOMParser;

    var doc = new dom().parseFromString(window.document.innerHTML);


    Object.keys(diffs).forEach(function (key) {
        var nodes = xpath.select(key.toLowerCase(), doc);
        console.log("XPATH: " + key);
        console.log("Content: " + nodes.toString());
    });



} else {
    console.log("SAME");
}



//console.timeEnd("compare");

//console.time("jsdom");
//jsdom.env({
//    html: document1,
//    src: jquery,
//    done: function (err, window) {
//        var $ = window.$;
//        var match = $(".header-nav")[0].outerHTML;
//        console.timeEnd("jsdom");
//    }
//});



//console.time("regex");
//document1.replace(/(?=class="header-nav)/g, function () {
//    console.log(arguments[1]);
//    console.timeEnd("regex");
//});
