(function (window, socket, undefined) {

    var app = angular.module("BrowserSync", []);

    app.controller("MainCtrl", function ($scope) {

        $scope.ids = {};
        $scope.url = "";

        socket.on("client:control:ids", function (data) {
            $scope.$apply(function () {
                $scope.url = data.url;
                $scope.ids = data.ids;
            });
        });

        /**
         * @param id
         */
        $scope.setId = function (id) {
            $scope.selected = id;
            socket.emit("client:control:set", {url: $scope.url, id: id});
        }
    })


})(window, window.___socket___);