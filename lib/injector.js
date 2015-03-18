var config       = require("./config");
var _            = require("lodash");


require("jsdom").defaultDocumentFeatures = {
    FetchExternalResources: false,
    ProcessExternalResources: false
};

var jsdom        = require("jsdom").jsdom;
var compare      = require('dom-compare-temp').compare;
var emitCount    = 0;

/**
 * Compare two DOMS & return diffs
 * @param {Object} newDom
 * @param {Object} oldDom
 * @returns {Object}
 */
function compareDoms(oldDom, newDom, opts) {

    opts          = opts || {};

    if (!opts.selector.length) {
        opts.selector.push('html');
    }

    var diffs = [];

    if (!oldDom || !newDom) {
        return diffs;
    }

    opts.selector.forEach(function (selector) {

        var dom1, dom2;

        if (selector !== "html") {
            var match1 = oldDom.querySelectorAll(selector);
            var match2 = newDom.querySelectorAll(selector);
            if (match1.length && match2.length) {
                dom1 = createDom(match1[0].outerHTML);
                dom2 = createDom(match2[0].outerHTML);
            }
        } else {
            dom1 = oldDom;
            dom2 = newDom;
        }

        if (!dom1 || !dom2) {
            return;
        }

        var result = compare(dom1, dom2, {
            formatFailure: function (failure, node) {
                var allElems    = node.ownerDocument.getElementsByTagName(node.nodeName);
                failure.index   = Array.prototype.indexOf.call(allElems, node);
                failure.tagName = node.nodeName;
                return failure;
            }
        });

        var same = result.getResult(); // false cause' trees are different

        if (!same) {
            diffs.push({
                selector: selector,
                diffs:    result.getDifferences()
            });
        }
    });

    return diffs;
}

module.exports.compareDoms = compareDoms;

/**
 * @param string
 * @returns {*}
 */
function createDom(string) {
    return jsdom(string);
}

module.exports.createDom = createDom;

/**
 * @param {Socket.io} sockets
 * @returns {Function}
 */
function getInjector(sockets, logger) {

    return function (window, diffs, selector, currentUrl) {

        diffs.forEach(function (item) {

            item.diff.type = item.diff.type || "node";

            logger.debug("{cyan:Tag: %s",   item.tagName);
            logger.debug("{cyan:Index: %s", item.index);

            var element = window.document.getElementsByTagName(item.tagName)[item.index];

            var elemAttrs = {};

            for (var attr, i=0, attrs = element.attributes, l = attrs.length; i<l; i++){
                attr = attrs.item(i);
                elemAttrs[attr.nodeName] = attr.nodeValue;
            }

            if (element) {

                emitCount += 1;

                logger.debug("EVENT NUM: {yellow:%s}", emitCount);
                logger.debug("DIFF TYPE: {yellow:%s",  require("util").inspect(item.diff));
                logger.debug("InnerHTML: {yellow:%s} bytes",  element.innerHTML.length);

                if (item.diff.type) {
                    switch (item.diff.type) {
                        case 'attribute':
                            sockets.emit(config.CLIENT_EVENT, {
                                tagName: item.tagName,
                                index:   item.index,
                                cssText: element.style.cssText,
                                attrs:   elemAttrs,
                                diff:    item.diff,
                                url: currentUrl,
                                selector: selector
                            });
                            break;
                        default:
                            sockets.emit(config.CLIENT_EVENT, {
                                html:    element.innerHTML,
                                tagName: item.tagName,
                                index:   item.index,
                                cssText: element.style.cssText,
                                attrs:   elemAttrs,
                                diff:    item.diff,
                                url: currentUrl,
                                selector: selector
                            });
                            break;
                    }
                }
            }
        });
    }
}

/**
 * @type {getInjector}
 */
module.exports.getInjector = getInjector;