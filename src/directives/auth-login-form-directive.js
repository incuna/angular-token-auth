(function (angular) {
    'use strict';
    var module = angular.module('angular-token-auth.auth-login-form', [
        'angular-token-auth.auth-login-form-directive-factory',
    ]);

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
    console.log(module)
    module.directive('loginForm', [
        'authLoginFormDirectiveFactory',
        function (authLoginFormDirectiveFactory) {
            console.log('s')
            return authLoginFormDirectiveFactory;
        }
    ]);

}(window.angular));
