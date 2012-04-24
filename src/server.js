/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global require*/

(function () {

    "use strict";

    var express = require("express"),
        fluid = require("infusion"),
        path = require("path"),
        demo = fluid.registerNamespace("demo");
    
    fluid.require("./dataSource.js", require);
    fluid.require("./utils.js", require);

    var findArgv = function (key) {
        return fluid.find(process.argv, function (arg) {
            if (arg.indexOf(key + "=") === 0) {
                return arg.substr(key.length + 1);
            }
        });
    };

    fluid.defaults("demo.server", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        preInitFunction: "demo.server.preInit",
        finalInitFunction: "demo.server.finalInit",
        components: {
            prefServer: {
                type: "demo.dataSource"
            }
        }
    });
    
    demo.server.preInit = function (that) {
        that.server = express.createServer();
        that.server.configure(function () {
            that.server.use(express.bodyParser());
            that.server.use(express.static(path.join(__dirname, "./static")));
        });
        
        that.server.configure("production", function () {
            // Set production options.
            fluid.staticEnvironment.production = fluid.typeTag("demo.production");
            fluid.setLogging(false);
        });
        that.server.configure("development", function () {
            // Set development options.
            fluid.staticEnvironment.production = fluid.typeTag("demo.development");
            fluid.setLogging(true);
        });

        that.server.all("/store/:token", function (req, res, next) {
            req.token = req.params.token;
            next();
        });
        
        that.server.get("/store/:token", function (req, res) {
            that.prefServer.get({token: req.token}, function (data) {
                res.send(data, 200);
            });
        });

        that.server.post("/store/:token", function (req, res) {
            that.prefServer.set({token: req.token}, req.body, function (data) {
                res.send(data, 200);
            });
        });
    };
    
    demo.server.finalInit = function (that) {
        var port = findArgv("port") || 8080;
        fluid.log("Demo Server is running on port: " + port);
        that.server.listen(typeof port === "string" ? parseInt(port, 10) : port);
    };

    fluid.demands("demo.dataSource", ["demo.production"], {
        funcName: "demo.dataSource.URL",
        args: {
            url: "http://localhost:8081/user/%token",
            writable: true,
            termMap: {
                token: "%token"
            }
        }
    });

    fluid.demands("demo.dataSource", ["demo.development"], {
        funcName: "demo.dataSource.file",
        args: {
            url: "./static/data/%token.json",
            writable: true,
            termMap: {
                token: "%token"
            }
        }
    });

    demo.server();
    
})();

