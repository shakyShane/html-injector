var defaults = require("./default-config");
var config   = require("./config");
var merge    = require('opt-merger').merge;

var HtmlInjector = function (opts, bs) {

    this.bs      = bs;
    this.sockets = bs.io.sockets
    this.opts    = merge(defaults, opts || {}, true, {});
    this.events  = bs.events;

    this.logger = bs.getLogger(config.PLUGIN_NAME).info("Running...");

    if (typeof this.opts.logLevel !== "undefined") {
        this.logger.setLevel(opts.logLevel);
    }
};

module.exports = HtmlInjector;