(function () {
    'use strict';

    describe('auth-actions', function () {

        beforeEach(module('angular-token-auth.auth-actions'));

        beforeEach(function () {
            this.authFactoryMock = jasmine.createSpyObj('authFactory', [
                'setAuth',
                'clearAuth',
            ]);
            module({
                authFactory: this.authFactoryMock,
            });

            this.authModuleSettingsMock = {
                ENDPOINT: '/endpoint/',
            };
            this.PROJECT_SETTINGS_MOCK = {
                API_ROOT: '/api',
            };

            module(['$provide', function ($provide) {
                $provide.constant('authModuleSettings', this.authModuleSettingsMock);
                $provide.constant('PROJECT_SETTINGS', this.PROJECT_SETTINGS_MOCK);
            }.bind(this)]);

            inject(function ($httpBackend, authActionsFactory) {
                this.$httpBackend = $httpBackend;
                this.authActionsFactory = authActionsFactory;
            });
        });

        afterEach(function () {
            this.$httpBackend.verifyNoOutstandingExpectation();
            this.$httpBackend.verifyNoOutstandingRequest();
        });

        describe('login', function () {

            beforeEach(function () {
                this.login = function () {
                    return this.authActionsFactory.login('username', 'password');
                };
                this.post = this.$httpBackend.whenPOST('/api/endpoint/', {
                    username: 'username',
                    password: 'password',
                });
            });

            it('should post the username and password to ENDPOINT', function () {
                this.$httpBackend.expectPOST('/api/endpoint/', {
                    username: 'username',
                    password: 'password',
                });
                this.post.respond(200);
                this.login();
                this.$httpBackend.flush();
            });

            describe('on success', function () {

                beforeEach(function () {
                    this.response = 'token abc123';
                    this.post.respond(200, this.response);
                });

                it('should set auth to the response', function () {
                    this.login();
                    this.$httpBackend.flush();
                    expect(this.authFactoryMock.setAuth).toHaveBeenCalledWith(this.response);
                });

                it('should resolve the returned promise to the response data', function () {
                    var resolved = false;
                    var rejected = false;
                    var resolveValue;
                    this.login()
                        .then(function (data) {
                            resolved = true;
                            resolveValue = data;
                        })
                        .catch(function () {
                            rejected = true;
                        });
                    this.$httpBackend.flush();
                    expect(resolveValue).toBe(this.response);
                    expect(resolved).toBe(true);
                    expect(rejected).toBe(false);
                });

            });

            describe('on failure', function () {

                beforeEach(function () {
                    this.post.respond(401);
                });

                it('should reject the returned promise', function () {
                    var resolved = false;
                    var rejected = false;
                    var rejectValue = 'will be overridden';
                    this.login()
                        .then(function () {
                            resolved = true;
                        })
                        .catch(function (error) {
                            rejected = true;
                            rejectValue = error;
                        });
                    this.$httpBackend.flush();
                    expect(rejectValue).not.toBe('will be overridden');
                    expect(resolved).toBe(false);
                    expect(rejected).toBe(true);
                });

            });

        });

        describe('logout', function () {

            beforeEach(function () {
                this.logout = function () {
                    return this.authActionsFactory.logout();
                };
                this.delete = this.$httpBackend.whenDELETE('/api/endpoint/');
            });

            it('should delete at ENDPOINT', function () {
                this.$httpBackend.expectDELETE('/api/endpoint/');
                this.delete.respond(200);
                this.logout();
                this.$httpBackend.flush();
            });

            describe('always', function () {

                it('should clear auth', function () {
                    this.delete.respond(200);
                    this.logout();
                    this.$httpBackend.flush();
                    expect(this.authFactoryMock.clearAuth).toHaveBeenCalled();
                    expect(this.authFactoryMock.clearAuth).toHaveBeenCalledTimes(1);
                    this.delete.respond(401);
                    this.logout();
                    this.$httpBackend.flush();
                    expect(this.authFactoryMock.clearAuth).toHaveBeenCalledTimes(2);
                });

                it('should redirect to LOGOUT_REDIRECT_URL', function () {
                    inject(function ($location) {
                        this.$location = $location;
                    });
                    spyOn(this.$location, 'url');
                    this.authModuleSettingsMock.LOGOUT_REDIRECT_URL = '/home';
                    this.delete.respond(200);
                    this.logout();
                    this.$httpBackend.flush();
                    expect(this.$location.url).toHaveBeenCalledWith('/home');
                    expect(this.$location.url).toHaveBeenCalledTimes(1);
                    this.delete.respond(401);
                    this.logout();
                    this.$httpBackend.flush();
                    expect(this.$location.url.calls.allArgs()).toEqual([
                        ['/home'],
                        ['/home'],
                    ]);
                    expect(this.$location.url).toHaveBeenCalledTimes(2);
                });

            });

            describe('on success', function () {

                beforeEach(function () {
                    this.response = 'delete success';
                    this.delete.respond(200, this.response);
                });

                it('should return a promise', function () {
                    var resolved = false;
                    var rejected = false;
                    var resolveValue;
                    this.logout()
                        .then(function (data) {
                            resolved = true;
                            resolveValue = data;
                        })
                        .catch(function () {
                            rejected = true;
                        });
                    this.$httpBackend.flush();
                    expect(resolveValue).toBe(this.response);
                    expect(resolved).toBe(true);
                    expect(rejected).toBe(false);
                });

            });

            describe('on failure', function () {

                beforeEach(function () {
                    this.delete.respond(401);
                });

                it('should reject the returned promise', function () {
                    var resolved = false;
                    var rejected = false;
                    var rejectValue = 'will be overridden';
                    this.logout()
                        .then(function () {
                            resolved = true;
                        })
                        .catch(function (error) {
                            rejected = true;
                            rejectValue = error;
                        });
                    this.$httpBackend.flush();
                    expect(rejectValue).not.toBe('will be overridden');
                    expect(resolved).toBe(false);
                    expect(rejected).toBe(true);
                });

            });

        });

    });

}());
