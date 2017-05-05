(function () {
    'use strict';


    describe('Module angular-token-auth', function () {

        // Load the generic module.
        beforeEach(module('angular-token-auth'));

        beforeEach(function () {

            // Inject dependencies. module() can no longer be called after this.
            /* eslint-disable no-unused-vars */
            inject(function ($rootScope) {
                // Inject something to create the injector.
                // Uncomment this line if you are having test troubles. The
                // injector won't run if there are missing dependencies.
                // console.log('generic: If this log does not show, there are missing dependencies.');
            });

        });

        // Replace this test when others are added. A running test is all that's
        // needed to see if the dependencies load without error.
        it('should load the dependencies without error', function () {
            expect(true).toBe(true);
        });

    });

}());
