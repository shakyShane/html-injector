;(function (window, socket) {

    socket.on("connection", function () {

        socket.emit("client:url", {
            url: window.location.href
        });
    });

    socket.on("html:inject", function (data) {

        var elems = document.getElementsByTagName(data.tagName);

        var elem = elems[data.index];

        if (elem) {

            elem.innerHTML     = data.html;

            var attrs = elem.attributes;
            var name;
            var index;

            // Remove all attributes from element
            for (index = attrs.length - 1; index >= 0; --index) {
                name = attrs[index].nodeName;
                elem.removeAttribute(name);
            }

            // Add new ones
            for (var key in data.attrs) {
                elem.setAttribute(key, data.attrs[key]);
            }
        }
    });

})(window, window.___socket___);
