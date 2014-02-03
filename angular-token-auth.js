(function () {
    'use strict';

    var auth = angular.module('ngTokenAuth', ['ngCookies', 'project_settings']);

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
                controller: 'LoginCtrl',
                anonymous: true
            })
            .when(MODULE_SETTINGS.LOGOUT, {
                templateUrl: 'templates/auth/logout.html',
                controller: 'LogoutCtrl',
                anonymous: true
            });
    }]);

    auth.run(['$rootScope', '$location', 'tokenAuth', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($rootScope, $location, tokenAuth, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        $rootScope.$on('$routeChangeStart', function (e, next, current) {
            if (next.$$route && !next.$$route.anonymous && !tokenAuth.authenticated) {
                $location.url(MODULE_SETTINGS.LOGIN + '?next=' + $location.path());
                $location.replace();
            }
        });

    }]);

    auth.directive('loginForm', ['$location', 'tokenAuth', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($location, tokenAuth, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        if(tokenAuth.authenticated) {
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

                    tokenAuth.login(scope.fields.username.value, scope.fields.password.value).then(function (response) {
                        $location.path($location.search().next || MODULE_SETTINGS.LOGIN_REDIRECT_URL);
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

    auth.controller('LogoutCtrl', ['tokenAuth', function (tokenAuth) {
        tokenAuth.logout();
    }]);

    auth.factory('tokenAuth', ['$q', '$http', '$cookieStore', '$location', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($q, $http, $cookieStore, $location, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        var tokenAuth = {
            authenticated: false,
            token: null,
            login: function (username, password) {
                var deferred = $q.defer();

                $http.post(PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT, {
                    username: username,
                    password: password
                }).success(function (data) {
                    tokenAuth.authenticated = true;
                    tokenAuth.token = data.token;
                    $cookieStore.put('auth', {
                        token: data.token
                    });
                    deferred.resolve(tokenAuth);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            logout: function () {
                $cookieStore.remove('auth');
                tokenAuth.token = null;
                tokenAuth.authenticated = false;
                $location.url(MODULE_SETTINGS.LOGOUT);
            }
        };

        var cookie = $cookieStore.get('auth');
        if (cookie && cookie.token) {
            tokenAuth.authenticated = true;
            tokenAuth.token = cookie.token;
        }

        return tokenAuth;
    }]);
}());
