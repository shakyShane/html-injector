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

    var currentUrl, oldDom;
    var canFetchNew = true;
    var opts        = htmlInjector.opts;
    var logger      = htmlInjector.logger;
    var inject      = getInjector(htmlInjector.sockets, logger);
    var latest;

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
        currentUrl = data.url;
        request(currentUrl, function (error, response, body) {
            canFetchNew = false;
            setTimeout(function () {
                canFetchNew = true;
            }, 2000);
            logger.debug("Stashing: {magenta:%s", currentUrl);
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
        if (!currentUrl || !oldDom || data.namespace !== config.PLUGIN_NAME) {
            return;
        }
        doNewRequest();
    }

    function pluginEvent () {
        if (!currentUrl || !oldDom) {
            return;
        }
        doNewRequest();
    }

    function doNewRequest() {

        if (!enabled) {
            return;
        }

        logger.debug("Getting new HTML from: {magenta:%s", currentUrl);

        requestNew(currentUrl, opts);
    }
    /**
     * Request new version of Dom
     * @param {String} url
     * @param {Object} opts - plugin options
     */
    function requestNew (url, opts) {

        request(url, function (error, response, body) {

            if (!error && response.statusCode == 200) {

                var newDom = createDom(body);
                var diffs  = getDiffs(newDom, oldDom, opts);

                if (diffs) {
                    logger.setOnce("useLevelPrefixes", true).warn("Setting new comparison");
                    logger.debug("Differences found, injecting...");
                    inject(newDom.parentWindow, diffs, currentUrl);
                    handleUrlEvent({url: currentUrl});
                }
            }
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

