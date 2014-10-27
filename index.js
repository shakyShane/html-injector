/**
 *
 * HTML Injector
 *  - a BrowserSync.io plugin.
 *
 */

var _            = require("lodash");
var request      = require('request');
var merge        = require('opt-merger').merge;

var compareDoms  = require("./lib/injector").compareDoms;
var getInjector  = require("./lib/injector").getInjector;
var createDom    = require("./lib/injector").createDom;

var config       = require("./lib/config");

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
 * @module bs-html-injector.options
 * Default configuration. Everything here can be overridden
 */
var defaults = {
    /**
     *
     * Define which tags are ignored by default.
     *
     * @property excludedTags
     * @type Array
     * @default ["HTML", "HEAD"]
     */
    excludedTags: ["HTML", "HEAD"],
    /**
     * Log Level (inherits from browserSync initially, but can be overridden)
     */
    logLevel: undefined,
    /**
     * Handoff - when plugin is disabled, should the file-watching be handed
     * off to core?
     */
    handoff: true
};

/**
 * Main export, can be called when BrowserSync is running.
 * @returns {*}
 */
module.exports = function () {
    if (instance) {
        return instance.events.emit(config.PLUGIN_EVENT);
    }
};

/**
 * @param {Object} opts
 * @param {BrowserSync} bs
 */
module.exports["plugin"] = function (opts, bs) {

    instance = bs;
    opts     = opts || {};

    opts     = merge(defaults, opts, true, {});

    var logger = bs.getLogger(config.PLUGIN_NAME).info("Running...");

    if (typeof opts.logLevel !== "undefined") {
        logger.setLevel(opts.logLevel);
    }

    var url;
    var canFetchNew = true;
    var sockets     = bs.io.sockets;
    var inject      = getInjector(sockets, logger);
    var oldDom;

    bs.events.on("plugins:configure", configurePlugin.bind(null, sockets, logger));

    sockets.on("connection", function (client) {

        client.on("client:url", function (data) {

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
        });
    });

    bs.events.on("file:changed", function (data) {
        if (!enabled && opts.handoff && data._origin !== config.PLUGIN_NAME) {
            data.namespace = "core";
            data._origin = config.PLUGIN_NAME;
            bs.events.emit("file:changed", data);
            return;
        }
        if (!url || !oldDom || data.namespace !== config.PLUGIN_NAME) {
            return;
        }
        doNewRequest();
    });

    bs.events.on(config.PLUGIN_EVENT, function () {
        if (!url || !oldDom) {
            return;
        }
        doNewRequest();
    });

    function doNewRequest() {

        if (!enabled) {
            return;
        }

        logger.debug("Getting new HTML from: {magenta:%s", url);

        requestNew(url, oldDom, function (window, diffs, newDom) {
            logger.debug("Differences found, injecting...");
            inject(window, diffs);
            oldDom = newDom;
        }, opts);
    }
};

/**
 * @param diffs
 * @param excludeList
 * @returns {*}
 */
function removeExcluded(diffs, excludeList) {
    return _.filter(diffs, function (item) {
        return !_.contains(excludeList, item.tagName);
    });
}

module.exports.removeExcluded = removeExcluded;

/**
 * Request new version of Dom
 * @param {String} url
 * @param {Object} oldDom
 * @param {Object} opts - plugin options
 * @param {Function} cb
 */
function requestNew (url, oldDom, cb, opts) {

    request(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            var newDom = createDom(body);
            var diffs  = compareDoms(oldDom, newDom);
            diffs      = removeDupes(diffs);
            diffs      = removeExcluded(diffs, opts.excludedTags || defaults.excludedTags);

            if (diffs) {
                cb(newDom.parentWindow, diffs, newDom);
            }

            oldDom = newDom;
        }
    });
}

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
 * @param {Array} differences
 * @returns {Array}
 */
function removeDupes(differences) {

    return _.uniq(differences, "node");
}

module.exports.removeDupes = removeDupes;

/**
 * Not currently used... needs work.
 * @param {Array} differences
 * @returns {Array}
 */
function removeChildren(differences) {

    differences.reverse();

    var parents = [];

    differences.forEach(function (item, index) {

        var path = item.node;

        if (index === 0) {
            return parents.push(item);
        }

        parents.forEach(function (parentItem) {
            if (!_.contains(path, parentItem.node)) {
                return parents.push(item);
            }
        });
    });

    return parents;
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

