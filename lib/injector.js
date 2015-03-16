var config       = require("./config");

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
function compareDoms(oldDom, newDom) {

    var window      = newDom.parentWindow;

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
        return result.getDifferences(); // array of diff-objects.
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

module.exports.createDom = createDom;

/**
 * @param {Socket.io} sockets
 * @returns {Function}
 */
function getInjector(sockets, logger) {

    return function (window, diffs, currentUrl) {

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
                                url: currentUrl
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
                                url: currentUrl
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