(function (angular) {
    'use strict';

    /*
    Use this module for consistent redirection regarding the login form.
    Whenever the user's session expires or they try to access a non-anonymous
    page when logged out, they will be redirected to the url set in
    TOKEN_AUTH.LOGOUT_REDIRECT_URL, either in the angular-token-auth defaults
    or your own PROJECT_SETTINGS.
    To use this module, require login-redirect as an app dependency, then
    require loginRedirect.run and call it in your app's run block.
    Example:
        var app = angular.module('app', [
            'login-redirect'
        ]);
        module.run([
            'loginRedirect.run',
            function (loginRedirectRun) {
                loginRedirectRun();
            }
        ]);
    Or manually add the $routeChangeStart and tokenAuth:clear handlers yourself:
    simply follow the loginRedirect.run function.
    */

    var module = angular.module('angular-token-auth-login-redirect', [
        // For $routeChangeStart event
        'ngRoute',
        'angular-token-auth-login-redirect-token-auth-clear',
        'angular-token-auth.auth-route-change-start',
    ]);

    module.factory('authLoginRedirect.run', [
        '$rootScope',
        'authRouteChangeStartFactory',
        'authLoginRedirect.onTokenAuthClear',
        function ($rootScope, authRouteChangeStartFactory, onTokenAuthClear) {

            return function loginRedirectRun () {
                $rootScope.$on('$routeChangeStart', authRouteChangeStartFactory);
                $rootScope.$on('tokenAuth:clear', onTokenAuthClear.handler);
            };

        },
    ]);

}(window.angular));
