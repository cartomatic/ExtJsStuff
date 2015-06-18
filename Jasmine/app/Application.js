(function(){
    //Make sure strict mode is on
    'use strict';

    /**
     * The main application class. An instance of this class is created by app.js when it calls
     * Ext.application(). This is the ideal place to handle application launch and initialization
     * details.
     */
    Ext.define('Jasmine.Application', {
        extend: 'Ext.app.Application',

        name: 'Jasmine',

        requires: [
            'Jasmine.controller.Root'
        ],

        //global controllers
        controllers: [
            'Jasmine.controller.Root'
        ],

        //global stores
        stores: [],

        //app's default route. if no alternative route is provided
        //this becomes the active route
        defaultToken : 'home',

        init: function(){

            //put some init stuff here that will be called before the init if needed

            //<debug>
            console.warn('[APP] init...');
            //</debug>
        },

        launch: function () {

            //app launch logic if needed

            //<debug>
            console.warn('[APP] launch...');
            //</debug>

            //this app startup is handled through the global Root controller
        }
    });
}());
