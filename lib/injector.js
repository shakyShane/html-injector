require("jsdom").defaultDocumentFeatures = {
    FetchExternalResources: false,
    ProcessExternalResources: false
};

var jsdom        = require("jsdom").jsdom;
var compare      = require('dom-compare-temp').compare;
var debug        = require('debug')('bs-html-injector');

/**
 * Compare two DOMS & return diffs
 * @param {Object} newDom
 * @param {Object} oldDom
 * @param opts
 * @returns {Object}
 */
function compareDoms(oldDom, newDom, opts) {

    opts = opts || {};
    opts.restrictions = opts.restrictions || [];

    var diffs = [];

    if (!oldDom || !newDom) {
        return diffs;
    }

    if (opts.restrictions.length) {
        opts.restrictions.forEach(function (restriction) {
            getResults(restriction);
        });
    } else {
        getResults("html");
    }

    function getResults (restriction) {
        var dom1, dom2, node;

        if (restriction !== "html") {
            var match1 = oldDom.querySelectorAll(restriction);
            var match2 = newDom.querySelectorAll(restriction);
            if (match1.length && match2.length) {

                dom1 = createDom(match1[0].innerHTML);
                dom2 = createDom(match2[0].innerHTML);
            } else {
                debug("Selector %s not found", restriction);
            }
        } else {
            dom1 = oldDom;
            dom2 = newDom;
        }

        if (!dom1 || !dom2) {
            debug("2 doms not found");
            return;
        }

        var result = compare(dom1, dom2, {
            formatFailure: function (failure, domNode) {
                node = domNode;
                var allElems    = domNode.ownerDocument.getElementsByTagName(domNode.nodeName);
                failure.index   = Array.prototype.indexOf.call(allElems, domNode);
                failure.tagName = domNode.nodeName;
                return failure;
            }
        });

        var same = result.getResult(); // false cause' trees are different

        if (!same) {
            diffs.push({
                restriction: restriction,
                diffs:    result.getDifferences(),
                parent:   dom2
            });
        }
    }

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