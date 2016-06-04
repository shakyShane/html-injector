(function (angular) {

    const PLUGIN_NAME = "HTML Injector";

    angular
        .module("BrowserSync")
        .directive("htmlInjector", function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    "options": "=",
                    "pluginOpts": "="
                },
                templateUrl: "html-injector/html-injector.directive.html",
                controller: ["$scope", "Socket", function ($scope, Socket) {

                    var ctrl = this;

                    ctrl.restriction = "";

                    ctrl.state = {
                        classname: "ready"
                    };

                    ctrl.plugin = $scope.options.userPlugins.filter(function (item) {
                        return item.name === PLUGIN_NAME;
                    })[0];

                    ctrl.addRestriction = function (selector) {

                        if (selector.length < 3) {
                            return;
                        }

                        ctrl.restriction = "";
                        ctrl.state.classname = "waiting";

                        setTimeout(function () {

                            ctrl.state.classname = "success";

                            $scope.$digest();

                            setTimeout(function () {
                                ctrl.state.classname = "ready";
                                $scope.$digest();
                            }, 1000);

                            Socket.uiEvent({
                                namespace: PLUGIN_NAME,
                                event: "restriction:add",
                                data: selector
                            });
                        }, 300);

                    };

                    ctrl.removeRestriction = function (selector) {
                        Socket.uiEvent({
                            namespace: PLUGIN_NAME,
                            event: "restriction:remove",
                            data: selector
                        });
                    };

                    ctrl.update = function (data) {
                        ctrl.plugin.opts = data.opts;
                        $scope.$digest();
                    };

                    Socket.on("options:update", ctrl.update);

                    $scope.$on("$destory", function () {
                        Socket.off("options:update", ctrl.update);
                    });
                }],
                controllerAs: "ctrl"
            };
        });

})(angular);

