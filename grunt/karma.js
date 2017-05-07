'use strict';

module.exports = function (grunt) {

    grunt.config.merge({
        karma: {
            options: {
                basePath: '',
                files: [
                    // Jasmine helpers.
                    'node_modules/jasmine-expect/dist/jasmine-matchers.js',

                    // Angular libraries.
                    '<%= config.lib %>/angular/angular.js',
                    '<%= config.lib %>/angular-mocks/angular-mocks.js',
                    '<%= config.lib %>/angular-route/angular-route.js',

                    '<%= config.files.karmaMocks %>',

                    '<%= config.files.src %>',
                    '<%= config.files.karmaTests %>',
                ],
                exclude: [],
                frameworks: ['jasmine'],
                plugins: [
                    'karma-jasmine',
                    'karma-coverage',
                    'karma-spec-reporter',
                    'karma-chrome-launcher',
                    'karma-firefox-launcher',
                    'karma-safari-launcher',
                ],
                preprocessors: {
                    '<%= config.files.src %>': 'coverage',
                },
                reporters: ['dots', 'coverage'],
                coverageReporter: {
                    dir: 'coverage',
                    type: 'lcov',
                },
                port: 9876,
                colors: true,
                browsers: ['Chrome', 'Firefox', 'Safari'],
                singleRun: true,
                logLevel: 'INFO',
                client: {
                    jasmine: {
                        random: true,
                    },
                },
            },
            ci: {
                // Travis only allows Firefox.
                browsers: ['Firefox'],
                reporters: ['dots', 'coverage'],
                coverageReporter: {
                    type: 'lcovonly',
                    // Travis uses this path: coverage/lcov.info
                    subdir: '.',
                    file: 'lcov.info',
                },
                logLevel: 'WARN',
            },
            dev: {
                reporters: ['dots', 'coverage'],
            },
            verbose: {
                reporters: ['spec', 'coverage'],
            },
            debug: {
                reporters: ['spec', 'coverage'],
                logLevel: 'DEBUG',
            },
            watch: {
                // One browser to be quicker.
                browsers: ['Firefox'],
                reporters: ['progress', 'coverage'],
                autoWatch: true,
                singleRun: false,
                // INFO level logs when a file is changed: better feedback.
                logLevel: 'INFO',
            },
        },
    });

};
