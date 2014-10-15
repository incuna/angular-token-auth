(function (angular) {
    'use strict';

    var auth = angular.module('angular-token-auth', ['ngCookies', 'project_settings']);

    // Default settings. You can override these in your settings module.
    auth.constant('TOKEN_AUTH', {
        ENDPOINT: '/auth/',
        LOGIN: '/login/',
        LOGOUT: '/logout/',
        LOGIN_REDIRECT_URL: '/',
        AUTH_HEADER_PREFIX: 'Token',
        ALLOWED_HOSTS: []
    });

    auth.config(['$routeProvider', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($routeProvider, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        $routeProvider
            .when(MODULE_SETTINGS.LOGIN, {
                templateUrl: 'templates/auth/login.html',
                controller: 'LoginCtrl'
            })
            .when(MODULE_SETTINGS.LOGOUT, {
                templateUrl: 'templates/auth/logout.html',
                controller: 'LogoutCtrl'
            });
    }]);

    auth.factory('authInterceptor', ['$rootScope', '$q', 'authFactory', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($rootScope, $q, authFactory, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        return {
            request: function (config) {
                // Only transform requests for hosts in the ALLOWED_HOSTS setting.
                var allowedHosts = MODULE_SETTINGS.ALLOWED_HOSTS;
                var urlElement = document.createElement('a');
                urlElement.href = config.url;

                if (allowedHosts.indexOf(urlElement.host) > -1 || allowedHosts.indexOf(urlElement.hostname) > -1) {
                    config.headers = config.headers || {};
                    var token = authFactory.getToken();
                    if (token) {
                        config.headers.Authorization = MODULE_SETTINGS.AUTH_HEADER_PREFIX + ' ' + token;
                    }
                }

                return config;
            },
            responseError: function (response) {
                if (response.status === 401) {
                    authFactory.clearAuth();
                }
                return $q.reject(response);
            }
        };
    }]);

    auth.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }]);

    auth.run(['$rootScope', '$location', 'authFactory', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($rootScope, $location, authFactory, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        $rootScope.$on('$routeChangeStart', function (e, next, current) {
            var nextRoute = next.$$route;
            // By default, all routes should be anonymous.
            var nextRouteIsAnonymous = true;
            if (angular.isDefined(nextRoute) && nextRoute.anonymous === false) {
                nextRouteIsAnonymous = false;
            }

            // If the next route isn't anonymous and a token doesn't exist,
            // redirect to the log in page with a `next` parameter set to the
            // anonymous path.
            if (!nextRouteIsAnonymous && !authFactory.getToken()) {
                $location.url(MODULE_SETTINGS.LOGIN + '?next=' + $location.path());
                $location.replace();
            }
        });

    }]);

    auth.factory('authModuleSettings', [
        'TOKEN_AUTH', 'PROJECT_SETTINGS',
        function (TOKEN_AUTH, PROJECT_SETTINGS) {
            return angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);
        }
    ]);

    // extend this in your app using:
    // auth.factory('appAuthLoginFormFactory', [
    //     'AuthLoginFormFactory',
    //     function (AuthLoginFormFactory) {
    //         var appDirectiveLink = function (scope, element, attrs) {
    //             authLoginFormFactory.apply(this, arguments);
    //         };
    //         appDirectiveLink.prototype = Object.create(authLoginFormFactory.prototype); 
    //         appDirectiveLink.prototype.loginFailed = function (response) {
    //              authLoginFormFactory.prototype.loginFailed.apply(this, arguments);
    //              // your own code here
    //         };
    //     }
    // ]);
    auth.factory('AuthLoginFormFactory', [
        'authActionsFactory', '$location', 'authFactory', 'authModuleSettings',
        function (authActionsFactory, $location, authFactory, authModuleSettings) {

            // If we are already logged in.
            if (authFactory.getToken()) {
                $location.url(authModuleSettings.LOGIN_REDIRECT_URL);
            }

            var AuthLoginFormFactory = function (scope, element, attrs) {
                this.scope = scope;
                this.init();
            };

            AuthLoginFormFactory.prototype = {
                init: function () {
                    this.scope.status = {};
                    this.scope.fields = {
                        username: {
                            required: true
                        },
                        password: {
                            required: true
                        }
                    };

                    this.scope.login = angular.bind(this, this.loginClick);
                },
                loginSuccess: function (response) {
                    $location.url($location.search().next || authModuleSettings.LOGIN_REDIRECT_URL);
                },
                loginFailed: function (response) {
                    if (response.non_field_errors) {
                        this.scope.fields.errors = [{
                            msg: response.non_field_errors[0]
                        }];
                    }
                    this.scope.fields.username.errors = response.username ? response.username[0] : '';
                    this.scope.fields.password.errors = response.password ? response.password[0] : '';
                },
                loginFinally: function (response) {
                    this.scope.status.authenticating = false;
                },
                loginClick: function () {
                    this.scope.fields.errors = '';
                    this.scope.fields.username.errors = '';
                    this.scope.fields.password.errors = '';

                    this.scope.status.authenticating = true;

                    authActionsFactory.login(this.scope.fields.username.value, this.scope.fields.password.value)
                        .then(
                            angular.bind(this, this.loginSuccess),
                            angular.bind(this, this.loginFailed)
                        )
                        ['finally'](angular.bind(this, this.loginFinally));
                }
            }

            return AuthLoginFormFactory;
        }
    ]);

    auth.factory('authLoginFormDirectiveFactory', [
        'AuthLoginFormFactory',
        function (AuthLoginFormFactory) {
            return {
                restrict: 'A',
                scope: true,
                templateUrl: 'templates/auth/login_form.html',
                link: function (scope, element, attrs) {
                    new AuthLoginFormFactory(scope, element, attrs);
                }
            };
        }
    ]);

    // extend this in your app by doing:
    // auth.directive('appLoginForm', [
    //     'authLoginFormDirectiveFactory', 'appAuthLoginFormFactory',
    //     function (authLoginFormDirectiveFactory, appAuthLoginFormFactory) {
    //         return angular.extend({}, authLoginFormDirectiveFactory, {
    //             link: function (scope, element, attrs) {
    //                 new appAuthLoginFormFactory(scope, element, attrs);
    //             }
    //         });
    //     }
    // ]);
    auth.directive('loginForm', [
        'authLoginFormDirectiveFactory',
        function (authLoginFormDirectiveFactory) {
            return authLoginFormDirectiveFactory;
        }
    ]);

    auth.controller('LoginCtrl', [function () {}]);

    auth.controller('LogoutCtrl', ['authActionsFactory', function (authActionsFactory) {
        authActionsFactory.logout();
    }]);

    auth.factory('authStorageFactory', ['$cookieStore', '$window', function ($cookieStore, $window) {

        var storageMethods = {
            noSupport: {
                // No supported storage methods, but we have to return empty functions so the
                //  interface doesn't break
                set: function () {},
                get: function () {},
                clear: function () {}
            },
            cookie: {
                test: function () {
                    // Return true if browser has cookie support. Using angular $cookieStore incorrectly
                    //  returns true here when cookies are not supported because of internal caching
                    //  between digest cycles.
                    //  For this reason we interact with the document cookies directly
                    $window.document.cookie = 'testcookie=test';
                    var cookieEnabled = ($window.document.cookie.indexOf('testcookie') !== -1) ? true : false;
                    //delete test cookie by setting old expiry date
                    $window.document.cookie = 'testcookie=test;expires=Thu, 01-Jan-1970 00:00:01 GMT';
                    return cookieEnabled;
                },
                set: function (key, value) {
                    $cookieStore.put(key, value);
                },
                get: function (key) {
                    return $cookieStore.get(key);
                },
                clear: function (key) {
                    $cookieStore.remove(key);
                }
            },
            localStorage: {
                test: function () {
                    return angular.isDefined($window.localStorage);
                },
                set: function (key, value) {
                    $window.localStorage.setItem(key, angular.toJson(value));
                },
                get: function (key) {
                    return angular.fromJson($window.localStorage.getItem(key));
                },
                clear: function (key) {
                    $window.localStorage.removeItem(key);
                }
            }
        };

        //use cookies if available, otherwise try localstorage
        if (storageMethods['cookie'].test() === true) {
            return storageMethods['cookie'];
        } else if (storageMethods['localStorage'].test()) {
            return storageMethods['localStorage'];
        } else {
            return storageMethods['noSupport'];
        }

    }]);

    auth.factory('authFactory', ['$rootScope', 'authStorageFactory', function ($rootScope, authStorageFactory) {
        return {
            getAuth: function () {
                var auth = authStorageFactory.get('auth');
                if (angular.isObject(auth)) {
                    return auth;
                }
                return null;
            },
            getToken: function () {
                var auth = this.getAuth();
                if (auth !== null && angular.isDefined(auth.token)) {
                    return auth.token;
                }
                return null;
            },
            setAuth: function (data) {
                authStorageFactory.set('auth', data);
                $rootScope.$broadcast('tokenAuth:set');
            },
            clearAuth: function () {
                authStorageFactory.clear('auth');
                $rootScope.$broadcast('tokenAuth:clear');
            }
        };
    }]);

    auth.factory('authActionsFactory', ['$q', '$http', '$cookieStore', '$location', 'TOKEN_AUTH', 'PROJECT_SETTINGS', 'authFactory', function ($q, $http, $cookieStore, $location, TOKEN_AUTH, PROJECT_SETTINGS, authFactory) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        return {
            login: function (username, password) {
                var deferred = $q.defer();

                $http.post(PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT, {
                    username: username,
                    password: password
                }).success(function (data) {
                    authFactory.setAuth(data);
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            logout: function () {
                authFactory.clearAuth();
                $location.url(MODULE_SETTINGS.LOGOUT);
            }
        };
    }]);
}(window.angular));
