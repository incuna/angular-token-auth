(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-login-form-factory', [
        'ngRoute',
        'angular-token-auth.auth',
        'angular-token-auth.auth-actions',
        'angular-token-auth.auth-module-settings',
    ]);

    // extend this in your app using:
    // auth.factory('AppAuthLoginFormFactory', [
    //     'AuthLoginFormFactory',
    //     function (AuthLoginFormFactory) {
    //         var AppAuthLoginFormFactory = function (scope, element, attrs) {
    //             AuthLoginFormFactory.apply(this, arguments);
    //         };
    //         AppAuthLoginFormFactory.prototype = Object.create(authLoginFormFactory.prototype);
    //         AppAuthLoginFormFactory.prototype.loginFailed = function (response) {
    //              AuthLoginFormFactory.prototype.loginFailed.apply(this, arguments);
    //              // your own code here
    //         };
    //     }
    // ]);
    module.factory('AuthLoginFormFactory', [
        'authActionsFactory', '$location', 'authFactory', 'authModuleSettings',
        function (authActionsFactory, $location, authFactory, authModuleSettings) {

            // If we are already logged in.
            if (authFactory.getToken()) {
                $location.url(authModuleSettings.LOGIN_REDIRECT_URL);
            }

            var AuthLoginFormFactory = function (scope) {
                this.scope = scope;
                this.init();
            };

            AuthLoginFormFactory.prototype = {
                init: function () {
                    this.scope.status = {};
                    this.scope.fields = {
                        username: {
                            required: true,
                        },
                        password: {
                            required: true,
                        },
                    };

                    this.scope.login = angular.bind(this, this.loginClick);
                },
                loginSuccess: function () {
                    $location.url($location.search().next || authModuleSettings.LOGIN_REDIRECT_URL);
                },
                loginFailed: function (response) {
                    // Store all the errors on the scope.
                    this.scope.errors = response;
                    if (response.non_field_errors) {
                        this.scope.fields.errors = [{
                            msg: response.non_field_errors[0],
                        }];
                    }
                    this.scope.fields.username.errors = response.username ? response.username[0] : '';
                    this.scope.fields.password.errors = response.password ? response.password[0] : '';
                },
                loginFinally: function () {
                    this.scope.status.authenticating = false;
                },
                loginClick: function () {
                    delete this.scope.errors;
                    this.scope.fields.errors = '';
                    this.scope.fields.username.errors = '';
                    this.scope.fields.password.errors = '';

                    this.scope.status.authenticating = true;

                    authActionsFactory.login(this.scope.fields.username.value, this.scope.fields.password.value)
                        .then(
                            angular.bind(this, this.loginSuccess),
                            angular.bind(this, this.loginFailed)
                        )
                        /* eslint-disable dot-notation, no-unexpected-multiline */
                        ['finally'](angular.bind(this, this.loginFinally));
                        /* eslint-enable dot-notation, no-unexpected-multiline */
                },
            };

            return AuthLoginFormFactory;
        },
    ]);

}(window.angular));
