(function (angular) {
    'use strict';

    var auth = angular.module('angular-token-auth', ['project_settings']);

    // Default settings. You can override these in your settings module.
    auth.constant('TOKEN_AUTH', {
        ENDPOINT: '/auth/',
        LOGIN: '/login/',
        LOGOUT: '/logout/',
        LOGIN_REDIRECT_URL: '/',
        LOGOUT_REDIRECT_URL: '/logout/',
        AUTH_HEADER_PREFIX: 'Token',
        ALLOWED_HOSTS: [],
        STORAGE_METHOD: 'auto'
        COOKIE_PATH: null
    });

    auth.config(['$routeProvider', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($routeProvider, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        $routeProvider
            .when(MODULE_SETTINGS.LOGIN, {
                templateUrl: 'templates/auth/login.html',
                controller: 'LoginCtrl',
                anonymousOnly: true
            })
            .when(MODULE_SETTINGS.LOGOUT, {
                templateUrl: 'templates/auth/logout.html',
                controller: 'LogoutCtrl'
            });
    }]);

    auth.factory('authInterceptor', ['$rootScope', '$q', '$location', 'authFactory', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($rootScope, $q, $location, authFactory, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        return {
            request: function (config) {
                // Only transform requests for hosts in the ALLOWED_HOSTS setting.
                var allowedHosts = MODULE_SETTINGS.ALLOWED_HOSTS;
                var urlElement = document.createElement('a');
                urlElement.href = config.url;
                var host = urlElement.host;
                var hostname = urlElement.hostname;

                if (!(host || hostname)) {
                    // IE does not set the host / hostname for relative paths
                    host = hostname = $location.host();
                }

                if (allowedHosts.indexOf(host) > -1 || allowedHosts.indexOf(hostname) > -1) {
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

    auth.run(['$rootScope', '$location', '$log', 'authFactory', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($rootScope, $location, $log, authFactory, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);
        if (!MODULE_SETTINGS.ALLOWED_HOSTS.length) {
            $log.error('ALLOWED_HOSTS is empty. Set ALLOWED_HOSTS to a list of hosts that the auth token can be sent to.');
        }

        $rootScope.$on('$routeChangeStart', function (e, next, current) {
            var nextRoute = next.$$route;

            // By default, all routes should be anonymous.
            var nextRouteIsAnonymous = true;
            if (angular.isDefined(nextRoute) && nextRoute.anonymous === false) {
                nextRouteIsAnonymous = false;
            }

            var nextRouteAnonymousOnly = false;
            if (angular.isDefined(nextRoute) && nextRoute.anonymousOnly === true) {
                nextRouteAnonymousOnly = true;
            }

            if (authFactory.getToken()) {
                // If the next route is public only and we are logged in then redirect to the
                // login redirect URL.
                if (nextRouteAnonymousOnly) {
                    $location.url(MODULE_SETTINGS.LOGIN_REDIRECT_URL);
                }
            } else {
                // If the next route isn't anonymous and a token doesn't exist,
                // redirect to the log in page with a `next` parameter set to the
                // anonymous path.
                if (!nextRouteIsAnonymous) {
                    $location.url(MODULE_SETTINGS.LOGIN + '?next=' + $location.path());
                    $location.replace();
                }
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
    // auth.factory('AppAuthLoginFormFactory', [
    //     'AuthLoginFormFactory',
    //     function (AuthLoginFormFactory) {
    //         var AppAuthLoginFormFactory = function (scope, element, attrs) {
    //             AuthLoginFormFactory.apply(this, arguments);
    //         };
    //         AppAuthLoginFormFactory.prototype = Object.create(authLoginFormFactory.prototype);
    //         AppAuthLoginFormFactory.prototype.loginFailed = function (response) {
    //              AuthLoginFormFactory.prototype.loginFailed.apply(this, arguments);
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

    auth.factory('authStorageFactory', ['$window', '$browser', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($window, $browser, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);
        var cookiePath = MODULE_SETTINGS.COOKIE_PATH ? MODULE_SETTINGS.COOKIE_PATH : $browser.baseHref();

        var storageMethods = {
            noSupport: {
                // No supported storage methods, but we have to return empty functions so the
                //  interface doesn't break
                set: function () {},
                get: function () {},
                clear: function () {}
            },
            cookie: {
                // Not using angular $cookieStore because it does not support setting a path.
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
                    var encodedValue = encodeURIComponent(angular.toJson(value));
                    $window.document.cookie = encodeURIComponent(key) + '=' + encodedValue +
                        (cookiePath ? ';path=' + cookiePath : '');
                },
                get: function (key) {
                    var cookieArray = $window.document.cookie.split('; ');
                    for (var i = 0, l = cookieArray.length; i < l; i++) {
                        var cookie = cookieArray[i];
                        var index = cookie.indexOf('=');
                        //ignore nameless cookies
                        if (index > 0) {
                            var name = decodeURIComponent(cookie.substring(0, index));
                            if (name === key) {
                                var value = decodeURIComponent(cookie.substring(index + 1));
                                return value ? angular.fromJson(value) : value;
                            }
                        }
                    }
                },
                clear: function (key) {
                    //delete cookie by setting old expiry date
                    $window.document.cookie = encodeURIComponent(key) + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
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

        if (MODULE_SETTINGS.STORAGE_METHOD === 'cookie') {
            return storageMethods['cookie'];
        } else if (MODULE_SETTINGS.STORAGE_METHOD === 'localstorage') {
            return storageMethods['localStorage'];
        } else {
            // Use the default 'auto' method for determining storage type
            // Use cookies if available, otherwise try localstorage
            if (storageMethods['cookie'].test() === true) {
                return storageMethods['cookie'];
            } else if (storageMethods['localStorage'].test()) {
                return storageMethods['localStorage'];
            } else {
                return storageMethods['noSupport'];
            }
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

    auth.factory('authActionsFactory', ['$q', '$http', '$location', 'TOKEN_AUTH', 'PROJECT_SETTINGS', 'authFactory', function ($q, $http, $location, TOKEN_AUTH, PROJECT_SETTINGS, authFactory) {
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
                }).error(deferred.reject);

                return deferred.promise;
            },
            logout: function () {
                var deferred = $q.defer();

                $http.delete(PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT)
                    .success(deferred.resolve)
                    .error(deferred.reject)
                    ['finally'](function () {
                        authFactory.clearAuth();
                        $location.url(MODULE_SETTINGS.LOGOUT_REDIRECT_URL);
                    });

                return deferred.promise;
            }
        };
    }]);
}(window.angular));
