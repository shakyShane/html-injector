var defaults     = require("./default-config");
var _            = require("../lodash.custom");
var compareDoms  = require("./injector").compareDoms;
var createDom    = require("./injector").createDom;
var utils        = require("./utils");

/**
 * @param opts
 * @constructor
 */
var HtmlInjector = function (opts) {

    var html = this;

    if (!(html instanceof HtmlInjector)) {
        return new HtmlInjector(opts);
    }

    html.opts = _.assign({}, defaults, opts);
    html.cache = {};
    html.emitCount = 0;

    if (_.isUndefined(html.opts.enabled)) {
        html.opts.enabled = true;
    }

    /**
     * @returns {Number}
     */
    html.hasCached = function () {
        return Object.keys(html.cache).length;
    };

    return html;
};

module.exports = HtmlInjector;

/**
 * Collate tasks
 * @param parent
 * @param diffs
 * @param restrictions
 * @param currentUrl
 */
HtmlInjector.prototype.getTasks = function (parent, diffs, restrictions, currentUrl) {

    var tasks = [];

    diffs.forEach(function (item) {

        item.diff.type = item.diff.type || "node";

        var element = getElement(parent, item);

        if (element && element.domNode) {

            if (item.diff.type) {

                var obj = {
                    tagName:  item.tagName,
                    index:    item.index,
                    cssText:  element.domNode.style.cssText,
                    attrs:    element.attrs,
                    diff:     item.diff,
                    url:      currentUrl,
                    restrictions: restrictions
                };

                switch (item.diff.type) {

                    case 'attribute':
                        // no-op, use default obj
                        break;

                    default:
                        obj.html = element.domNode.innerHTML;
                        break;
                }

                tasks.push(obj);
            }
        }
    });

    if (tasks.length) {
        return tasks;
    }

    return [];
};

/**
 * @param item1
 * @param item2
 * @param url
 * @param opts
 */
HtmlInjector.prototype.process = function (item1, item2, url, opts) {

    var html    = this;
    var results = html.getDiffs(item1, item2, opts);
    var out     = [];

    if (results.length) {
        results.forEach(function (result) {
            out = out.concat(html.getTasks(result.parent, result.diffs, result.restriction, url));
        });
        html.cache[url] = createDom(item1);
    }

    return out;
};

/**
 * @param {string|object} item1
 * @param {string|object} item2
 * @param opts
 * @returns {*}
 */
HtmlInjector.prototype.getDiffs = function (item1, item2, opts) {
    /**
     * @param newDom
     * @param item2
     * @param [opts]
     * @returns {*}
     */

    opts = opts || {};

    if (_.isString(item2)) {
        item2 = createDom(item2);
    }

    var newDom  = createDom(item1);
    var results = compareDoms(item2, newDom, opts);

    if (results.length) {
        results = results.map(function (result) {
            result.diffs = utils.removeDupes(result.diffs);
            result.diffs = utils.removeExcluded(result.diffs, opts.excludedTags);
            return result;
        });
    }

    return results;
};

module.exports.getDiffs = HtmlInjector.prototype.getDiffs;

/**
 * Get a dom node + attrs
 * @param parent
 * @param item
 * @returns {{domNode: *, attrs: {}}}
 */
function getElement(parent, item) {

    var element = parent.getElementsByTagName(item.tagName)[item.index];
    var elemAttrs = {};

    for (var attr, i = 0, attrs = element.attributes, l = attrs.length; i < l; i++) {
        attr = attrs.item(i);
        elemAttrs[attr.nodeName] = attr.nodeValue;
    }

    return {
        domNode: element,
        attrs:   elemAttrs
    }
}
