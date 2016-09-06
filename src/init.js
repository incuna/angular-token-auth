(function (angular) {
    'use strict';

    angular.module('angular-token-auth', [
        'angular-token-auth.auth-login',
        'angular-token-auth.auth-logout',
        'angular-token-auth.auth-login-form',
        'angular-token-auth.auth-actions',
        'angular-token-auth.auth',
        'angular-token-auth.auth-interceptor',
        'angular-token-auth.auth-login-form-directive-factory',
        'angular-token-auth.auth-login-form',
        'angular-token-auth.auth-module-settings',
        'angular-token-auth.auth-route-change-start',
        'angular-token-auth.auth-storage',
        'angular-token-auth.routes',
        'angular-token-auth.config',
        'angular-token-auth.constants',
        'angular-token-auth.auth-login-form-factory',
        'angular-token-auth-login-redirect',
        'angular-token-auth-login-redirect-token-auth-clear',
        'angular-token-auth-login-redirect-token-auth-settings'
    ]);

}(window.angular));
