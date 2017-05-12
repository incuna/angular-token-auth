(function () {
    'use strict';

    describe('auth-login-form', function () {

        describe('loginForm directive', function () {

            beforeEach(module('angular-token-auth.auth-login-form'));

            beforeEach(function () {
                this.AuthLoginFormFactoryMock = jasmine.createSpy('AuthLoginFormFactory');
                module({
                    AuthLoginFormFactory: this.AuthLoginFormFactoryMock,
                });

                inject(function (
                    $compile,
                    $rootScope,
                    $templateCache,
                    loginFormDirective,
                    authLoginFormDirectiveFactory
                ) {
                    this.$compile = $compile;
                    this.$rootScope = $rootScope;
                    this.$templateCache = $templateCache;
                    this.loginFormDirective = loginFormDirective[0];
                    this.authLoginFormDirectiveFactory = authLoginFormDirectiveFactory;
                });

                this.$templateCache.put('templates/auth/login_form.html', '<p>Just testing</p>');
            });

            it('should be the same as authLoginFormDirectiveFactory', function () {
                expect(this.loginFormDirective).toBe(this.authLoginFormDirectiveFactory);
            });

            it('should use the login_form template', function () {
                expect(this.loginFormDirective.templateUrl).toBe('templates/auth/login_form.html');
            });

            it('should use AuthLoginFormFactory', function () {
                this.$compile('<div login-form></div>')(this.$rootScope);
                this.$rootScope.$apply();
                expect(this.AuthLoginFormFactoryMock).toHaveBeenCalled();
            });

        });

        describe('AuthLoginFormFactory', function () {

            beforeEach(module('angular-token-auth.auth-login-form-factory'));

            beforeEach(function () {
                this.authModuleSettingsMock = {
                    LOGIN_REDIRECT_URL: '/login-redirect',
                };
                module({
                    authModuleSettings: this.authModuleSettingsMock,
                });

                inject(function (
                    $location,
                    authFactory,
                    authActionsFactory
                ) {
                    this.$location = $location;
                    this.authFactory = authFactory;
                    this.authActionsFactory = authActionsFactory;
                });
            });

            describe('when first injected', function () {

                beforeEach(function () {
                    spyOn(this.authFactory, 'getToken');
                    spyOn(this.$location, 'url');
                });

                describe('with an auth token', function () {
                    beforeEach(function () {
                        this.authFactory.getToken.and.returnValue('abc123');
                    });
                    it('should redirect to LOGIN_REDIRECT_URL', function () {
                        expect(this.$location.url).not.toHaveBeenCalled();
                        inject(function (AuthLoginFormFactory) { // eslint-disable-line no-unused-vars
                            expect(this.$location.url).toHaveBeenCalledWith('/login-redirect');
                        });
                    });
                });

                describe('without an auth token', function () {
                    beforeEach(function () {
                        this.authFactory.getToken.and.returnValue(null);
                    });
                    it('should not redirect anywhere', function () {
                        inject(function (AuthLoginFormFactory) { // eslint-disable-line no-unused-vars
                            expect(this.$location.url).not.toHaveBeenCalled();
                        });
                    });
                });

            });

            describe('scope', function () {

                beforeEach(function () {
                    inject(function (
                        $q,
                        $rootScope,
                        AuthLoginFormFactory
                    ) {
                        this.$q = $q;
                        this.$rootScope = $rootScope;
                        this.AuthLoginFormFactory = AuthLoginFormFactory;
                    });

                    this.loginDeferred = this.$q.defer();
                    spyOn(this.authActionsFactory, 'login').and.returnValue(this.loginDeferred.promise);

                    this.resolveLogin = function () {
                        this.loginDeferred.resolve();
                        this.$rootScope.$apply();
                    };
                    this.rejectLogin = function (rejection) {
                        this.loginDeferred.reject(rejection);
                        this.$rootScope.$apply();
                    };

                    this.scope = this.$rootScope.$new();
                    new this.AuthLoginFormFactory(this.scope);
                });

                it('should be initialised with fields and methods', function () {
                    expect(this.scope.status).toBeObject();
                    expect(this.scope.fields).toBeObject();
                    expect(this.scope.login).toBeFunction();
                });

                it('should have required username and password fields', function () {
                    expect(this.scope.fields.username.required).toBe(true);
                    expect(this.scope.fields.password.required).toBe(true);
                });

                describe('login', function () {

                    beforeEach(function () {
                        spyOn(this.$location, 'url');

                        this.scope.fields.username.value = 'username';
                        this.scope.fields.password.value = 'password';
                        this.scope.login();
                    });

                    it('should clear errors', function () {
                        expect(this.scope.errors).toBeUndefined();
                        expect(this.scope.fields.errors).toBe('');
                        expect(this.scope.fields.username.errors).toBe('');
                        expect(this.scope.fields.password.errors).toBe('');
                    });

                    it('should enable authenticating status', function () {
                        expect(this.scope.status.authenticating).toBe(true);
                    });

                    it('should pass username and password to authActionsFactory', function () {
                        expect(this.authActionsFactory.login).toHaveBeenCalledWith('username', 'password');
                    });

                    describe('success', function () {

                        it('should redirect to LOGIN_REDIRECT_URL', function () {
                            this.resolveLogin();
                            expect(this.$location.url).toHaveBeenCalledWith('/login-redirect');
                        });

                        it('should redirect to ?next url param if present', function () {
                            spyOn(this.$location, 'search').and.returnValue({
                                next: 'next-page',
                            });
                            this.resolveLogin();
                            expect(this.$location.url).toHaveBeenCalledWith('next-page');
                        });

                    });

                    describe('failure', function () {

                        it('should set the response to errors', function () {
                            var response = {
                                non_field_errors: ['non field error'], // eslint-disable-line camelcase
                                username: ['username error'],
                                password: ['password error'],
                            };
                            this.rejectLogin(response);
                            expect(this.scope.errors).toBe(response);
                            expect(this.scope.fields.errors).toEqual([{
                                msg: 'non field error',
                            }]);
                            expect(this.scope.fields.username.errors).toBe('username error');
                            expect(this.scope.fields.password.errors).toBe('password error');
                        });

                    });

                    describe('finally', function () {

                        describe('after success', function () {
                            it('should disable authenticating status', function () {
                                this.resolveLogin();
                                expect(this.scope.status.authenticating).toBe(false);
                            });
                        });

                        describe('after failure', function () {
                            it('should disable authenticating status', function () {
                                this.rejectLogin({});
                                expect(this.scope.status.authenticating).toBe(false);
                            });
                        });

                    });

                });

            });

        });

    });

}());
