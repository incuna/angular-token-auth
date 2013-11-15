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
            templateUrl: 'views/auth/login.html',
            controller: 'LoginCtrl',
            anonymous: true
        })
        .when(MODULE_SETTINGS.LOGOUT, {
            templateUrl: 'views/auth/logout.html',
            controller: 'LogoutCtrl',
            anonymous: true
        });
}]);

auth.run(['$rootScope', '$location', '$user', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($rootScope, $location, $user, TOKEN_AUTH, PROJECT_SETTINGS) {
    var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

    $rootScope.$on('$routeChangeStart', function (e, next, current) {
        if (next.$$route && !next.$$route.anonymous && !$user.authenticated) {
            $location.url(MODULE_SETTINGS.LOGIN + '?next=' + next.$$route.originalPath);
        }
    });
}]);

auth.controller('LoginCtrl', ['$scope', '$location', '$user', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($scope, $location, $user, TOKEN_AUTH, PROJECT_SETTINGS) {
    var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

    if($user.authenticated) {
        $location.url(MODULE_SETTINGS.LOGIN_REDIRECT_URL);
    }

    $scope.login = function () {
        $user.login($scope.email, $scope.password).then(function (data) {
            $location.url($location.search().next || MODULE_SETTINGS.LOGIN_REDIRECT_URL);
        });
    };
}]);

auth.controller('LogoutCtrl', ['$user', function ($user) {
    $user.logout();
}]);

auth.factory('$user', ['$q', '$http', '$cookieStore', '$location', 'TOKEN_AUTH', 'PROJECT_SETTINGS', function ($q, $http, $cookieStore, $location, TOKEN_AUTH, PROJECT_SETTINGS) {
    var MODULE_SETTINGS = angular.extend({}, TOKEN_AUTH, PROJECT_SETTINGS.TOKEN_AUTH);

    var user = {
        authenticated: false,
        token: null,
        login: function (email, password) {
            var deferred = $q.defer();

            $http.post(PROJECT_SETTINGS.API_ROOT + MODULE_SETTINGS.ENDPOINT, {
                username: email,
                password: password
            }).success(function (data) {
                user.authenticated = true;
                user.token = data.token;
                $cookieStore.put('auth', {
                    token: data.token
                });
                deferred.resolve(user);
            }).error(function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        },
        logout: function () {
            $cookieStore.remove('auth');
            user.token = null;
            user.authenticated = false;
            $location.url(MODULE_SETTINGS.LOGIN);
        }
    };

    var cookie = $cookieStore.get('auth');
    if (cookie && cookie.token) {
        user.authenticated = true;
        user.token = cookie.token;
    }

    return user;
}]);
