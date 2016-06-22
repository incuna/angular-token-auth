(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.config', [
        'angular-token-auth.constants',
        'project_settings'
    ]);

    module.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }]);

    module.run(['$rootScope', '$log', 'authRouteChangeStartFactory', 'authModuleSettings', function ($rootScope, $log, authRouteChangeStartFactory, MODULE_SETTINGS) {
        if (!MODULE_SETTINGS.ALLOWED_HOSTS.length) {
            $log.error('ALLOWED_HOSTS is empty. Set ALLOWED_HOSTS to a list of hosts that the auth token can be sent to.');
        }

        $rootScope.$on('$routeChangeStart', authRouteChangeStartFactory);
    }]);

}(window.angular));
