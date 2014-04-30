(function (angular) {
    'use strict';

    var auth = angular.module('angular-token-auth', ['ngCookies', 'project_settings']);

    // Default settings. You can override these in your settings module.
    auth.constant('TOKEN_AUTH', {
        ENDPOINT: '/auth/',
        LOGIN: '/login/',
        LOGOUT: '/logout/',
        LOGIN_REDIRECT_URL: '/'
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

    auth.factory('authInterceptor', ['$rootScope', '$q', 'tokenFactory', function ($rootScope, $q, tokenFactory) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                var token = tokenFactory.getToken();
                if (token) {
                    config.headers.Authorization = 'Token ' + token;
                }
                return config;
            },
            responseError: function (response) {
                if (response.status === 401) {
                    tokenFactory.clearToken();
                }
                return $q.reject(response);
            }
        };
    }]);

    auth.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }]);

    auth.run(['$rootScope', '$location', 'tokenFactory', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($rootScope, $location, tokenFactory, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        $rootScope.$on('$routeChangeStart', function (e, next, current) {
            var nextRoute = next.$$route;
            // By default, all routes should be anonymous.
            var nextRouteIsAnonymous = true;
            if (nextRoute.anonymous === false) {
                nextRouteIsAnonymous = false;
            }

            // If the next route isn't anonymous and a token doesn't exist,
            // redirect to the log in page with a `next` parameter set to the
            // anonymous path.
            if (!nextRouteIsAnonymous && !tokenFactory.getToken()) {
                $location.url(MODULE_SETTINGS.LOGIN + '?next=' + $location.path());
                $location.replace();
            }
        });

    }]);

    auth.directive('loginForm', ['$location', 'authenticationFactory', 'tokenFactory', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($location, authenticationFactory, tokenFactory, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        // If we are already logged in.
        if (tokenFactory.getToken()) {
            $location.url(MODULE_SETTINGS.LOGIN_REDIRECT_URL);
        }

        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'templates/auth/login_form.html',
            link: function (scope, element, attrs) {
                scope.status = {};
                scope.fields = {
                    username: {
                        required: true
                    },
                    password: {
                        required: true
                    }
                };

                scope.login = function () {
                    scope.fields.errors = '';
                    scope.fields.username.errors = '';
                    scope.fields.password.errors = '';

                    scope.status.authenticating = true;

                    authenticationFactory.login(scope.fields.username.value, scope.fields.password.value)
                        .then(function (response) {
                            $location.url($location.search().next || MODULE_SETTINGS.LOGIN_REDIRECT_URL);
                        }, function (response, status) {
                            if (response.non_field_errors) {
                                scope.fields.errors = [{
                                    msg: response.non_field_errors[0]
                                }];
                            }
                            scope.fields.username.errors = response.username ? response.username[0] : '';
                            scope.fields.password.errors = response.password ? response.password[0] : '';
                        })['finally'](function () {
                            scope.status.authenticating = false;
                        });
                };
            }
        };
    }]);

    auth.controller('LoginCtrl', [function () {}]);

    auth.controller('LogoutCtrl', ['authenticationFactory', function (authenticationFactory) {
        authenticationFactory.logout();
    }]);

    auth.factory('tokenFactory', ['$rootScope', '$cookieStore', function ($rootScope, $cookieStore) {
        return {
            getToken: function () {
                var auth = $cookieStore.get('auth');
                if (angular.isDefined(auth)) {
                    return auth.token;
                }
                return null;
            },
            setToken: function (token) {
                $rootScope.$broadcast('tokenAuth:set');
                $cookieStore.put('auth', {
                    token: token
                });
            },
            clearToken: function () {
                $rootScope.$broadcast('tokenAuth:clear');
                $cookieStore.remove('auth');
            }
        };
    }]);

    auth.factory('authenticationFactory', ['$q', '$http', '$cookieStore', '$location', 'TOKEN_AUTH', 'PROJECT_SETTINGS', 'tokenFactory', function ($q, $http, $cookieStore, $location, TOKEN_AUTH, PROJECT_SETTINGS, tokenFactory) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        return {
            login: function (username, password) {
                var deferred = $q.defer();

                $http.post(PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT, {
                    username: username,
                    password: password
                }).success(function (data) {
                    tokenFactory.setToken(data.token);
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            logout: function () {
                tokenFactory.clearToken();
                $location.url(MODULE_SETTINGS.LOGOUT);
            }
        };
    }]);
}(window.angular));
