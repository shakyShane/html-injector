var config       = require("./config");

var jsdom        = require("jsdom").jsdom;
var compare      = require('dom-compare-temp').compare;

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

    return function (window, diffs) {

        diffs.forEach(function (item) {

            logger.debug("{cyan:Tag: %s",   item.tagName);
            logger.debug("{cyan:Index: %s", item.index);

            var element = window.document.getElementsByTagName(item.tagName)[item.index];

            var elemAttrs = {};

            for (var attr, i=0, attrs=element.attributes, l=attrs.length; i<l; i++){
                attr = attrs.item(i);
                elemAttrs[attr.nodeName] = attr.nodeValue
            }

            if (element) {
                sockets.emit(config.CLIENT_EVENT, {
                    html:    element.innerHTML,
                    tagName: item.tagName,
                    index:   item.index,
                    cssText: element.style.cssText,
                    attrs:   elemAttrs
                });
            }
        });
    }
}

/**
 * @type {getInjector}
 */
module.exports.getInjector = getInjector;