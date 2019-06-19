(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.config', [
        'angular-token-auth.constants',
        'project_settings',
    ]);

    module.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    }]);

    module.run(['$rootScope', '$log', 'authRouteChangeStartFactory', 'authModuleSettings', function ($rootScope, $log, authRouteChangeStartFactory, MODULE_SETTINGS) {
        if (!MODULE_SETTINGS.ALLOWED_HOSTS.length) {
            $log.error('ALLOWED_HOSTS is empty. Set ALLOWED_HOSTS to a list of hosts that the auth token can be sent to.');
        }

        $rootScope.$on('$routeChangeStart', authRouteChangeStartFactory);
    }]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.constants', []);

    module.constant('TOKEN_AUTH', {
        ENDPOINT: '/auth/',
        LOGIN: '/login/',
        LOGOUT: '/logout/',
        LOGIN_REDIRECT_URL: '/',
        LOGOUT_REDIRECT_URL: '/logout/',
        AUTH_HEADER_PREFIX: 'Token',
        ALLOWED_HOSTS: [],
        COOKIE_PATH: null,
        // Optional settings:
        // STORAGE_METHOD: 'cookie'
        // STORAGE_METHOD: 'localStorage'
        // STORAGE_METHOD: 'noSupport'
    });

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-login', []);

    // Fill this in the project.
    module.controller('LoginCtrl', [angular.noop]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-logout', [
        'angular-token-auth.auth-actions',
    ]);

    module.controller('LogoutCtrl', ['authActionsFactory', function (authActionsFactory) {
        authActionsFactory.logout();
    }]);

}(window.angular));

(function (angular) {
    'use strict';
    var module = angular.module('angular-token-auth.auth-login-form', [
        'angular-token-auth.auth-login-form-directive-factory',
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
    module.directive('loginForm', [
        'authLoginFormDirectiveFactory',
        function (authLoginFormDirectiveFactory) {
            return authLoginFormDirectiveFactory;
        },
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    angular.module('angular-token-auth', [
        'angular-token-auth.auth-login',
        'angular-token-auth.auth-logout',
        'angular-token-auth.auth-login-form',
        'angular-token-auth.auth-actions',
        'angular-token-auth.auth',
        'angular-token-auth.auth-interceptor',
        'angular-token-auth.auth-login-form-directive-factory',
        'angular-token-auth.auth-login-form',
        'angular-token-auth.auth-module-settings',
        'angular-token-auth.auth-route-change-start',
        'angular-token-auth.auth-storage',
        'angular-token-auth.routes',
        'angular-token-auth.config',
        'angular-token-auth.constants',
        'angular-token-auth.auth-login-form-factory',
        'angular-token-auth-login-redirect',
        'angular-token-auth-login-redirect-token-auth-clear',
        'angular-token-auth-login-redirect-token-auth-settings',
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-actions', [
        'project_settings',
        'angular-token-auth.auth',
        'angular-token-auth.auth-module-settings',
    ]);

    module.factory('authActionsFactory', [
        '$q',
        '$http',
        '$location',
        'PROJECT_SETTINGS',
        'authModuleSettings',
        'authFactory',
        function ($q, $http, $location, PROJECT_SETTINGS, MODULE_SETTINGS, authFactory) {
            return {
                login: function (username, password) {
                    var deferred = $q.defer();

                    $http.post(PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT, {
                        username: username,
                        password: password,
                    }).success(function (data) {
                        authFactory.setAuth(data);
                        deferred.resolve(data);
                    }).error(deferred.reject);

                    return deferred.promise;
                },
                logout: function () {
                    var deferred = $q.defer();

                    /* eslint-disable dot-notation, no-unexpected-multiline */
                    $http['delete'](PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT)
                        .success(deferred.resolve)
                        .error(deferred.reject)
                        ['finally'](function () {
                            authFactory.clearAuth();
                            $location.url(MODULE_SETTINGS.LOGOUT_REDIRECT_URL);
                        });
                    /* eslint-enable dot-notation, no-unexpected-multiline */

                    return deferred.promise;
                },
            };
        }]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth', [
        'angular-token-auth.auth-storage',
    ]);

    module.factory('authFactory', [
        '$rootScope',
        'authStorageFactory',
        'authModuleSettings',
        function ($rootScope, authStorageFactory, MODULE_SETTINGS) {
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
                getHeaderPrefix: function () {
                    var auth = this.getAuth();
                    if (auth !== null && angular.isDefined(auth.prefix)) {
                        return auth.prefix;
                    }
                    return MODULE_SETTINGS.AUTH_HEADER_PREFIX;
                },
                getAuthHeader: function () {
                    var token = this.getToken();
                    if (token) {
                        return this.getHeaderPrefix() + ' ' + token;
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
                },
            };
        }]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-interceptor', [
        'angular-token-auth.auth',
        'angular-token-auth.auth-module-settings',
    ]);

    module.factory('authInterceptor', [
        '$rootScope',
        '$q',
        '$location',
        'authFactory',
        'authModuleSettings',
        function ($rootScope, $q, $location, authFactory, MODULE_SETTINGS) {
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
                        var authHeader = authFactory.getAuthHeader();
                        if (authHeader) {
                            config.headers.Authorization = authHeader;
                        }
                    }

                    return config;
                },
                responseError: function (response) {
                    if (response.status === 401) {
                        authFactory.clearAuth();
                    }
                    return $q.reject(response);
                },
            };
        }]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-login-form-directive-factory', [
        'angular-token-auth.auth-login-form',
    ]);

    module.factory('authLoginFormDirectiveFactory', [
        'AuthLoginFormFactory',
        function (AuthLoginFormFactory) {
            return {
                restrict: 'A',
                scope: true,
                templateUrl: 'templates/auth/login_form.html',
                link: function (scope, element, attrs) {
                    new AuthLoginFormFactory(scope, element, attrs);
                },
            };
        },
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-login-form-factory', [
        'ngRoute',
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
    module.factory('AuthLoginFormFactory', [
        'authActionsFactory', '$location', 'authFactory', 'authModuleSettings',
        function (authActionsFactory, $location, authFactory, authModuleSettings) {

            // If we are already logged in.
            if (authFactory.getToken()) {
                $location.url(authModuleSettings.LOGIN_REDIRECT_URL);
            }

            var AuthLoginFormFactory = function (scope) {
                this.scope = scope;
                this.init();
            };

            AuthLoginFormFactory.prototype = {
                init: function () {
                    this.scope.status = {};
                    this.scope.fields = {
                        username: {
                            required: true,
                        },
                        password: {
                            required: true,
                        },
                    };

                    this.scope.login = angular.bind(this, this.loginClick);
                },
                loginSuccess: function () {
                    $location.url($location.search().next || authModuleSettings.LOGIN_REDIRECT_URL);
                },
                loginFailed: function (response) {
                    // Store all the errors on the scope.
                    this.scope.errors = response;
                    if (response.non_field_errors) {
                        this.scope.fields.errors = [{
                            msg: response.non_field_errors[0],
                        }];
                    }
                    this.scope.fields.username.errors = response.username ? response.username[0] : '';
                    this.scope.fields.password.errors = response.password ? response.password[0] : '';
                },
                loginFinally: function () {
                    this.scope.status.authenticating = false;
                },
                loginClick: function () {
                    delete this.scope.errors;
                    this.scope.fields.errors = '';
                    this.scope.fields.username.errors = '';
                    this.scope.fields.password.errors = '';

                    this.scope.status.authenticating = true;

                    authActionsFactory.login(this.scope.fields.username.value, this.scope.fields.password.value)
                        .then(
                            angular.bind(this, this.loginSuccess),
                            angular.bind(this, this.loginFailed)
                        )
                        /* eslint-disable dot-notation, no-unexpected-multiline */
                        ['finally'](angular.bind(this, this.loginFinally));
                        /* eslint-enable dot-notation, no-unexpected-multiline */
                },
            };

            return AuthLoginFormFactory;
        },
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    /*
    Use this module for consistent redirection regarding the login form.
    Whenever the user's session expires or they try to access a non-anonymous
    page when logged out, they will be redirected to the url set in
    TOKEN_AUTH.LOGOUT_REDIRECT_URL, either in the angular-token-auth defaults
    or your own PROJECT_SETTINGS.
    To use this module, require angular-token-auth-login-redirect as an app dependency, then
    require authLoginRedirect.run and call it in your app's run block.
    Example:
        var app = angular.module('app', [
            'angular-token-auth-login-redirect'
        ]);
        module.run([
            'authLoginRedirect.run',
            function (loginRedirectRun) {
                loginRedirectRun();
            }
        ]);
    Or manually add the $routeChangeStart and tokenAuth:clear handlers yourself:
    simply follow the authLoginRedirect.run function.
    */

    var module = angular.module('angular-token-auth-login-redirect', [
        // For $routeChangeStart event
        'ngRoute',
        'angular-token-auth-login-redirect-token-auth-clear',
        'angular-token-auth.auth-route-change-start',
    ]);

    module.factory('authLoginRedirect.run', [
        '$rootScope',
        'authRouteChangeStartFactory',
        'authLoginRedirect.onTokenAuthClear',
        function ($rootScope, authRouteChangeStartFactory, onTokenAuthClear) {

            return function loginRedirectRun () {
                $rootScope.$on('$routeChangeStart', authRouteChangeStartFactory);
                $rootScope.$on('tokenAuth:clear', onTokenAuthClear.handler);
            };

        },
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth-login-redirect-token-auth-clear', [
        // For $route
        'ngRoute',
        'angular-token-auth-login-redirect-token-auth-settings',
    ]);

    module.service('authLoginRedirect.onTokenAuthClear', [
        '$route',
        '$location',
        'authLoginRedirect.getTokenAuthSettings',
        function ($route, $location, getTokenAuthSettings) {

            this.handler = angular.bind(this, function onTokenAuthClear () {
                if (!this.routeIsAnonymous($route.current.$$route)) {
                    this.redirect();
                }
            });

            this.routeIsAnonymous = function (route) {
                // By default, all routes should be anonymous.
                var routeIsAnonymous = true;
                if (route && route.anonymous === false) {
                    routeIsAnonymous = false;
                }
                return routeIsAnonymous;
            };

            this.redirect = function () {
                var TOKEN_AUTH = getTokenAuthSettings();
                // Current route is not anonymous so use the logout redirect
                var nextUrl = $location.path();
                // Use $location.url() to reset all search params, then set
                // the next= param.
                $location.url(TOKEN_AUTH.LOGOUT_REDIRECT_URL).search('next', nextUrl);
            };

        },
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth-login-redirect-token-auth-settings', [
        'project_settings',
        'angular-token-auth.constants',
    ]);

    module.factory('authLoginRedirect.getTokenAuthSettings', [
        'PROJECT_SETTINGS',
        'TOKEN_AUTH',
        function (PROJECT_SETTINGS, TOKEN_AUTH) {

            return function getTokenAuthSettings (key) {
                var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);
                if (key) {
                    return MODULE_SETTINGS[key];
                }
                return MODULE_SETTINGS;

            };
        },
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-module-settings', [
        'project_settings',
        'angular-token-auth.constants',
    ]);

    module.factory('authModuleSettings', [
        'TOKEN_AUTH', 'PROJECT_SETTINGS',
        function (TOKEN_AUTH, PROJECT_SETTINGS) {
            return angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);
        },
    ]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-route-change-start', [
        'angular-token-auth.auth',
        'angular-token-auth.auth-module-settings',
        'angular-token-auth.constants',
    ]);

    module.factory('authRouteChangeStartFactory', [
        '$location',
        'authFactory',
        'authModuleSettings',
        function ($location, authFactory, MODULE_SETTINGS) {
            return function (e, next) {
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
            };
        }]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-storage', []);

    module.factory('authStorageFactory', ['$window', '$browser', 'authModuleSettings', function ($window, $browser, MODULE_SETTINGS) {
        var cookiePath = MODULE_SETTINGS.COOKIE_PATH ? MODULE_SETTINGS.COOKIE_PATH : $browser.baseHref();

        var storageMethods = {
            noSupport: {
                // No supported storage methods, but we have to return empty functions so the
                //  interface doesn't break
                set: angular.noop,
                get: angular.noop,
                clear: angular.noop,
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
                    // delete test cookie by setting old expiry date
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
                        // ignore nameless cookies
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
                    // delete cookie by setting old expiry date
                    $window.document.cookie = encodeURIComponent(key) + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
                },
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
                },
            },
        };

        var method = storageMethods[MODULE_SETTINGS.STORAGE_METHOD];
        if (method && method.test()) {
            return method;
        }
        // Either we had no specified storage method, or we couldn't
        //  find the requested one, so try to auto-detect
        // Use cookies if available, otherwise try localstorage
        if (storageMethods.cookie.test() === true) {
            return storageMethods.cookie;
        } else if (storageMethods.localStorage.test()) {
            return storageMethods.localStorage;
        }
        return storageMethods.noSupport;


    }]);

}(window.angular));

(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.routes', [
        'angular-token-auth.constants',
        'project_settings',
        'ngRoute',
    ]);

    module.config(['$routeProvider', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($routeProvider, TOKEN_AUTH, PROJECT_SETTINGS) {
        var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

        $routeProvider
            .when(MODULE_SETTINGS.LOGIN, {
                templateUrl: 'templates/auth/login.html',
                controller: 'LoginCtrl',
                anonymousOnly: true,
            })
            .when(MODULE_SETTINGS.LOGOUT, {
                templateUrl: 'templates/auth/logout.html',
                controller: 'LogoutCtrl',
            });
    }]);

}(window.angular));
