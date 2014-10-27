var _ = require("lodash");

module.exports = {
    /**
     * @param {Array} differences
     * @returns {Array}
     */
    removeDupes: function(differences) {
        return _.uniq(differences, "node");
    },

    /**
     * @param diffs
     * @param excludeList
     * @returns {*}
     */
    removeExcluded: function (diffs, excludeList) {
        return _.filter(diffs, function (item) {
            return !_.contains(excludeList, item.tagName);
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
            if (!_.contains(path, parentItem.node)) {
                return parents.push(item);
            }
        });
    });

    return parents;
}