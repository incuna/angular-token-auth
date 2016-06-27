(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.constants', []);

    module.constant('TOKEN_AUTH', {
        ENDPOINT: '/auth/',
        LOGIN: '/login/',
        LOGOUT: '/logout/',
        LOGIN_REDIRECT_URL: '/',
        LOGOUT_REDIRECT_URL: '/logout/',
        AUTH_HEADER_PREFIX: 'Token',
        ALLOWED_HOSTS: [],
        COOKIE_PATH: null
        // Optional settings:
        // STORAGE_METHOD: 'cookie'
        // STORAGE_METHOD: 'localStorage'
        // STORAGE_METHOD: 'noSupport'
    });

}(window.angular));
