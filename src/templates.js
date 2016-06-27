angular.module('templates').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('auth/base/login_form.html',
    "<div form-field=fields.username data-block=login-username-form><div><input placeholder=Username type=text ng-model=fields.username.value></div></div><div form-field=fields.password data-block=login-password-form><div><input placeholder=\"\" type=password ng-model=fields.password.value></div></div><div class=form-actions data-block=form-actions><button type=submit><span>Log in</span></button></div>"
  );


  $templateCache.put('auth/login_form.html',
    "<div data-extend-template=templates/auth/base/login_form.html></div>"
  );

}]);
