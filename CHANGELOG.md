# CHANGELOG

# 5.1.0
* Login form directive split into separate services and returned as constructor object which allows it to be extended using prototype inheritance in projects

# 5.0.1

* Fixed issue where the module would throw an error if route.$$next was undefined.

# 5.0.0

* Renamed all of the services to fit the data they return.
* Added `getAuth` method to the authFactory which returns all the data
  stored from the auth response.

# 4.1.0
* Save token to local storage as well as cookies to support cordova

# 4.0.0

* Only transform request headers for hosts defined in the ALLOWED_HOSTS
  config list.

# 3.0.3

* Add option for authorisation header prefix to allow oAuth 2.0 bearer authorisation

# 3.0.2

* Only broadcast tokenAuth events after cookie manipulation.

# 3.0.1

* Removed redirect of URLs containing `next` parameter in the `run` method. As
  it caused an infinite loop in some situations.

# 3.0.0

* The `tokenAuth` factory has been removed and replaced with
  `authenticationFactory` which now has only 2 methods, `login` and `logout`.
* `tokenFactory` has been added with 3 methods to get, set and clear tokens.
* HTTP inteceptor has been added to the package to set appropriate headers on
  all HTTP requests.
* No more boilerplate required in your app to use angular-token-auth.

# 2.0.0

* All routes are now anonymous by default. This seems like the best default
  going forwards.

# 1.2.0

* Updated naming conventions to be consistent with other angular projects.

# 1.1.1

* Login directive now inherits parent's scope rather than using it.

# 1.1.0

* Login directive now requires a template to render.

# 1.0.0

* Initial release
