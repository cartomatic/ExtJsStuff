(function(){
    //Make sure strict mode is on
    'use strict';

    /**
     * An example of an async test for testing for example ajax calls, animations and such
     */
    Ext.define('Jasmine.test.Async', {

        /**
         * Loads a set of tests
         */
        load: function(){

            //Note:
            //the trick here is to pass the done function as an attribute to a test function (or beforeEach, afterEach)
            //so it can be called whenever the test is finished

            describe("Asynchronous specs", function() {
                var value;

                beforeEach(function(done) {
                    setTimeout(function() {
                        value = 0;
                        done();
                    }, 1);
                });

                it("should support async execution of test preparation and expectations", function(done) {
                    value++;
                    expect(value).toBeGreaterThan(0);
                    done();
                });

                describe("long asynchronous specs", function() {
                    //async before each
                    //can do beforeAll too
                    beforeEach(function(done) {
                        done();
                    }, 100);

                    it(
                        "takes some time to complete",
                        function(done) {
                            setTimeout(function() {
                                expect(true).toBeTruthy();
                                done();
                            }, 1000);
                        },
                        1500 //in order to change the default timeout of 5000, specify it here
                        //Note:
                        //spec timeout has to be longer then the expected async op timeout - see 1500 vs 1000 in the example above. otherwise spec will fail with the Error: Timeout
                    );

                    it(
                        "takes even more time to complete than the previous one",
                        function(done) {
                            setTimeout(function() {
                                expect(true).toBeTruthy();
                                done();
                            }, 2500);
                        }
                    );

                    it(
                        "takes 8 secs",
                        function(done) {
                            setTimeout(function() {
                                expect(true).toBeTruthy();
                                done();
                            }, 8000);
                        },
                        10000
                    );

                    //async afterEach
                    //can do afterAll too
                    afterEach(function(done) {
                        done();
                    }, 100);
                });
            });

        }
    });

}());