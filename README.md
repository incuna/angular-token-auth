# angular-token-auth [![Build Status](https://travis-ci.org/incuna/angular-token-auth.svg?branch=master)](https://travis-ci.org/incuna/angular-token-auth) [![codecov](https://codecov.io/gh/incuna/angular-token-auth/branch/master/graph/badge.svg)](https://codecov.io/gh/incuna/angular-token-auth)

## Installation
1. `bower install angular-token-auth --save`
1. Inject `angular-token-auth` in to your app module.
1. Add a `PROJECT_SETTINGS` constant to your `project_settings` module.
1. Define a list of allowed hosts in `PROJECT_SETTINGS.TOKEN_AUTH.ALLOWED_HOSTS`.

## Releasing a new version

1. Commit your changes.
1. Run `grunt build` to generate the compiled template files
1. Follow the guidelines at http://semver.org/ to determine your new version number.
1. Update `CHANGELOG.md` with your new version number and a description of changes.
1. Update the `version` property in `bower.json` and|or `package.json`
1. Commit those changes with the commit message "Bump to [version number]". [version number] should be in the format x.y.z.
1. `git tag [version number]`
1. `git push`
1. `git push --tags` - must be done separately.

## Git diff the minified distribution

- `npm install -g js-beautify`
- `git config diff.minjs.textconv js-beautify`
- Put the following in `.gitattributes`:
    + `*.min.js diff=minjs`
- `git diff dist/angular-token-auth.min.js`
