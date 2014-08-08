var http = require("http");
var _ = require("lodash");
var fs = require("fs");
var jsdom = require("jsdom").jsdom;
var serveStatic = require('serve-static');
var through = require("through");
var connect = require("connect");
var ports = require("portscanner-plus");
var tfunk = require("tfunk");

var oldDom;

var validUrls = [];
var PLUGIN_NAME = "HTML Injector";

module.exports = {

    name: PLUGIN_NAME,

    plugin: function (bs, opts) {

        var ids = opts.id;
        if (!Array.isArray(ids)) {
            ids = [id];
        }

        var url;
        var log = bs.getLogger(PLUGIN_NAME);
        var selectedId;

        ports.getPorts(1).then(start.bind(bs, opts));

        bs.io.sockets.on("connection", function (client) {

            client.on("client:url", function (data) {
                if (!_.contains(validUrls, data.location.pathname)) {
                    validUrls.push(data.location.pathname);
                }
            });

            client.on("client:ids", function (data) {
                url = data.url;
                ids = data.ids;
            });

            client.on("client:control:set", function (data) {
                selectedId = data.id;
            });

            if (ids && url) {
                bs.io.sockets.emit("client:control:ids", {url: url, ids: ids});
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
                    inject(chunks.join(""));
                });
            });
        });

        function inject(string, url) {

            var newDom = jsdom(string);

            //
            var window = newDom.parentWindow;

            if (selectedId) {
                var elem = window.document.getElementById(selectedId);
                if (elem) {
                    //                    log("notify", "Injecting HTML into: #" + id);
                    bs.io.sockets.emit("html:inject", {html: elem.innerHTML, id: selectedId});
                }
            }
        }
    },
    "server:routes": function () {
        return {
            "/html-injector": __dirname
        }
    },
    "client:events": function () {
        return ["client:url", "client:ids", "client:control:ids", "client:control:set"];
    },
    "client:js": function () {
        return require("fs").readFileSync(__dirname + "/client.js");
    }
};

/**
 * @param connector
 * @returns {Function}
 */
function getScriptMiddleware(connector) {

    var jsFile = "/lib/cp.js";

    return function (req, res, next) {

        res.setHeader("Content-Type", "text/javascript");

        return fs.createReadStream(__dirname + jsFile)
            .pipe(through(function (buffer) {
                this.queue(connector + buffer.toString());
            }))
            .pipe(res);
    };
}

/**
 * @param options
 * @returns {*}
 */
function startServer(options) {

    var app = connect();

    var connector = getConnector(options.urls.local);

    app.use("/cp.js", getScriptMiddleware(connector));
    app.use(serveStatic(__dirname + "/lib"));

    return http.createServer(app);
}

/**
 * @param url
 * @returns {string}
 */
function getConnector(url) {
    return "var ___socket___ = io.connect('%s');".replace("%s", url);
}

/**
 * @param ports
 */
function start(opts, ports) {

    var bs = this; // jshint ignore:line
    var port = ports[0];

//    log("debug", "Using port " + port);
//
//    log("debug", "Starting ");

    var server = startServer(bs.options);

    server.listen(port);

//    log("info", tfunk("Running at: %Ccyan:http://localhost:" + port));
}
