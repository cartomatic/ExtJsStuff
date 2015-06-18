(function(){
    //Make sure strict mode is on
    'use strict';

    /**
     * Global controller responsible for initial handling of the main view creation
     */
    Ext.define('Jasmine.controller.Root', {
        extend: 'Ext.app.Controller',

        requires: [
            'Jasmine.view.main.Main'
        ],


        onLaunch: function () {
            //<debug>
            console.warn('[ROOT CONTROLLER] - on launch...');
            //</debug>

            //create the app's viewport
            this.viewport = Ext.create('Ext.container.Viewport', {
                layout: 'fit'
            });

            //check if should handle the normal startup or kick in with the tests mode
            var hash = window.location.hash.replace('#', '');

            if(hash === 'selftest'){
                this.doSelfTest();
            }
            else {
                //normal app startup
                this.viewport.add(
                    Ext.create('Jasmine.view.main.Main')
                );
            }
        },

        /**
         * Starts the app in the self test mode
         */
        doSelfTest: function(){
            //<debug>
            console.warn('[ROOT CONTROLLER] - starting self test mode...');
            //</debug>

            //Note:
            //by default the dynamic loading works in the dev mode. in order to also make it work in the production, one needs to make sure
            //the actual app js stuff is also copied into the app's build dir


        }

    });


}());