/* global jasmine, beforeEach, describe, expect, module, it, inject */

(function () {

    'use strict';

    describe('login-redirect', function () {

        beforeEach(function () {

            this.PROJECT_SETTINGS_MOCK = {
                API_HOST: '',
                TOKEN_AUTH: {
                    ALLOWED_HOSTS: []
                }
            };

            this.TOKEN_AUTH_MOCK = {};

            module('angular-token-auth-login-redirect');

            this.onTokenAuthClearMock = jasmine.createSpyObj('onTokenAuthClearMock', [
                'handler'
            ]);

            module({
                'authLoginRedirect.onTokenAuthClear': this.onTokenAuthClearMock
            });

            inject(function ($rootScope, $location, $route) {
                this.$rootScope = $rootScope;
                this.$location = $location;
                this.$route = $route;
            });

            this.triggerRouteChange = function (eventName) {
                this.$rootScope.$broadcast(eventName, {
                    $$route: {}
                });
            };

            inject([
                'authLoginRedirect.run',
                function (loginRedirectRun) {
                    this.loginRedirectRun = loginRedirectRun;
                }
            ]);

            this.loginRedirectRun();

        });

        describe('on tokenAuth:clear', function () {

            it('should call onTokenAuthClear.handler', function () {
                expect(this.onTokenAuthClearMock.handler).not.toHaveBeenCalled();
                this.triggerRouteChange('tokenAuth:clear');
                expect(this.onTokenAuthClearMock.handler).toHaveBeenCalled();
            });

        });

    });

}());
