(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth-login-redirect-token-auth-clear', [
        // For $route
        'ngRoute',
        'angular-token-auth-login-redirect-token-auth-settings'
    ]);

    module.service('authLoginRedirect.onTokenAuthClear', [
        '$route',
        '$location',
        'authLoginRedirect.getTokenAuthSettings',
        function ($route, $location, getTokenAuthSettings) {

            this.handler = angular.bind(this, function onTokenAuthClear () {
                if (!this.routeIsAnonymous($route.current.$$route)) {
                    this.redirect();
                }
            });

            this.routeIsAnonymous = function (route) {
                // By default, all routes should be anonymous.
                var routeIsAnonymous = true;
                if (route && route.anonymous === false) {
                    routeIsAnonymous = false;
                }
                return routeIsAnonymous;
            };

            this.redirect = function () {
                var TOKEN_AUTH = getTokenAuthSettings();
                // Current route is not anonymous so use the logout redirect
                var nextUrl = $location.path();
                // Use $location.url() to reset all search params, then set
                // the next= param.
                $location.url(TOKEN_AUTH.LOGOUT_REDIRECT_URL).search('next', nextUrl);
            };

        }
    ]);

}(window.angular));
