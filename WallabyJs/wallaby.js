module.exports = function () {
  return {
    files: [
        //need to include extjs as otherwise wallaby fails to load what's needed....
        //looks like it's not that easy to feed the bastard with proper stuff

      {pattern: 'ext/build/ext-all.js', instrument: false},

      //this should be the list of files tht are about to be controlled by wallaby
      //the problem though is that universal extjs does have different files with the same namespace!
      //also, wallaby seems to kill the pc when re-running the tests. Looks like it has to reload all the stuff over and over again. or something...
      "app/**/*.js",
      "classic/src/**/*.js"
    ],

    tests: [
      "tests/**/*Spec.js"
    ],

    bootstrap: function (wallaby) {

    }
  };
};