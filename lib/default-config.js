/**
 * @module bs-html-injector.options
 * Default configuration. Everything here can be overridden
 */
module.exports = {
    /**
     *
     * Define which tags are ignored by default.
     *
     * @property excludedTags
     * @type Array
     * @default ["HTML", "HEAD"]
     */
    excludedTags: ["HTML", "HEAD"],
    /**
     * Log Level (inherits from browserSync initially, but can be overridden)
     */
    logLevel: undefined,
    /**
     * Handoff - when plugin is disabled, should the file-watching be handed
     * off to core?
     */
    handoff: true,
    /**
     * Narrow down the working target
     */
    restrictions: []
};