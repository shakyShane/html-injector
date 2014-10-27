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

    var url, oldDom;
    var canFetchNew = true;
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
        if (!canFetchNew || !enabled) {
            return;
        }
        url = data.url;
        request(url, function (error, response, body) {
            canFetchNew = false;
            setTimeout(function () {
                canFetchNew = true;
            }, 2000);
            logger.debug("Stashing: {magenta:%s", url);
            if (!error && response.statusCode == 200) {
                oldDom = createDom(body);
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
        if (!url || !oldDom || data.namespace !== config.PLUGIN_NAME) {
            return;
        }
        doNewRequest();
    }

    function pluginEvent () {
        if (!url || !oldDom) {
            return;
        }
        doNewRequest();
    }

    function doNewRequest() {

        if (!enabled) {
            return;
        }

        logger.debug("Getting new HTML from: {magenta:%s", url);

        requestNew(url, opts);
    }
    /**
     * Request new version of Dom
     * @param {String} url
     * @param {Object} oldDom
     * @param {Object} opts - plugin options
     * @param {Function} cb
     */
    function requestNew (url, opts) {

        request(url, function (error, response, body) {

            if (!error && response.statusCode == 200) {

                var newDom = createDom(body);
                var diffs  = compareDoms(oldDom, newDom);

                diffs      = utils.removeDupes(diffs);
                diffs      = utils.removeExcluded(diffs, opts.excludedTags);

                if (diffs) {
                    oldDom = newDom;
                    logger.debug("Differences found, injecting...");
                    inject(newDom.parentWindow, diffs);
                }
            }
        });
    }
};


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

