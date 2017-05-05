(function () {
    'use strict';

    describe('auth-login-form-directive', function () {

        describe('loginForm directive', function () {

            it('should be the same as authLoginFormDirectiveFactory', function () {
                module('angular-token-auth.auth-login-form');
                inject(function (loginFormDirective, authLoginFormDirectiveFactory) {
                    expect(loginFormDirective[0]).toBe(authLoginFormDirectiveFactory);
                });
            });

        });

    });

}());
