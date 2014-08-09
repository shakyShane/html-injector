(function (window, socket) {

    socket.on("connection", function () {

        var elems = document.getElementsByTagName("*");
        var ids = [];

        for (var i = 0, n = elems.length; i < n; i += 1) {
            if (elems[i].id) {
                ids.push(elems[i].id);
            }
        }

        socket.emit("client:ids", {
            url: window.location.href,
            ids: ids
        });
    });

    socket.on("html:inject", function (data) {

        var elem   = document.getElementById(data.id);

        if (elem) {
            elem.innerHTML = data.html;
        }
    });

})(window, window.___socket___);
