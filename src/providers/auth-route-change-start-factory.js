(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-route-change-start', [
        'angular-token-auth.auth',
        'angular-token-auth.auth-module-settings',
        'angular-token-auth.constants',
    ]);

    module.factory('authRouteChangeStartFactory', [
        '$location',
        'authFactory',
        'authModuleSettings',
        function ($location, authFactory, MODULE_SETTINGS) {
            return function (e, next) {
                var nextRoute = next.$$route;

                // By default, all routes should be anonymous.
                var nextRouteIsAnonymous = true;
                if (angular.isDefined(nextRoute) && nextRoute.anonymous === false) {
                    nextRouteIsAnonymous = false;
                }

                var nextRouteAnonymousOnly = false;
                if (angular.isDefined(nextRoute) && nextRoute.anonymousOnly === true) {
                    nextRouteAnonymousOnly = true;
                }

                if (authFactory.getToken()) {
                    // If the next route is public only and we are logged in then redirect to the
                    // login redirect URL.
                    if (nextRouteAnonymousOnly) {
                        $location.url(MODULE_SETTINGS.LOGIN_REDIRECT_URL);
                    }
                } else {
                    // If the next route isn't anonymous and a token doesn't exist,
                    // redirect to the log in page with a `next` parameter set to the
                    // anonymous path.
                    if (!nextRouteIsAnonymous) {
                        $location.url(MODULE_SETTINGS.LOGIN + '?next=' + $location.path());
                        $location.replace();
                    }
                }
            };
        }]);

}(window.angular));
