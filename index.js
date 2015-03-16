/**
 *
 * HTML Injector
 *  - a BrowserSync.io plugin.
 *
 */

var events       = require('events');
var emitter      = new events.EventEmitter();
var _            = require("lodash");
var request      = require('request');

var compareDoms  = require("./lib/injector").compareDoms;
var getInjector  = require("./lib/injector").getInjector;
var createDom    = require("./lib/injector").createDom;

var HtmlInjector = require("./lib/html-injector");
var config       = require("./lib/config");
var utils        = require("./lib/utils");

/**
 * ON/OFF flag
 * @type {boolean}
 */
var enabled = true;

/**
 * Instance of HTML Injector
 */
var instance;

/**
 * Main export, can be called when BrowserSync is running.
 * @returns {*}
 */
module.exports = function () {
    if (instance) {
        return emitter.emit(config.PLUGIN_EVENT);
    }
};

/**
 * @param {Object} opts
 * @param {BrowserSync} bs
 */
module.exports["plugin"] = function (opts, bs) {

    var htmlInjector = instance = new HtmlInjector(opts, bs);

    var opts        = htmlInjector.opts;
    var logger      = htmlInjector.logger;
    var inject      = getInjector(htmlInjector.sockets, logger);

    /**
     * Configure event
     */
    bs.events.on("plugins:configure", configurePlugin.bind(null, htmlInjector.sockets, logger));

    /**
     * File changed event
     */
    bs.events.on("file:changed", fileChangedEvent);

    /**
     * Internal event
     */
    emitter.on(config.PLUGIN_EVENT, pluginEvent);

    /**
     * Socket Connection event
     */
    htmlInjector.sockets.on("connection", handleSocketConnection);

    /**
     * Catch the above ^
     */
    function handleSocketConnection (client) {
        client.on("client:url", handleUrlEvent);
    }

    /**
     * @param data
     */
    function handleUrlEvent (data) {

        if (!enabled) {
            return;
        }

        request(data.url, function (error, response, body) {

            logger.debug("Stashing: {magenta:%s", data.url);

            if (!error && response.statusCode == 200) {
                var page = createDom(body);
                htmlInjector.cache[data.url] = page;
            }
        });
    }

    function fileChangedEvent (data) {

        if (!enabled && opts.handoff && data._origin !== config.PLUGIN_NAME) {
            data.namespace = "core";
            data._origin = config.PLUGIN_NAME;
            htmlInjector.events.emit("file:changed", data);
            return;
        }

        requestNew({});
    }

    function pluginEvent () {
        if (!htmlInjector.hasCached()) {
            return;
        }
        doNewRequest();
    }

    function doNewRequest() {

        if (!enabled || !htmlInjector.hasCached()) {
            return;
        }

        logger.debug("Getting new HTML from: {magenta:%s} urls", Object.keys(htmlInjector.cache).length);

        requestNew(opts);
    }
    /**
     * Request new version of Dom
     * @param {String} url
     * @param {Object} opts - plugin options
     */
    function requestNew (opts) {

        // Remove any
        var valid = bs.io.of(bs.options.getIn(["socket", "namespace"])).sockets.map(function (client) {
            return client.handshake.headers.referer;
        });

        logger.debug("Cache items: {yellow:%s", Object.keys(htmlInjector.cache).length);

        Object.keys(htmlInjector.cache).forEach(function (url) {

            if (valid.indexOf(url) === -1) {
                delete htmlInjector.cache[url];
                return;
            }

            request(url, function (error, response, body) {

                if (!error && response.statusCode == 200) {

                    var newDom = createDom(body);
                    var diffs  = getDiffs(newDom, htmlInjector.cache[url], opts);

                    if (diffs.length) {
                        inject(newDom.parentWindow, diffs, url);
                        htmlInjector.cache[url] = createDom(body);
                    }
                }
            });
        });
    }
};

/**
 * @param newDom
 * @param oldDomObject
 * @param opts
 * @returns {*}
 */
function getDiffs(newDom, oldDomObject, opts) {

    var diffs  = compareDoms(oldDomObject, newDom);
    diffs      = utils.removeDupes(diffs);
    diffs      = utils.removeExcluded(diffs, opts.excludedTags);

    return diffs;
}

module.exports.getDiffs = getDiffs;

/**
 * Reload browsers
 * @param sockets
 * @param logger
 * @param data
 */
function configurePlugin (sockets, logger, data) {

    var msg = "{cyan:Enabled";

    if (!data.active) {
        msg = "{yellow:Disabled";
    } else {
        sockets.emit("browser:reload");
    }

    logger.info(msg);

    enabled = data.active;
}

/**
 * Client JS hook
 * @returns {String}
 */
module.exports.hooks = {
    "client:js": require("fs").readFileSync(__dirname + "/client.js", "utf-8")
};

/**
 * Plugin name.
 * @type {string}
 */
module.exports["plugin:name"] = config.PLUGIN_NAME;

