var browserSync   = require("browser-sync");
var htmlInjector  = require("../index");
var assert        = require("chai").assert;

describe(".plugin()", function () {
    it("should run with BrowserSync", function (done) {
        browserSync.use(htmlInjector);
        var instance = browserSync({}, function () {
            instance.cleanup();
            done();
        });
    });
    it("should respond to file:changed event", function () {
        browserSync.use(htmlInjector);
        var instance = browserSync({}, function () {
            instance.cleanup();
            done();
        });
    });
});
