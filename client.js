
;(function (window, bs) {

    var socket = bs.socket;

    socket.on("connection", function () {

        socket.emit("client:url", {
            url: getUrl()
        });
    });

    socket.on("html:inject", function (data) {

        var elem, parent;

        if (data.url !== getUrl()) {
            return;
        }

        if (data.restrictions === "html") {
            var elems = document.getElementsByTagName(data.tagName);
            elem = elems[data.index];
            updateElement(elem);
        } else {
            if (data.restrictions.match(/^#/)) {
                parent = document.getElementById(data.restrictions.slice(1));
                if (parent) {
                    if (data.tagName === "BODY") {
                        updateElement(parent);
                    } else {
                        updateElement(parent.getElementsByTagName(data.tagName)[data.index]);
                    }
                }
            } else {
                parent = document.querySelectorAll(data.restrictions);
                if (parent.length) {
                    if (data.tagName === "BODY") {
                        updateElement(parent[0]);
                    } else {
                        updateElement(parent[0].getElementsByTagName(data.tagName)[data.index]);
                    }
                }
            }
        }

        function updateElement(elem) {

            if (elem) {

                switch (data.diff.type) {

                    case "attribute":
                        updateAttrs(elem, data);
                        break;
                    default:
                        updateElemHtml(elem, data.html);
                        break;

                }
            }
        }
    });

    function updateElemHtml (elem, html) {
        elem.innerHTML     = html;
    }

    function updateText (elem, text) {
        elem.innerText = text;
    }

    function updateAttrs (elem, data) {

        var oldAttrs = elem.attributes;
        var name;
        var index;

        // Remove any ol attrs that don't exist on new element
        for (index = oldAttrs.length - 1; index >= 0; --index) {
            name = oldAttrs[index].nodeName;
            if (!data.attrs[name]) {
                elem.removeAttribute(name);
            }
        }

        /**
         * Compare
         */
        for (var key in data.attrs) {

            if (oldAttrs[key]) { // existing attr

                if (oldAttrs[key] !== data.attrs[key]) {
                    elem.setAttribute(key, data.attrs[key]);
                }
            }

            if (!oldAttrs[key])  {
                elem.setAttribute(key, data.attrs[key]);
            }
        }
    }

    function getUrl () {
        return [location.protocol, "//", location.host, location.pathname, location.search].join("");
    }

})(window, window.___browserSync___);
