var _           = require("lodash");
var jsdom       = require("jsdom").jsdom;
var request     = require('request');

var PLUGIN_NAME = "HTML Injector";

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
     * @default ["HTML", "HEAD", "BODY"]
     */
    excludedTags: ["HTML", "HEAD", "BODY"]
};

module.exports = {

    /**
     * Plugin name
     */
    name: PLUGIN_NAME,

    /**
     * Client JS hook
     * @returns {*}
     */
    "client:js": function () {
        return require("fs").readFileSync(__dirname + "/client.js");
    },

    /**
     * @param {BrowserSync} bs
     * @param opts
     */
    plugin: function (bs, opts) {

        var url;
        var sockets     = bs.io.sockets;
        var inject      = getInjector(sockets, opts);
        var oldDom;

        sockets.on("connection", function (client) {

            client.on("client:url", function (data) {

                url = data.url;
                request(url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        oldDom = createDom(body);
                    }
                });
            });
        });

        bs.events.on("file:changed", function (data) {
            if (!url || !oldDom || data.namespace !== PLUGIN_NAME) {
                return;
            }
            doNewRequest();
        });

        bs.events.on("plugin:html:inject", function () {
            if (!url || !oldDom) {
                return;
            }
            doNewRequest();
        });

        function doNewRequest() {
            requestNew(url, oldDom, function (window, diffs, newDom) {
                inject(window, diffs);
                oldDom = newDom;
            }, opts);
        }

    }
};

/**
 * @param diffs
 * @param excludeList
 * @returns {*}
 */
function removeExcluded(diffs, excludeList) {
    return diffs.filter(function (item) {
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
//            diffs      = removeChildren(diffs); // unreliable right now
            diffs      = removeExcluded(diffs, opts.excludedTags || defaults.excludedTags);

            if (diffs) {
                cb(newDom.parentWindow, diffs, newDom);
            }

            oldDom = newDom;
        }
    });
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
 * Because we replace the HTML of elements, differences of children are irrelevant
 * so we don't bother with them.
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

module.exports.stripDupes = removeDupes;


/**
 * Compare two DOMS
 * @param {Object} newDom
 * @param {Object} oldDom
 * @returns {*}
 */
function compareDoms(oldDom, newDom) {

    var window      = newDom.parentWindow;
    var compare = require('./node_modules/dom-compare').compare;

    var result = compare(oldDom, newDom, {
        formatFailure: function (failure, node) {
            var allElems    = node.ownerDocument.getElementsByTagName(node.nodeName);
            failure.index   = Array.prototype.indexOf.call(allElems, node);
            failure.tagName = node.nodeName;
            return failure;
        }
    });

    var same = result.getResult(); // false cause' trees are different

    if (!same) {
        return result.getDifferences(); // array of diff-objects
    }
}

module.exports.compareDoms = compareDoms;

/**
 * @param string
 * @returns {*}
 */
function createDom(string) {
    return jsdom(string);
}

/**
 * @param {Socket.io} sockets
 * @returns {Function}
 */
function getInjector(sockets) {

    return function (window, diffs) {

        diffs.forEach(function (item) {

            var element = window.document.getElementsByTagName(item.tagName)[item.index];

            var elemAttrs = {};

            for (var attr, i=0, attrs=element.attributes, l=attrs.length; i<l; i++){
                attr = attrs.item(i);
                elemAttrs[attr.nodeName] = attr.nodeValue
            }

            if (element) {
                sockets.emit("html:inject", {
                    html: element.innerHTML,
                    tagName: item.tagName,
                    index: item.index,
                    cssText: element.style.cssText,
                    attrs: elemAttrs
                });
            }
        });
    }
}
