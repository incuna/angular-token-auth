(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-interceptor', [
        'angular-token-auth.auth',
        'angular-token-auth.auth-module-settings'
    ]);

    module.factory('authInterceptor', [
        '$rootScope',
        '$q',
        '$location',
        'authFactory',
        'authModuleSettings',
        function ($rootScope, $q, $location, authFactory, MODULE_SETTINGS) {
        return {
            request: function (config) {
                // Only transform requests for hosts in the ALLOWED_HOSTS setting.
                var allowedHosts = MODULE_SETTINGS.ALLOWED_HOSTS;
                var urlElement = document.createElement('a');
                urlElement.href = config.url;
                var host = urlElement.host;
                var hostname = urlElement.hostname;

                if (!(host || hostname)) {
                    // IE does not set the host / hostname for relative paths
                    host = hostname = $location.host();
                }

                if (allowedHosts.indexOf(host) > -1 || allowedHosts.indexOf(hostname) > -1) {
                    config.headers = config.headers || {};
                    var token = authFactory.getToken();
                    if (token) {
                        config.headers.Authorization = MODULE_SETTINGS.AUTH_HEADER_PREFIX + ' ' + token;
                    }
                }

                return config;
            },
            responseError: function (response) {
                if (response.status === 401) {
                    authFactory.clearAuth();
                }
                return $q.reject(response);
            }
        };
    }]);

}(window.angular));
