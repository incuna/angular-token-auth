(function (angular) {
    'use strict';

    var module = angular.module('angular-token-auth.auth-storage', []);

    module.factory('authStorageFactory', ['$window', '$browser', 'authModuleSettings', function ($window, $browser, MODULE_SETTINGS) {
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

        var method = storageMethods[MODULE_SETTINGS.STORAGE_METHOD];
        if (method && method.test()) {
            return method;
        } else {
            // Either we had no specified storage method, or we couldn't
            //  find the requested one, so try to auto-detect
            // Use cookies if available, otherwise try localstorage
            if (storageMethods.cookie.test() === true) {
                return storageMethods.cookie;
            } else if (storageMethods.localStorage.test()) {
                return storageMethods.localStorage;
            } else {
                return storageMethods.noSupport;
            }
        }

    }]);

}(window.angular));
