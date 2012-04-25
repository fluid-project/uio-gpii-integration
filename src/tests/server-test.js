/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global require, console*/

(function () {
    var fluid = require("infusion"),
        jqUnit = fluid.require("jqUnit"),
        path = require("path"),
        http = require("http"),
        fs = require("fs"),
        demo = fluid.registerNamespace("demo");

    fluid.require("../dataSource.js", require);
    fluid.require("../utils.js", require);
    fluid.require("../server.js", require);

    demo.serverTest = fluid.registerNamespace("demo.serverTest");

    demo.serverTest.handleResponse = function (testDescription, response, expectedResponse) {
        jqUnit.assertTrue("Callback for " + testDescription + " is called", true);

        response.on("data", function (responseData) {
            fluid.log("Response from server: " + responseData + "; expected: " + expectedResponse);
            jqUnit.assertTrue("Response from the server is received", true);
            jqUnit.assertEquals("Response data is expected", expectedResponse, responseData);
            jqUnit.start();
        });
    };
    
    jqUnit.asyncTest("Handle getting preferences request", function () {

        jqUnit.expect(3);

        var expectedResponse = '{"test":"TEST"}';
        
        http.get({
            host: "localhost",
            port: 8080,
            path: "/store/123"
        }, function (response) {
            demo.serverTest.handleResponse("getting perferences", response, expectedResponse);
        }).on('error', function (e) {
            fluid.log("Got error: " + e.message);
        });
    });

    jqUnit.asyncTest("Handle setting preferences request", function () {

        jqUnit.expect(5);

        var postData = '{"1234":"Another TEST"}';
        var userFile = "./static/data/1234.json";
        
        // Make sure the nonexistence of the user file which will be re-created by the post action
        jqUnit.assertFalse("The user file " + userFile + " does NOT exist", path.existsSync(userFile));
        
        var postRequest = http.request({  
            host: "localhost",  
            port: 8080,  
            path: "/store/1234",  
            method: 'POST',  
            headers: {  
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }, function (response) {
            console.log("in");
            jqUnit.assertTrue("The user file " + userFile + " is created", path.existsSync(userFile));

            demo.serverTest.handleResponse("setting perferences", response, postData);
            
            // Clean up the newly-created user file
            fs.unlink(userFile);
        }).on('error', function (e) {
            fluid.log("Got error: " + e.message);
        });
        
        // write data to post body  
        postRequest.write(postData);  
        postRequest.end();
        
    });
}());