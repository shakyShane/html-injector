
;(function (window, bs) {

    var socket = bs.socket;

    socket.on("connection", function () {

        socket.emit("client:url", {
            url: window.location.href
        });
    });

    socket.on("html:inject", function (data) {

        if (data.url !== location.href) {
            return;
        }

        var elems = document.getElementsByTagName(data.tagName);

        var elem = elems[data.index];

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

})(window, window.___browserSync___);
