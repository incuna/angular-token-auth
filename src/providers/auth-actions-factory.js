(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-actions', [
        'project_settings',
        'angular-token-auth.auth',
        'angular-token-auth.auth-module-settings',
    ]);

    module.factory('authActionsFactory', [
        '$q',
        '$http',
        '$location',
        'PROJECT_SETTINGS',
        'authModuleSettings',
        'authFactory',
        function ($q, $http, $location, PROJECT_SETTINGS, MODULE_SETTINGS, authFactory) {
            return {
                login: function (username, password) {
                    var deferred = $q.defer();

                    $http.post(PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT, {
                        username: username,
                        password: password,
                    }).success(function (data) {
                        authFactory.setAuth(data);
                        deferred.resolve(data);
                    }).error(deferred.reject);

                    return deferred.promise;
                },
                logout: function () {
                    var deferred = $q.defer();

                    /* eslint-disable dot-notation, no-unexpected-multiline */
                    $http['delete'](PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT)
                        .success(deferred.resolve)
                        .error(deferred.reject)
                        ['finally'](function () {
                            authFactory.clearAuth();
                            $location.url(MODULE_SETTINGS.LOGOUT_REDIRECT_URL);
                        });
                    /* eslint-enable dot-notation, no-unexpected-multiline */

                    return deferred.promise;
                },
            };
        }]);

}(window.angular));
