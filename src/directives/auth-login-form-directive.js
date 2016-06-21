(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-login-form', []);

    // extend this in your app by doing:
    // auth.directive('appLoginForm', [
    //     'authLoginFormDirectiveFactory', 'appAuthLoginFormFactory',
    //     function (authLoginFormDirectiveFactory, appAuthLoginFormFactory) {
    //         return angular.extend({}, authLoginFormDirectiveFactory, {
    //             link: function (scope, element, attrs) {
    //                 new appAuthLoginFormFactory(scope, element, attrs);
    //             }
    //         });
    //     }
    // ]);
    module.directive('loginForm', [
        'authLoginFormDirectiveFactory',
        function (authLoginFormDirectiveFactory) {
            return authLoginFormDirectiveFactory;
        }
    ]);

}(window.angular));
