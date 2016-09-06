/**
 *
 * HTML Injector
 *  - a BrowserSync.io plugin.
 *
 */

var events       = require('events');
var emitter      = new events.EventEmitter();
var request      = require('request');
var debug        = require('debug')('bs-html-injector');
var createDom    = require("./lib/injector").createDom;

var HtmlInjector = require("./lib/html-injector");
var config       = require("./lib/config");
var _            = require("./lodash.custom");

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

    opts = opts || {};

    var logger       = bs.getLogger(config.PLUGIN_NAME).info("Running...");

    if (typeof opts.logLevel !== "undefined") {
        logger.setLevel(opts.logLevel);
    }

    var htmlInjector = instance = new HtmlInjector(opts, logger, bs);
    var opts         = htmlInjector.opts;
    var clients      = bs.io.of(bs.options.getIn(["socket", "namespace"]));

    if (bs.ui) {
        addUiEvents();
    }

    /**
     * Add UI events if running
     */
    function addUiEvents () {

        var ui = bs.io.of(bs.ui.config.getIn(["socket", "namespace"]));

        bs.ui.listen(config.PLUGIN_NAME, {
            "restriction:add": function (data) {
                opts.restrictions = _.uniq(opts.restrictions.concat([data]));
                updateOptions(opts);
            },
            "restriction:remove": function (data) {
                opts.restrictions = _.without(opts.restrictions, data);
                updateOptions(opts);
            }
        });

        function updateOptions (opts) {
            bs.events.emit("plugins:opts", {
                name: config.PLUGIN_NAME,
                opts: opts
            });
            ui.emit("options:update", {
                name: config.PLUGIN_NAME,
                opts: bs.getUserPlugin(config.PLUGIN_NAME).opts
            });
        }
    }

    enabled = htmlInjector.opts.enabled;

    /**
     * Configure event
     */
    bs.events.on("plugins:configure", function (data) {

        if (data.name !== config.PLUGIN_NAME) {
            return;
        }

        var msg = "{cyan:Enabled";

        if (!data.active) {
            msg = "{yellow:Disabled";
        } else {
            clients.emit("browser:reload");
        }

        logger.info(msg);

        enabled = data.active;
    });

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
    clients.on("connection", handleSocketConnection);

    /**
     * Catch the above ^
     */
    function handleSocketConnection (client) {
        client.on("client:url", handleUrlEvent);
    }

    function getRequestOptions(url) {
        return {
            url: url,
            headers: {
                "Accept": "text/html"
            }
        }
    }

    /**
     * @param data
     */
    function handleUrlEvent (data) {

        if (!enabled) {

            return;
        }

        request(getRequestOptions(data.url), function (error, response, body) {

            logger.debug("Stashing: {magenta:%s", data.url);

            if (!error && response.statusCode == 200) {
                htmlInjector.cache[data.url] = createDom(body);
            }
        });
    }

    function fileChangedEvent (data) {

        if (!_.isUndefined(data.event) && data.event !== "change") {
            return;
        }

        if (!enabled) {

            if (opts.handoff && data._origin !== config.PLUGIN_NAME) {
                data.namespace = "core";
                data._origin = config.PLUGIN_NAME;
                bs.events.emit("file:changed", data);
            }

            return;
        }

        if (data.namespace !== config.PLUGIN_NAME) {
            debug('Ignoring file change to ', data.path);
            return;
        }

        debug('Responding to file change event', data.namespace);

        requestNew(opts);
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
        var sockets = bs.io.of(bs.options.getIn(["socket", "namespace"])).sockets;
        var valid = Object.keys(sockets).map(function (key) {
            return sockets[key].handshake.headers.referer;
        });

        logger.debug("Cache items: {yellow:%s", Object.keys(htmlInjector.cache).length);

        Object.keys(htmlInjector.cache).forEach(function (url) {

            if (valid.indexOf(url) === -1) {
                delete htmlInjector.cache[url];
                return;
            }

            debug("requesting %s", url);

            request(getRequestOptions(url), function (error, response, body) {

                if (!error && response.statusCode == 200) {

                    var tasks = htmlInjector.process(body, htmlInjector.cache[url], url, opts);

                    if (tasks.length) {
                        debug("%s tasks returned", tasks.length);
                        tasks.forEach(function (task) {
                            debug("Task: TAG: %s, INDEX: %s", task.tagName, task.index);
                            clients.emit(config.CLIENT_EVENT, task);
                        });
                    } else {
                        debug("0 tasks returned, reloading instead");
                        clients.emit("browser:reload");
                    }
                }
            });
        });
    }
};

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

