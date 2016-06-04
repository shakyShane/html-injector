var _ = require("../lodash.custom");

module.exports = {
    /**
     * @param {Array} differences
     * @returns {Array}
     */
    removeDupes: function(differences) {
        return _.uniqBy(differences, "node");
    },

    /**
     * @param diffs
     * @param excludeList
     * @returns {*}
     */
    removeExcluded: function (diffs, excludeList) {
        return _.filter(diffs, function (item) {
            return !_.includes(excludeList, item.tagName);
        });
    }
};

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
            if (!_.includes(path, parentItem.node)) {
                return parents.push(item);
            }
        });
    });

    return parents;
}
