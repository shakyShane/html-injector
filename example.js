var bs = require("/Users/shakyshane/Sites/os-browser-sync");

bs.use(require("./index"), {
   files: "test/fixtures/*.html"
});

bs({
   server: "test/fixtures"
});