/* jshint es3: false, esnext: true */
/* global jasmine, beforeEach, describe, expect, module, it, inject */

(function () {

    'use strict';

    describe('getTokenAuthSettings', function () {

        beforeEach(function () {
            var self = this;

            this.PROJECT_SETTINGS_MOCK = {
                API_HOST: '',
                TOKEN_AUTH: {
                    ALLOWED_HOSTS: []
                }
            };

            this.TOKEN_AUTH_MOCK = {};

            // Load some modules before mocking their constants.
            // angular-token-auth requires ngRoute but doesn't have it as a dep.
            module('ngRoute');
            module('angular-token-auth');

            module(function ($provide) {
                $provide.constant('PROJECT_SETTINGS', self.PROJECT_SETTINGS_MOCK);
                $provide.constant('TOKEN_AUTH', self.TOKEN_AUTH_MOCK);
            });

            module('angular-token-auth-login-redirect-token-auth-settings');

            inject([
                'authLoginRedirect.getTokenAuthSettings',
                function (getTokenAuthSettings) {
                    this.getTokenAuthSettings = getTokenAuthSettings;
                }
            ]);

            this.TOKEN_AUTH_MOCK.FOO = 'foo default';
            this.TOKEN_AUTH_MOCK.BAR = 'bar default';
            this.PROJECT_SETTINGS_MOCK.TOKEN_AUTH.FOO = 'foo';
        });

        it('should return combined TOKEN_AUTH defaults and PROJECT_SETTINGS.TOKEN_AUTH', function () {
            var MODULE_SETTINGS = this.getTokenAuthSettings();
            expect(MODULE_SETTINGS.FOO).toBe('foo');
            expect(MODULE_SETTINGS.BAR).toBe('bar default');
        });

        describe('called with zero args', function () {

            it('should return object of all settings', function () {
                var allSettings = angular.extend({}, this.TOKEN_AUTH_MOCK, this.PROJECT_SETTINGS_MOCK.TOKEN_AUTH);
                expect(this.getTokenAuthSettings()).toEqual(allSettings);
            });

        });

        describe('called with one arg', function () {

            it('should return the value denoted by the key', function () {
                expect(this.getTokenAuthSettings('FOO')).toEqual('foo');
                expect(this.getTokenAuthSettings('BAR')).toEqual('bar default');
            });

        });
    });

})();
