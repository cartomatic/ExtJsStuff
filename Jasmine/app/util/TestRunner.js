(function() {
    //Make sure strict mode is on
    'use strict';

    /**
     * Jasmine test runner. responsible for setting up Jasmine environment, loading tests and executing them.
     * Note:
     * by default the dynamic loading works in the dev mode. in order to also make it work in the production, one needs to make sure
     * the actual app js stuff is also copied into the app's build dir so the test files are accessible; this also applies to jasmine files
     */
    Ext.define('Jasmine.util.TestRunner', {

        requires: [
            'Ext.Object',
            'Ext.panel.Panel',
            'Ext.container.Viewport',
            'Jasmine.util.Loader'
        ],

        mixins: [
            'Ext.mixin.Observable'
        ],

        statics: {

            /**
             * @property {string} hash=testmode param used to recognise if the app should start in a test mode
             */
            hash: 'testmode',

            /**
             * Whether or not the tests are to be executed; true if the app starts with a 'selftest' hash, selftest=true param
             * and other params added by Jasmine when user selects proper test suites or tests by clicking the links generated by the
             * Jasmine's htmlReporter
             */
            isInTestMode: function(){
                var hash = window.location.hash.replace('#', ''),
                    query = Ext.Object.fromQueryString(window.location.search);

                return (
                    //test triggered explicitly by either a hash or a query param
                    hash === this.hash ||
                    (query.hasOwnProperty(this.hash) && query[this.hash]) ||

                        //tests customised by Jasmine
                    query.hasOwnProperty('spec') ||
                    query.hasOwnProperty('cath') ||
                    query.hasOwnProperty('throwFailures')
                );
            }
        },

        config: {
            /**
             * @cfg {boolean} [autoStart=true] Whether or not the tests should automatically start
             */
            autoStart: true,

            /**
             * @cfg {string | Ext.dom.Element} [outputContainer] id of a html element or Ext.dom.Element to output the Jasmine's htmlReporter stuff to
             */
            outputContainer: null,

            /**
             * @cfg {Array | string} an array of test classes or a single test class to be loaded by the test runner
             */
            tests: null,

            /**
             * jasmine files path; combined later into '{jasminePath}/jasmine-{jasmineVersion}/'
             */
            jasminePath: 'jslibs/jasmine/lib',

            /**
             * jasmine version; combined later into '{jasminePath}/jasmine-{jasmineVersion}/'
             */
            jasmineVersion: '2.3.4',

            /**
             * name of the default test suite. used if an alternative is not provided when loading the tests
             */
            defaultTestSuiteName: 'Test Suite'
        },

        /**
         * @event jasmineloaded
         * Fired when jasmine scripts are loaded
         * @param {Jasmine.util.TestRunner} self
         */

        /**
         * @event jasmineconfigured
         * Fired when jasmine is configured
         * @param {Jasmine.util.TestRunner} self
         */


        /**
         * @event testsloaded
         * Fired when tests are loaded
         * @param {Jasmine.util.TestRunner} self
         */

        /**
         * performs instance setup
         */
        constructor: function(config){

            // The `listeners` property is processed to add listeners and the config
            // is applied to the object.
            this.mixins.observable.constructor.call(this, config);

            //does extend only Ext.Base, so need to call initConfig explicitly
            //but since the above line also calls initConfig it's ok to skip it here
            //this.initConfig();

            //wire up some evt listeners
            this.on('jasmineloaded', this.onJasmineLoaded, this);
            this.on('jasmineconfigured', this.onJasmineConfigured, this);
            this.on('testsloaded', this.onTestsLoaded, this);

            //load Jasmine stuff
            this.loadJasmine();

        },

        /**
         * Loads jasmine relevant stuff
         */
        loadJasmine: function(){

            console.warn('[TEST RUNNER]- loading Jasmine stuff...');

            var me = this,
                jasminePath = this.getJasminePath() + '/jasmine-' + this.getJasmineVersion();

            //Load jasmine related scripts
            Jasmine.util.Loader.load({
                fileList: [
                    jasminePath + '/jasmine.css',
                    jasminePath + '/jasmine.js',
                    jasminePath + '/jasmine-html.js'

                    //not loading the boot.js - see on
                    //'jslibs/jasmine/lib/jasmine-2.3.4/boot.js'
                ],
                callback: function(){
                    console.warn('[TEST RUNNER]- Jasmine stuff loaded!');
                    me.fireEvent('jasmineloaded', me)
                },
                scope: me,
                preserveOrder: true
            });
        },

        /**
         * 'jasmineloaded' evt listener; boots Jasmine
         * @private
         * @param self {Jasmine.util.TestRunner}
         */
        onJasmineLoaded: function(self){
            //jasmine stuff has been loaded, so perform a Jasmine setup

            //Note:
            //
            //because jasmine by default initialises all its stuff on window.load - so after the tests were read and such - some stuff needs to be done here...
            //basically one can read in all the tests as they are:
            //describe('Test', function(){
            //  ...do the tests here...
            //});
            //
            //and then re-emit the window onload event like this:
            //var evt = document.createEvent('Event');
            //evt.initEvent('load', false, false);
            //window.dispatchEvent(evt);

            //alternate way is to modify the jasmine's bootstrap - boot.js so the html reporter becomes a global object, or at least is exposed through the jasmine
            //or
            //just not load it directly but instead make it do the work here:
            this.bootJasmine();

            //init the reporter now - this will inject all the stuff to the body
            this.jasmineHtmlReporter.initialize();

            //Note:
            //This is an example of rerendering the jasmine html reporter's stuff to another container.
            //it may be useful when one needs some tests to be output to a side container while the app is actually operational
            //just a customisation really

            var output = this.getOutputContainer();
            if(output){
                if(Ext.isString(output)){
                    output = Ext.get(output);
                }
            }
            else {
                //output not provided so just assuming no viewport has been created and need an own one

                output = 'new_jasmine_reporter_output_container';

                //create a viewport with a panel that will host jasmine renderer output
                this.viewport = Ext.create('Ext.container.Viewport', {
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'panel',
                            title: 'Jasmine ' + jasmine.version + ' :: Test Runner',
                            layout: 'fit',
                            html: '<div id="' + output + '" style="width:100%; height:100%;"></div>',
                            overflowY: 'auto'
                        }
                    ]
                });

                //grab the output now as it should be already rendered
                output = Ext.get(output);
            }

            //make sure the output for the jasmine's html reporter is valid
            if(Ext.getClassName(output) !== 'Ext.dom.Element'){
                throw {
                    msg: 'Output element for the Jasmine\'s htmlReporter is either not a valid Ext.dom.Element, or it has not been rendered yet and hence could not be accessed'
                };
            }


            //since got here it looks like we're good to move the default Jasmine's reported dom into a desired place.

            //this will append the html reporter output to new_jasmine_reporter_output_container
            //output.appendChild(document.getElementsByClassName('jasmine_html-reporter')[0]);

            //but this will replace the new_jasmine_reporter_output_container with the html reporter which seems to be a better idea
            Ext.get(document.getElementsByClassName('jasmine_html-reporter')[0]).replace(output);


            console.warn('[TEST RUNNER] - Jasmine HTML reporter output container created!');

            this.fireEvent('jasmineconfigured', this);
        },

        /**
         * 'jasmineconfigured' evt listener
         * @param self {Jasmine.util.TestRunner}
         */
        onJasmineConfigured: function(self){
            //check if there are tests configured and if so load them
            this.loadTests();
        },

        /**
         * Loads test suites; if tests are not provided, tries to load tests set up in the config; has no effect if tests cannot be retrieved;
         * tests can be loaded multiple times, each load will just append new tests to the suite
         * @param {string} [suiteName='Test suite']
         * @param [tests]
         */
        loadTests: function(suiteName, tests){

            //since got here, can actually start loading tests as all the required stuff should be available
            //all the tests are actually extjs classes, so need to load them in order to load the actual tests

            var me = this,
                t, tlen, T;

            //if tests are not provided, make sure to extract them from config (if provided of course)
            tests = tests || me.getTests();

            //see what is the main test suite name
            suiteName = suiteName || me.getDefaultTestSuiteName();


            //only load tests if there is something to load
            if(tests){

                //make sure the tests is an array
                if(!Ext.isArray(tests)){
                    tests = [tests];
                }

                Ext.require(
                    tests,
                    function(){

                        //all the tests should be valid ext js classes.
                        //they should also expose a load method
                        t = 0;
                        tlen = tests.length;

                        if(tlen > 0){

                            describe(suiteName, function(){
                                for(t; t < tlen; t++){

                                    console.warn('[TEST RUNNER] - loading tests for ' + tests[t]);

                                    T = Ext.create(tests[t]);
                                    if(Ext.isFunction(T.load)){
                                        T.load();
                                    }
                                }
                            });
                        }

                        console.warn('[TEST RUNNER] - tests loaded!');

                        me.fireEvent('testsloaded', me);
                    },
                    me
                );
            }
            else {
                //just give feedback is some code is subscribing;
                //when there are no tests, jasmine will give an appropriate output;
                me.fireEvent('testsloaded', me);
            }
        },

        /**
         * 'testsloaded' evt callback
         * @param self
         */
        onTestsLoaded: function(self){
            if(this.getAutoStart()){
                this.executeTests();
            }
        },

        /**
         * Executes the jasmine tests
         */
        executeTests: function(){
            console.warn('[TEST RUNNER] - starting tests...');
            this.jasmineEnv.execute();
        },

        /**
         * performs the jasmine boot; see the htmlReporter and env for details - they are both made accessible for the class instance
         */
        bootJasmine: function(){

            var me = this;

            //Note:
            //this is based on the jasmine 2.3.4 boot.js

            /**
             Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary initialization before executing the loaded environment and all of a project's specs. This file should be loaded after `jasmine.js` and `jasmine_html.js`, but before any project source files or spec files are loaded. Thus this file can also be used to customize Jasmine for a project.

             If a project is using Jasmine via the standalone distribution, this file can be customized directly. If a project is using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms.

             The location of `boot.js` can be specified and/or overridden in `jasmine.yml`.

             [jasmine-gem]: http://github.com/pivotal/jasmine-gem
             */

            (function() {

                /**
                 * ## Require &amp; Instantiate
                 *
                 * Require Jasmine's core files. Specifically, this requires and attaches all of Jasmine's code to the `jasmine` reference.
                 */
                window.jasmine = jasmineRequire.core(jasmineRequire);

                /**
                 * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
                 */
                jasmineRequire.html(jasmine);

                /**
                 * Create the Jasmine environment. This is used to run all specs in a project.
                 */
                var env = jasmine.getEnv();

                /**
                 * ## The Global Interface
                 *
                 * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
                 */
                var jasmineInterface = jasmineRequire.interface(jasmine, env);

                /**
                 * Add all of the Jasmine global/public interface to the global scope, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
                 */
                extend(window, jasmineInterface);

                /**
                 * ## Runner Parameters
                 *
                 * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
                 */

                var queryString = new jasmine.QueryString({
                    getWindowLocation: function() { return window.location; }
                });

                var catchingExceptions = queryString.getParam("catch");
                env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

                var throwingExpectationFailures = queryString.getParam("throwFailures");
                env.throwOnExpectationFailure(throwingExpectationFailures);

                /**
                 * ## Reporters
                 * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
                 */
                var htmlReporter = new jasmine.HtmlReporter({
                    env: env,
                    onRaiseExceptionsClick: function() { queryString.navigateWithNewParam("catch", !env.catchingExceptions()); },
                    onThrowExpectationsClick: function() { queryString.navigateWithNewParam("throwFailures", !env.throwingExpectationFailures()); },
                    addToExistingQueryString: function(key, value) { return queryString.fullStringWithNewParam(key, value); },
                    getContainer: function() { return document.body; },
                    createElement: function() { return document.createElement.apply(document, arguments); },
                    createTextNode: function() { return document.createTextNode.apply(document, arguments); },
                    timer: new jasmine.Timer()
                });

                /**
                 * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
                 */
                env.addReporter(jasmineInterface.jsApiReporter);
                env.addReporter(htmlReporter);

                /**
                 * Filter which specs will be run by matching the start of the full name against the `spec` query param.
                 */
                var specFilter = new jasmine.HtmlSpecFilter({
                    filterString: function() { return queryString.getParam("spec"); }
                });

                env.specFilter = function(spec) {
                    return specFilter.matches(spec.getFullName());
                };

                /**
                 * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8, phantomjs) require this hack.
                 */
                window.setTimeout = window.setTimeout;
                window.setInterval = window.setInterval;
                window.clearTimeout = window.clearTimeout;
                window.clearInterval = window.clearInterval;

                /**
                 * ## Execution
                 *
                 * Replace the browser window's `onload`, ensure it's called, and then run all of the loaded specs. This includes initializing the `HtmlReporter` instance and then executing the loaded Jasmine environment. All of this will happen after all of the specs are loaded.
                 */
                //var currentWindowOnload = window.onload;

                //custom
                //---------------------------------------------------------------------------
                //Note:
                //do not wire up the window events - since the app is running it already happened
                //instead make the env and htmlReporter accessible so can interact with them later

                //window.onload = function() {
                //    if (currentWindowOnload) {
                //        currentWindowOnload();
                //    }
                //    htmlReporter.initialize();
                //    env.execute();
                //};

                me.jasmineEnv = env;
                me.jasmineHtmlReporter = htmlReporter;

                //---------------------------------------------------------------------------
                //eo custom

                /**
                 * Helper function for readability above.
                 */
                function extend(destination, source) {
                    for (var property in source) destination[property] = source[property];
                    return destination;
                }

            }());

        }

    });

})();