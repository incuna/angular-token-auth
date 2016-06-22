(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-module-settings', [
        'project_settings',
        'angular-token-auth.constants'
    ]);

    module.factory('authModuleSettings', [
        'TOKEN_AUTH', 'PROJECT_SETTINGS',
        function (TOKEN_AUTH, PROJECT_SETTINGS) {
            return angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);
        }
    ]);

}(window.angular));
