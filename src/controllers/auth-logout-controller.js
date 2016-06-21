(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-logout', [
        'angular-token-auth.auth-actions'
    ]);

    module.controller('LogoutCtrl', ['authActionsFactory', function (authActionsFactory) {
        authActionsFactory.logout();
    }]);

}(window.angular));
