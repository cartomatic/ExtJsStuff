(function() {
    //Make sure strict mode is on
    'use strict';

    Ext.define('Jasmine.test.Runner', {

        requires: [],

        /**
         * creates a new instance of the test runner
         */
        constructor: function(){

            console.warn('[TEST RUNNER] - initialising...');

            //Note:
            //by default the dynamic loading works in the dev mode. in order to also make it work in the production, one needs to make sure
            //the actual app js stuff is also copied into the app's build dir



            //if the non-extjs Loader has not yet been loaded, load it
            console.warn('[TEST RUNNER] - loading non-extjs script loader...');
            Ext.require(
                'Jasmine.util.Loader',
                this.onScriptLoaderLoaded,
                this
            );

        },

        /**
         * non-extjs script loader loaded callback; triggers Jasmine stuff load
         */
        onScriptLoaderLoaded: function(){
            console.warn('[TEST RUNNER] - non-extjs script loader loaded!');

            //got the non-extj script loader,
            //so in order to start a self test mode, first need to load jasmine stuff
            console.warn('[TEST RUNNER]- loading Jasmine stuff...');

            Jasmine.util.Loader.load(
                [
                    'jslibs/jasmine/lib/jasmine-2.3.4/jasmine.css',
                    'jslibs/jasmine/lib/jasmine-2.3.4/jasmine.js',
                    'jslibs/jasmine/lib/jasmine-2.3.4/jasmine-html.js',
                    'jslibs/jasmine/lib/jasmine-2.3.4/boot.js'
                ],
                this.onJasmineLoaded,
                this,
                true
            );

        },

        /**
         * Jasmine stuff loaded - continue seting up the tests
         */
        onJasmineLoaded: function(){
            console.warn('[TEST RUNNER] - Jasmine stuff loaded!');

            //since got here, can actually start running tests as all the required stuff should be available

        }

    });

})();