/* global beforeEach, describe, expect, module, it, inject, spyOn */

(function () {

    'use strict';

    describe('login-redirect.services', function () {

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

            module('angular-token-auth-login-redirect-token-auth-clear');

        });

        describe('onTokenAuthClear', function () {

            beforeEach(function () {

                this.$routeMock = {
                    current: {
                        $$route: {}
                    }
                };
                module({
                    $route: this.$routeMock
                });

                inject([
                    'authLoginRedirect.onTokenAuthClear',
                    function (onTokenAuthClear) {
                        this.onTokenAuthClear = onTokenAuthClear;
                    }
                ]);

            });

            describe('routeIsAnonymous method', function () {

                beforeEach(function () {

                    // Routes are anonymous unless told not to be.
                    this.anonymousRoute = {};
                    this.nonAnonymousRoute = {
                        anonymous: false
                    };

                });

                it('should return false for a non-anonymous route', function () {
                    expect(this.onTokenAuthClear.routeIsAnonymous(this.nonAnonymousRoute)).toBe(false);
                });

                it('should return true for an anonymous route', function () {
                    expect(this.onTokenAuthClear.routeIsAnonymous(this.anonymousRoute)).toBe(true);
                });

            });

            describe('redirect method', function () {

                beforeEach(function () {

                    this.TOKEN_AUTH_MOCK.LOGOUT_REDIRECT_URL = '/?show-login';

                    inject(function ($location) {
                        this.$location = $location;
                    });
                    this.$location.url('/current/');

                    // Run.
                    this.onTokenAuthClear.redirect();

                });

                it('should change the url to TOKEN_AUTH.LOGOUT_REDIRECT_URL with the next param set to the current path', function () {
                    expect(this.$location.path()).toBe('/');
                    expect(this.$location.search()).toEqual({
                        'show-login': true,
                        next: '/current/'
                    });
                });

            });

            describe('handler method', function () {

                beforeEach(function () {

                    spyOn(this.onTokenAuthClear, 'redirect');
                    spyOn(this.onTokenAuthClear, 'routeIsAnonymous');

                    this.run = function () {
                        this.onTokenAuthClear.handler();
                    };

                });

                it('should call routeIsAnonymous with the current route', function () {
                    this.run();
                    expect(this.onTokenAuthClear.routeIsAnonymous).toHaveBeenCalledWith(this.$routeMock.current.$$route);
                });

                it('should call redirect if routeIsAnonymous returns false', function () {
                    this.onTokenAuthClear.routeIsAnonymous.and.returnValue(false);
                    this.run();
                    expect(this.onTokenAuthClear.redirect).toHaveBeenCalled();
                });

                it('should not call redirect if routeIsAnonymous returns true', function () {
                    this.onTokenAuthClear.routeIsAnonymous.and.returnValue(true);
                    this.run();
                    expect(this.onTokenAuthClear.redirect).not.toHaveBeenCalled();
                });

            });

        });

    });

}());
