(function () {
    'use strict';

    var expectModuleToHaveInjectable = function (moduleName, depName, depType) {
        var result = {};

        var threw = false;
        var thrown = null;
        try {
            if (['service', 'factory', 'constant', 'value'].indexOf(depType) !== -1) {
                inject([depName, function () {}]); // eslint-disable-line no-empty-function
            } else if (depType === 'controller') {
                inject(function ($controller) {
                    $controller(depName);
                });
            } else if (depType === 'directive') {
                var directiveName = depName.replace(/([A-Z])/g, function (uppercaseChar) {
                    return '-' + uppercaseChar.toLowerCase();
                });
                inject(function ($compile, $rootScope) {
                    $compile('<div ' + directiveName + '></div>')($rootScope);
                });
            }
        } catch (error) {
            threw = true;
            thrown = error;
        }

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
        toHaveInjectableValue: function () {
            return {
                compare: function (moduleName, depName) {
                    return expectModuleToHaveInjectable(moduleName, depName, 'value');
                },
            };
        },
        toHaveInjectableConstant: function () {
            return {
                compare: function (moduleName, depName) {
                    return expectModuleToHaveInjectable(moduleName, depName, 'constant');
                },
            };
        },
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
                            if (registrationMethod === 'value') {
                                expect(moduleName).toHaveInjectableValue(depName);
                            } else if (registrationMethod === 'constant') {
                                expect(moduleName).toHaveInjectableConstant(depName);
                            } else if (registrationMethod === 'service') {
                                expect(moduleName).toHaveInjectableService(depName);
                            } else if (registrationMethod === 'factory') {
                                expect(moduleName).toHaveInjectableFactory(depName);
                            } else {
                                shouldFail = true;
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
