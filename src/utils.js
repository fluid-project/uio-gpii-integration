(function () {

    "use strict";

    var fluid = require("infusion");
    var path = require("path");
    var os = require("os");
    
    var demo = fluid.registerNamespace("demo");

    // Debugging definition - node.js's default is only 10!
    fluid.Error.stackTraceLimit = 100;

    // There seems to be no other way to determine whether signals are supported
    // than direct OS detection. Signals are current completley unsupported on 
    // Windows - https://github.com/joyent/node/issues/1553
    // The purpose of this code is to avoid hung or detached processes if node
    // is "killed" with CTRL-C etc.
    if (os.type().indexOf("Windows") === -1) {
        console.log(typeof(process.on));
        
        process.on("SIGTERM", function () {
            process.exit(0);
        });
    }
    

    fluid.defaults("demo.urlExpander", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "demo.urlExpander.finalInit"
    });
    
    demo.urlExpander.finalInit = function (that) {
        console.log("urlExpander constructed with vars ", that.options.vars);
        that.expand = function (url) {
            console.log("urlExpander expanding url " + url);
            return fluid.stringTemplate(url, that.options.vars);
        };
    };

})();