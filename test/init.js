var browserSync   = require("browser-sync");
var htmlInjector  = require("../index");
var path          = require("path");
var assert        = require("chai").assert;

describe(".plugin()", function () {
    it("should run with BrowserSync `.use()`", function (done) {
        browserSync.reset();
        browserSync.use(htmlInjector);
        browserSync({logLevel: "silent"}, function (err, bs) {
            bs.cleanup();
            done();
        });
    });
    it("should run with BrowserSync as inline plugin", function (done) {
        browserSync.reset();
        var modulepath = path.dirname(require.resolve("../index"));
        browserSync({plugins: [modulepath], logLevel: "silent"}, function (err, bs) {
            assert.equal(bs.getUserPlugins()[0].name, "HTML Injector");
            assert.isTrue(bs.getUserPlugins()[0].active);
            bs.cleanup();
            done();
        });
    });
    it("should run with BrowserSync as inline plugin with options", function (done) {
        browserSync.reset();
        var modulepath = path.dirname(require.resolve("../index"));
        var plugin = {
            module: modulepath
        };
        browserSync({plugins: [plugin], logLevel: "silent"}, function (err, bs) {
            assert.equal(bs.getUserPlugins()[0].name, "HTML Injector");
            assert.isTrue(bs.getUserPlugins()[0].active);
            bs.cleanup();
            done();
        });
    });
    it("should run when UI is disabled", function (done) {
        browserSync.reset();
        var modulepath = path.dirname(require.resolve("../index"));
        var plugin = {
            module: modulepath
        };
        browserSync({
            plugins: [plugin],
            logLevel: "silent",
            ui: false
        }, function (err, bs) {
            assert.equal(bs.getUserPlugins()[0].name, "HTML Injector");
            assert.isTrue(bs.getUserPlugins()[0].active);
            bs.cleanup();
            done();
        });
    });
});
