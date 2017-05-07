(function (angular) {

    'use strict';

    var origModuleCall = angular.module;
    angular.registeredModules = [];
    angular.module = function () {
        if (arguments.length > 1) {
            angular.registeredModules.push(arguments[0]);
        }
        return origModuleCall.apply(angular, arguments);
    };

}(window.angular));
