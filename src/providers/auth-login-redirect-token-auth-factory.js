(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth-login-redirect-token-auth-settings', [
        'project_settings',
        'angular-token-auth.constants'
    ]);

    module.factory('authLoginRedirect.getTokenAuthSettings', [
        'PROJECT_SETTINGS',
        'TOKEN_AUTH',
        function (PROJECT_SETTINGS, TOKEN_AUTH) {

            return function getTokenAuthSettings (key) {
                var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);
                if (key) {
                    return MODULE_SETTINGS[key];
                } else {
                    return MODULE_SETTINGS;
                }
            };
        }
    ]);

}(window.angular));
