(function(){
    //Make sure strict mode is on
    'use strict';

    /**
     * Global controller responsible for initial handling of the main view creation
     */
    Ext.define('Jasmine.controller.Root', {
        extend: 'Ext.app.Controller',

        requires: [
            'Jasmine.view.main.Main',
            'gm.core.util.jasmine.TestRunner'
        ],

        onLaunch: function () {
            //<debug>
            console.warn('[ROOT CONTROLLER] - on launch...');
            //</debug>

            //get the query params, so can dynamically adjust where the tests will be executed
            //this may be handy if the tests need ui for example
            var query = Ext.Object.fromQueryString(window.location.search),
                testRunnerCfg,
                tests = [
                    'Jasmine.test.Simple',
                    'Jasmine.test.Async'
                ];

            //check if should handle the normal startup or kick in with the tests mode
            if(gm.core.util.jasmine.TestRunner.isInTestMode()){

                //by default the test runner creates its own viewport that is displayed instead of the app
                //it is possible to customise this and display the jasmine output on the side or actually in any container

                //the default will run test runner with the standard output generated instead of the app
                testRunnerCfg = {
                    tests: tests
                };

                //display tests on the side
                if(query.hasOwnProperty('testsonside') && query['testsonside']){
                    this.viewport = Ext.create('Ext.container.Viewport', {
                        layout: 'border',
                        items: [
                            {
                                xtype: 'panel',
                                region: 'center',
                                layout: 'fit',
                                items: [
                                    Ext.create('Jasmine.view.main.Main')
                                ]
                            },
                            {
                                xtype: 'panel',
                                region: 'south',
                                height: 300,
                                html: '<div id="jasmine_output" style="width:100%; height:100%;"></div>',
                                overflowY: true,
                                split: true,
                                title: 'Jasmine output'
                            }
                        ]
                    });

                    testRunnerCfg.outputContainer = 'jasmine_output';
                }

                Ext.create('gm.core.util.jasmine.TestRunner', testRunnerCfg);
            }
            else {
                //normal app startup
                //create the app's viewport
                this.viewport = Ext.create('Ext.container.Viewport', {
                    layout: 'fit',
                    items: [
                        Ext.create('Jasmine.view.main.Main')
                    ]
                });
            }
        }

    });

}());