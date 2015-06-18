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
                    'jslibs/jasmine/lib/jasmine-2.3.4/jasmine-html.js'

                    //not loading the boot.js
                    //'jslibs/jasmine/lib/jasmine-2.3.4/boot.js'
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

            //all the jasmine stuff should have been loaded by now.

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

            //create a viewport with a panel that will host jasmine renderer output
            this.viewport = Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [
                    {
                        xtype: 'panel',
                        title: 'Jasmine output in an ExtJs panel...',
                        layout: 'fit',
                        html: '<div id="new_jasmine_reporter_output_container" style="width:100%; height:100%;"></div>'
                    }
                ]
            });


            //this will append the html reporter output to new_jasmine_reporter_output_container
            //Ext.get('new_jasmine_reporter_output_container').appendChild(document.getElementsByClassName('jasmine_html-reporter')[0]);

            //this will replace the new_jasmine_reporter_output_container with the html reporter
            Ext.get(document.getElementsByClassName('jasmine_html-reporter')[0]).replace(Ext.get('new_jasmine_reporter_output_container'));


            //since got here, can actually start loading tests as all the required stuff should be available

            describe("Test suite", function() {

            });


            //and finally run the tests
            this.jasmineEnv.execute();

        },

        /**
         * performs the jasmine boot; see the htmlReporter and env for details - they are both made accessible for the class instance
         */
        bootJasmine: function(){

            var me = this;

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
                var currentWindowOnload = window.onload;

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