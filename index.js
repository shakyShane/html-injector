var _           = require("lodash");
var jsdom       = require("jsdom").jsdom;
var request     = require('request');

var PLUGIN_NAME = "HTML Injector";

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
                        oldDom = jsdom(body);
                    }
                });
            });
        });

        bs.events.on("file:changed", function (data) {

            if (!url) {
                return;
            }

            if (data.namespace !== PLUGIN_NAME) {
                return;
            }

            if (!oldDom) {
                return;
            }

            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var newDom = jsdom(body);
                    inject(oldDom, newDom);
                    oldDom = newDom;
                }
            });
        });
    }
};

/**
 * @param {Socket.io} sockets
 * @param {Object} opts - plugin options
 * @returns {Function}
 */
function getInjector(sockets, opts) {

    var count = 0;
    var excludeList = opts.excludedTags || ["HTML", "HEAD", "BODY"];

    return function (oldDom, newDom) {

        var window      = newDom.parentWindow;
        var compare = require('dom-compare').compare;

        var result = compare(oldDom, newDom, {formatFailure: function (failure, node) {
            var allElems    = node.ownerDocument.getElementsByTagName(node.nodeName);
            failure.index   = Array.prototype.indexOf.call(allElems, node);
            failure.tagName = node.nodeName;
            return failure;
        }});

        var same = result.getResult(); // false cause' trees are different

        if (!same) {

            var cldiff = result.getDifferences(); // array of diff-objects

            var added = [];

            cldiff.forEach(function (item) {

                var alreadyAdded = added.some(function (addedItem) {
                    return addedItem.tagName === item.tagName && addedItem.index === item.index;
                });

                if (!_.contains(excludeList, item.tagName) && !alreadyAdded) {

                    count += 1;

                    added.push(item);

                    var element = window.document.getElementsByTagName(item.tagName)[item.index];

                    var elemAttrs = {};

                    for (var attr, i=0, attrs=element.attributes, l=attrs.length; i<l; i++){
                        attr = attrs.item(i)
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
                }
            });
        }
    }
}
