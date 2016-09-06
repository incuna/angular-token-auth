(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth-login-redirect-route-change-start', [
        // For $route
        'ngRoute',
        'angular-token-auth-login-redirect-token-auth-settings'
    ]);

    module.service('authLoginRedirect.onRouteChangeStart', [
        '$location',
        'authLoginRedirect.getTokenAuthSettings',
        function ($location, getTokenAuthSettings) {

            this.handler = angular.bind(this, function onRouteChangeStart ($event, next) {
                // If going to the login page, redirect to home instead.
                if (this.nextPathIsLogin(next && next.$$route && next.$$route.originalPath)) {
                    this.cancelRouteChangeAndRedirect($event, next);
                }
            });

            this.nextPathIsLogin = function (nextPath) {
                var TOKEN_AUTH = getTokenAuthSettings();
                return nextPath === TOKEN_AUTH.LOGIN;
            };

            this.cancelRouteChangeAndRedirect = function ($event, next) {
                var TOKEN_AUTH = getTokenAuthSettings();
                // Redirect to the url the user is sent to after logging out
                // so the same login form place is used consistently.
                $location.url(TOKEN_AUTH.LOGOUT_REDIRECT_URL);
                // Update the url with the params from the login redirect.
                var currentSearch = $location.search();
                $location.search(angular.extend(currentSearch, next.params));
                $event.preventDefault();
            };

        }
    ]);

}(window.angular));
