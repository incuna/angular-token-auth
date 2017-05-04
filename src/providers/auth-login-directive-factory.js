(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-login-form-directive-factory', [
        'angular-token-auth.auth-login-form',
    ]);

    module.factory('authLoginFormDirectiveFactory', [
        'AuthLoginFormFactory',
        function (AuthLoginFormFactory) {
            return {
                restrict: 'A',
                scope: true,
                templateUrl: 'templates/auth/login_form.html',
                link: function (scope, element, attrs) {
                    new AuthLoginFormFactory(scope, element, attrs);
                },
            };
        },
    ]);

}(window.angular));
