(function(){
    //Make sure strict mode is on
    'use strict';

    /**
     * The most simplistic set of tests to be treated as an example
     */
    Ext.define('Jasmine.test.Simple', {

        /**
         * Loads a set of tests
         */
        load: function(){

            describe("Basic Ext test", function(){

                it("Expect ExtJs to be defined", function(){
                    expect(Ext).toBeDefined();
                });

                it("Expect ExtJs to be version 5", function(){
                    expect(Ext.getVersion().major).toBe(5);
                });

                //an example of a failing spec
                //it("Expect ExtJs to be version 6", function(){
                //    expect(Ext.getVersion().major).toBe(6);
                //});

                it("Expect ExtJs NOT to be version 6", function(){
                    expect(Ext.getVersion().major).not.toBe(6);
                });
            });

            describe("Repetable task test", function() {

                //run a couple of tasks

                for(var i = 0; i < 5; i++){
                    (function(value1, value2){
                        if(value1 % 2 > 0){
                            it("contains spec with an expectation - " + value1 + ' to be equal ' + value2, function () {
                                expect(value1).toEqual(value2);
                            });
                        }
                        else {
                            xit("contains spec with an expectation - " + value1 + ' to be equal ' + value2, function () {
                                expect(value1).toEqual(value2);
                            });
                        }

                    })(i, i);
                }

            });

        }
    });

}());