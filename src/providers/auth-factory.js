(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth', [
        'angular-token-auth.auth-storage',
    ]);

    module.factory('authFactory', ['$rootScope', 'authStorageFactory', function ($rootScope, authStorageFactory) {
        return {
            getAuth: function () {
                var auth = authStorageFactory.get('auth');
                if (angular.isObject(auth)) {
                    return auth;
                }
                return null;
            },
            getToken: function () {
                var auth = this.getAuth();
                if (auth !== null && angular.isDefined(auth.token)) {
                    return auth.token;
                }
                return null;
            },
            setAuth: function (data) {
                authStorageFactory.set('auth', data);
                $rootScope.$broadcast('tokenAuth:set');
            },
            clearAuth: function () {
                authStorageFactory.clear('auth');
                $rootScope.$broadcast('tokenAuth:clear');
            },
        };
    }]);

}(window.angular));
