var bs = require("/Users/shakyshane/Sites/os-browser-sync");

bs.use(require("./index"));

bs({
    server: true,
    files: {
        "plugin:html": "*.html"
    }
});