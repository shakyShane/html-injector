var http        = require("http");
var _           = require("lodash");
var jsdom       = require("jsdom").jsdom;
var serveStatic = require('serve-static');
var connect     = require("connect");
var ports       = require("portscanner-plus");
var tfunk       = require("tfunk");

var validUrls = [];
var PLUGIN_NAME = "HTML Injector";

module.exports = {

    /**
     * Plugin name
     */
    name: PLUGIN_NAME,

    /**
     *
     * @param {BrowserSync} bs
     * @param opts
     */
    plugin: function (bs, opts) {

        var ids = opts.id;

        if (!Array.isArray(ids)) {
            ids = [id];
        }

        var url;
        var id;
        var sockets     = bs.io.sockets;
        var log         = bs.getLogger(PLUGIN_NAME);
        var inject      = getInjector(sockets);

        ports.getPorts(1).then(start.bind(bs, opts, log));

        sockets.on("connection", function (client) {

            client.on("client:ids", function (data) {
                url = data.url;
                ids = data.ids;
            });

            client.on("client:control:set", function (data) {
                id = data.id;
            });

            if (ids && url) {
                sockets.emit("client:control:ids", {url: url, ids: ids});
            }
        });

        bs.events.on("file:changed", function (data) {

            if (!url) {
                return;
            }

            if (data.namespace !== PLUGIN_NAME) {
                return;
            }

            log("notify", "Fetching new markup, please wait...");

            http.get(url, function (res) {
                var chunks = [];
                res.on("data", function (data) {
                    chunks.push(data);
                }).on("end", function () {
                    inject(chunks.join(""), id);
                });
            });
        });
    },
    "client:js": function () {
        return require("fs").readFileSync(__dirname + "/client.js");
    }
};

/**
 * @param sockets
 * @returns {Function}
 */
function getInjector(sockets) {

    return function (string, id) {

        var newDom = jsdom(string);

        var window = newDom.parentWindow;

        var elem = window.document.getElementById(id);

        if (elem) {
            sockets.emit("html:inject", {html: elem.innerHTML, id: id});
        }
    }
}

/**
 * @param {Array} ports
 * @param {Object} opts - plugin options
 * @param {Function} log - namespaced logger
 */
function start(opts, log, ports) {

    var bs = this; // jshint ignore:line
    var app = connect();
    var port = ports[0];

    app.use("/connector.js", bs.getMiddleware("connector"));
    app.use("/socket.io.js", bs.getMiddleware("socket-js"));
    app.use(serveStatic(__dirname + "/lib"));

    http.createServer(app).listen(port);

    log("info", tfunk("Controls available at: %Ccyan:http://localhost:" + port));
}
