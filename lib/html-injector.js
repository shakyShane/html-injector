var defaults = require("./default-config");
var config   = require("./config");
var _        = require("lodash");
var merge    = require('opt-merger').merge;

var HtmlInjector = function (opts, bs) {

    var html = this;

    html.bs      = bs;
    html.sockets = bs.io.sockets;
    html.opts    = merge(defaults, opts || {}, true, {});
    html.events  = bs.events;
    html.cache   = {};

    html.logger = bs.getLogger(config.PLUGIN_NAME).info("Running...");

    if (typeof html.opts.logLevel !== "undefined") {
        html.logger.setLevel(opts.logLevel);
    }

    if (_.isUndefined(html.opts.enabled)) {
        html.opts.enabled = true;
    }

    /**
     * @returns {Number}
     */
    html.hasCached = function () {
        return Object.keys(html.cache).length;
    };
};

module.exports = HtmlInjector;