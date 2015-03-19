var defaults = require("./default-config");
var _        = require("lodash");
var merge    = require('opt-merger').merge;

var HtmlInjector = function (opts) {

    var html = this;

    html.opts      = merge(defaults, opts || {}, true, {});
    html.cache     = {};
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
};

module.exports = HtmlInjector;

/**
 * Collate tasks
 * @param parent
 * @param diffs
 * @param selector
 * @param currentUrl
 */
HtmlInjector.prototype.getTasks = function (parent, diffs, selector, currentUrl) {

    var tasks  = [];
    var html   = this;

    diffs.forEach(function (item) {

        item.diff.type = item.diff.type || "node";

        // logger.debug("{cyan:Tag: %s", item.tagName);
        // logger.debug("{cyan:Index: %s", item.index);
        // html.emitCount += 1;
        // html.logger.debug("EVENT NUM: {yellow:%s}", html.emitCount);
        // logger.debug("DIFF TYPE: {yellow:%s", require("util").inspect(item.diff));
        // logger.debug("InnerHTML: {yellow:%s} bytes", element.innerHTML.length);

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
                    selector: selector
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
 * Get a dom node + attrs
 * @param parent
 * @param item
 * @returns {{domNode: *, attrs: {}}}
 */
function getElement (parent, item) {

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