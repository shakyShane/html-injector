
;(function (window, bs) {

    var socket = bs.socket;

    socket.on("connection", function () {

        socket.emit("client:url", {
            url: window.location.href
        });
    });

    socket.on("html:inject", function (data) {

        var elems = document.getElementsByTagName(data.tagName);

        var elem = elems[data.index];

        if (elem) {

            switch (data.diffType) {

                case "attr":
                    updateAttrs(elem, data.attrs);
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

    function updateAttrs (elem, newAttrs) {
        var oldAttrs = elem.attributes;
        var name;
        var index;

        // Remove all attributes from element
        for (index = oldAttrs.length - 1; index >= 0; --index) {
            name = oldAttrs[index].nodeName;
            elem.removeAttribute(name);
        }

        // Add new ones
        for (var key in newAttrs) {
            elem.setAttribute(key, newAttrs[key]);
        }
    }

})(window, window.___browserSync___);
