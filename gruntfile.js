module.exports = function (grunt) {
    'use strict';

    if (grunt.option('help')) {
        require('load-grunt-tasks')(grunt);
    } else {
        require('jit-grunt')(grunt, {
            force: 'grunt-force-task'
        });
    }

    require('time-grunt')(grunt);

    var concatConfig = {
        dist: {
            src: [
                'src/**/*.js'
            ],
            dest: 'dist/angular-token-auth.js'
        }
    };

    var uglifyConfig = {
        dist: {
            files: {
                'dist/angular-token-auth.min.js': 'dist/angular-token-auth.js'
            }
        }
    };

    grunt.initConfig({
        config: {
            lib: 'bower_components',
            modules: 'src',
            files: {
                lint: [
                    'src/**/*.js',
                    '<%= config.files.karmaMocks %>',
                    '<%= config.files.karmaTests %>',
                    './grunt/**/*.js',
                    'Gruntfile.js'
                ],
                karmaMocks: 'tests/mocks/**/*.js',
                karmaTests: 'tests/unit/**/*.js'
            }
        },
        eslint: {
            all: {
                options: {
                    config: '.eslintrc'
                },
                src: '<%= config.files.lint %>'
            }
        },
        jscs: {
            options: {
                config: '.jscsrc'
            },
            src: '<%= config.files.lint %>'
        },
        concat: concatConfig,
        uglify: uglifyConfig
    });

    // Load external grunt task config.
    grunt.loadTasks('./grunt');

    grunt.registerTask('default', [
        'test'
    ]);

    grunt.registerTask('build', 'Concat and uglify', [
        'concat',
        'uglify'
    ]);

    grunt.registerTask('lint', 'Run the JS linters.', [
        'eslint',
        'jscs'
    ]);

    grunt.registerTask('test', 'Run the tests.', function (env) {
        var karmaTarget = 'dev';
        if (grunt.option('debug')) {
            karmaTarget = 'debug';
        }
        if (env === 'ci' || env === 'travis') {
            karmaTarget = 'ci';
        }
        grunt.task.run([
            'force:lint',
            'force:karma:' + karmaTarget,
            'errorcodes'
        ]);
    });

    grunt.registerTask('travis', 'Run the tests in Travis', [
        'test:travis'
    ]);

    // This is used in combination with grunt-force-task to make the most of a
    // Travis build, so all tasks can run but the build will fail if any of the
    // tasks failed/errored.
    grunt.registerTask('errorcodes', 'Fatally error if any errors or warnings have occurred but Grunt has been forced to continue', function () {
        grunt.log.writeln('errorcount: ' + grunt.fail.errorcount);
        grunt.log.writeln('warncount: ' + grunt.fail.warncount);
        if (grunt.fail.warncount > 0 || grunt.fail.errorcount > 0) {
            grunt.fatal('Errors have occurred.');
        }
    });

};
