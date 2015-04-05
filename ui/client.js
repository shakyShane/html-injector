(function (angular) {

    const PLUGIN_NAME = "HTML Injector";

    angular
        .module("BrowserSync")
        .controller("HtmlInjector", function () {
            var ctrl = this;
            ctrl.htmlInjector = {
                active: false
            }
        })

    /**
     * Controller for the URL sync
     * @param $scope - directive scope
     * @param History
     * @param Clients
     */
    function htmlInjectorDirective($scope, History, Clients) {

        var ctrl = this;

        console.log("HTML INJECTOR");
    }

    angular
        .module("BrowserSync")
        .directive("htmlInjector", function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    "options": "="
                },
                templateUrl: "html-injector.directive.html",
                controller: ["$scope", "Socket", function ($scope, Socket) {
                    var ctrl = this;
                    ctrl.removeRestriction = function (selector) {
                        Socket.uiEvent({
                            namespace: PLUGIN_NAME,
                            event: "remove",
                            data: selector
                        });
                    };
                }],
                controllerAs: "ctrl"
            };
        });

})(angular);

