(function (window, socket) {

    socket.on("connection", function () {
//        window.___socket___.emit("client:url", {location: window.location});
//        console.log("CONNECION");

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

//        var path = "//html//body" + data.xPath;
//        console.log(path);
//        var element = document.evaluate( path ,document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
//        console.log(element);

        var elem = document.getElementById(data.id);
        if (elem) {
            elem.innerHTML = data.html;
        }


//        var doc;
//        try {
//            doc = new ActiveXObject('Microsoft.XMLDOM');
//            doc.loadXML(data.html);
//            var node = doc.selectSingleNode(path);
//            console.log(node);
//
//        } catch (e) { // deal with case that ActiveXObject is not supported
//
//        }
    });

//    console.log(withIds);

})(window, window.___socket___);
