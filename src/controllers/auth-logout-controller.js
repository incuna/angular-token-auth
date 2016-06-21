(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-logout', []);

    module.controller('LogoutCtrl', ['authActionsFactory', function (authActionsFactory) {
        authActionsFactory.logout();
    }]);

}(window.angular));
