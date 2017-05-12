(function () {
    'use strict';

    describe('auth-login-controller', function () {

        describe('LoginCtrl', function () {

            it('should be a noop so projects can set their own', function () {
                // Spy on the controller registration in a module before loading
                // any other.
                var self = this;
                module(function ($controllerProvider) {
                    spyOn($controllerProvider, 'register');
                    expect($controllerProvider.register).not.toHaveBeenCalled();

                    self.$controllerProvider = $controllerProvider;
                });

                // Load this module and injector so the controller is registered.
                module('angular-token-auth.auth-login');
                inject(angular.noop);
                expect(this.$controllerProvider.register).toHaveBeenCalledWith('LoginCtrl', [angular.noop]);
            });

        });

    });


    describe('auth-logout-controller', function () {

        beforeEach(function () {

            module('angular-token-auth.auth-logout');

            this.authActionsFactoryMock = jasmine.createSpyObj('authActionsFactory', ['logout']);

            module({
                authActionsFactory: this.authActionsFactoryMock,
            });

            inject(function ($rootScope, $controller) {
                this.$rootScope = $rootScope;
                this.$controller = $controller;
            });

        });

        describe('LogoutCtrl', function () {

            it('should logout the user upon creation', function () {
                expect(this.authActionsFactoryMock.logout).not.toHaveBeenCalled();
                this.$controller('LogoutCtrl');
                expect(this.authActionsFactoryMock.logout).toHaveBeenCalled();
            });

        });

    });

}());
