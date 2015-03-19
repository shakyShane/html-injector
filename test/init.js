var browserSync   = require("browser-sync");
var createDom     = require("../lib/injector").createDom;
var htmlInjector  = require("../index");
var assert        = require("chai").assert;
var multiline     = require("multiline");

describe(".plugin()", function () {
    //it("should run with BrowserSync `.use()`", function (done) {
    //    browserSync.reset();
    //    browserSync.use(htmlInjector);
    //    browserSync({logLevel: "silent"}, function (err, bs) {
    //        bs.cleanup();
    //        done();
    //    });
    //});
    //it("should run with BrowserSync as inline plugin", function (done) {
    //    browserSync.reset();
    //    var path = require.resolve("../index");
    //    browserSync({plugins: [path], logLevel: "silent"}, function (err, bs) {
    //        assert.equal(bs.getUserPlugins()[0].name, "HTML Injector");
    //        assert.isTrue(bs.getUserPlugins()[0].active);
    //        bs.cleanup();
    //        done();
    //    });
    //});
    //it("should run with BrowserSync as inline plugin with options", function (done) {
    //    browserSync.reset();
    //    var path = require.resolve("../index");
    //    var config = {};
    //    config[path] = {name: "shane"};
    //    browserSync({plugins: [config], logLevel: "silent"}, function (err, bs) {
    //        assert.equal(bs.getUserPlugins()[0].name, "HTML Injector");
    //        assert.isTrue(bs.getUserPlugins()[0].active);
    //        bs.cleanup();
    //        done();
    //    });
    //});
    it.only("should run with BrowserSync as inline plugin with options", function (done) {

    });
});
