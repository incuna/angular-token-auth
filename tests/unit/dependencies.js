(function () {
    'use strict';

    var expectModuleToHaveInjectable = function (moduleName, depName, depType) {
        var getDirectiveAttributeFromName = function (name) {
            return name.replace(/([A-Z])/g, function (upperCaseChar) {
                return '-' + upperCaseChar.toLowerCase();
            });
        };

        var injectorFn;
        if (depType === 'factory' || depType === 'service') {
            injectorFn = [depName, angular.noop];
        } else if (depType === 'controller') {
            injectorFn = function ($controller) {
                $controller(depName);
            };
        } else if (depType === 'directive') {
            injectorFn = function ($compile, $rootScope) {
                $compile('<div ' + getDirectiveAttributeFromName(depName) + '></div>')($rootScope);
            };
        }

        var threw = false;
        var thrown = null;
        try {
            inject(injectorFn);
        } catch (error) {
            threw = true;
            thrown = error;
        }

        var result = {};
        if (threw) {
            result.pass = false;
            result.message = ['Expected', moduleName, 'to have injectable', depType, depName, 'but it threw', jasmine.pp(thrown)].join(' ');
        } else {
            result.pass = true;
            result.message = ['Expected', moduleName, 'to not have injectable', depType, depName].join(' ');
        }

        return result;
    };

    var matchers = {
        toHaveInjectableFactory: function () {
            return {
                compare: function (moduleName, depName) {
                    return expectModuleToHaveInjectable(moduleName, depName, 'factory');
                },
            };
        },
        toHaveInjectableService: function () {
            return {
                compare: function (moduleName, depName) {
                    return expectModuleToHaveInjectable(moduleName, depName, 'service');
                },
            };
        },
        toHaveInjectableController: function () {
            return {
                compare: function (moduleName, depName) {
                    return expectModuleToHaveInjectable(moduleName, depName, 'controller');
                },
            };
        },
        toHaveInjectableDirective: function () {
            return {
                compare: function (moduleName, depName) {
                    return expectModuleToHaveInjectable(moduleName, depName, 'directive');
                },
            };
        },
    };

    describe('Dependencies', function () {

        beforeEach(function () {
            jasmine.addMatchers(matchers);
        });

        // Test the matchers for expected failure.
        describe('expected failure', function () {

            beforeEach(function () {
                angular.module('missing-deps', [])
                    .factory('factory', function (missingInjectable) {
                        return missingInjectable;
                    })
                    .service('service', function (missingInjectable) {
                        return missingInjectable;
                    })
                    .controller('controller', function (missingInjectable) {
                        this.foo = missingInjectable;
                    })
                    .directive('directive', function (missingInjectable) {
                        return {
                            link: function (scope) {
                                scope.foo = missingInjectable;
                            },
                        };
                    });
                module('missing-deps');
            });

            describe('for module missing-deps', function () {
                it('should error when injected', function () {
                    expect('missing-deps').not.toHaveInjectableFactory('factory');
                    expect('missing-deps').not.toHaveInjectableService('service');
                    expect('missing-deps').not.toHaveInjectableController('controller');
                    expect('missing-deps').not.toHaveInjectableDirective('directive');
                });
            });

        });

        // Load each module and inject all registered services/factories to
        // uncover those using dependencies they haven't listed in the module.
        angular.registeredModules.forEach(function (moduleName) {
            describe('for module ' + moduleName, function () {

                beforeEach(function () {
                    module(moduleName);
                });

                it('should not error when injected', function () {
                    var moduleDefinition = angular.module(moduleName);
                    moduleDefinition._invokeQueue.forEach(function (providerArgs) {
                        var depType = providerArgs[0];
                        var depName = providerArgs[2][0];

                        var registrationMethod = providerArgs[1];

                        var shouldFail = false;
                        if (depType === '$controllerProvider') {
                            expect(moduleName).toHaveInjectableController(depName);
                        } else if (depType === '$compileProvider') {
                            expect(moduleName).toHaveInjectableDirective(depName);
                        } else if (depType === '$provide') {
                            if (registrationMethod === 'service') {
                                expect(moduleName).toHaveInjectableService(depName);
                            } else if (registrationMethod === 'factory') {
                                expect(moduleName).toHaveInjectableFactory(depName);
                            } else {
                                if (registrationMethod === 'value' || registrationMethod === 'constant') {
                                    // Pass: values and constants can't have
                                    // dependencies so there's nothing to test.
                                } else {
                                    shouldFail = true;
                                }
                            }
                        } else {
                            shouldFail = true;
                        }

                        if (shouldFail) {
                            fail(moduleName + ' has unmatchable provider: ' + jasmine.pp([depType, registrationMethod, depName]));
                        }
                    });
                });

            });
        });

    });

}());
