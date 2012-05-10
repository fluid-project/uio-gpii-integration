(function () {

    "use strict";

    var fluid = require("infusion"),
        demo = fluid.registerNamespace("demo"),
        fs = require("fs"),
        http = require("http"),
        path = require("path"),
        url = require("url"),
        eUC = "encodeURIComponent:";
        
    fluid.defaults("demo.dataSource", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        components: {
            urlExpander: {
                type: "demo.urlExpander"
            }
        },
        invokers: {
            get: "demo.dataSource.get",
            resolveUrl: "demo.dataSource.resolveUrl"
        },
        nickName: "dataSource", // framework bug FLUID-4636 - this is not resolved
        termMap: {},
        writable: false,
        preInitFunction: "demo.dataSource.preInit"
    });
    
    fluid.defaults("demo.dataSource.URL", {
        gradeNames: ["demo.dataSource", "autoInit"]
    });
    
    // TODO - just abolish file dataSource and let URL dataSource deal with
    // file:// protocol
    fluid.defaults("demo.dataSource.file", {
        gradeNames: ["demo.dataSource", "autoInit"]
    });
        

    demo.dataSource.preInit = function (that) {
        that.nickName = "dataSource"; // work around FLUID-4636
        if (that.options.writable) {
            that.options.invokers.set = "demo.dataSource.set";
        }
    };

    fluid.demands("demo.dataSource.get", "demo.dataSource.file", {
        funcName: "demo.dataSource.FSGet",
        args: [
            "{dataSource}.options.responseParser",
            "{dataSource}.resolveUrl",
            "{arguments}.0",
            "{arguments}.1"
        ]
    });

    fluid.demands("demo.dataSource.set", "demo.dataSource.file", {
        funcName: "demo.dataSource.FSSet",
        args: [
            "{dataSource}.options.responseParser",
            "{dataSource}.resolveUrl",
            "{arguments}.0",
            "{arguments}.1",
            "{arguments}.2"
        ]
    });

    fluid.demands("demo.dataSource.get", "demo.dataSource.URL", {
        funcName: "demo.dataSource.DBGet",
        args: [
            "{dataSource}.options.responseParser",
            "{dataSource}.resolveUrl",
            "{arguments}.0",
            "{arguments}.1"
        ]
    });

    fluid.demands("demo.dataSource.set", "demo.dataSource.URL", {
        funcName: "demo.dataSource.DBSet",
        args: [
            "{dataSource}.options.responseParser",
            "{dataSource}.resolveUrl",
            "{arguments}.0",
            "{arguments}.1",
            "{arguments}.2"
        ]
    });

    fluid.demands("demo.dataSource.resolveUrl", null, {
        args: [
            "{urlExpander}.expand",
            "{dataSource}.options.url",
            "{dataSource}.options.termMap",
            "{arguments}.0"
        ]
    });

    var processData = function (data, responseParser, directModel, callback) {
        data = typeof data === "string" ? JSON.parse(data) : data;
        if (responseParser) {
            data = typeof responseParser === "string" ?
                fluid.invokeGlobalFunction(responseParser, [data, directModel]) : 
                responseParser(data, directModel);
        }
        callback(data);
    };

    var dbAll = function (resolveUrl, directModel, method, callback, model) {
        var path = resolveUrl(directModel),
            urlObj = url.parse(path, true),
            opts = {
                host: urlObj.hostname,
                port: parseInt(urlObj.port, 10),
                path: urlObj.pathname,
                method: method
            };
        if (model) {
            opts.headers = {
                "Content-Type": "application/json",
                "Content-Length": model.length
            };
        }
        var req = http.request(opts, function (res) {
            var data = "";
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback(data);
            });
        });
        req.on("error", function (error) {
            callback({
                isError: true,
                message: error.message
            });
        });
        req.end(model);
        return req;
    };

    demo.dataSource.DBGet = function (responseParser, resolveUrl, directModel, callback) {
        dbAll(resolveUrl, directModel, "GET", function (data) {
            processData(data, responseParser, directModel, callback);
        });
    };

    demo.dataSource.DBSet = function (responseParser, resolveUrl, directModel, model, callback) {
        var modelData = typeof model === "string" ? model : JSON.stringify(model);
        var req = dbAll(resolveUrl, directModel, "POST", function (data) {
            processData(data, responseParser, directModel, callback);
        }, modelData);
    };

    var fsAll = function (method, responseParser, resolveUrl, directModel, callback, model) {
        var fileName = resolveUrl(directModel),
            args = [fileName];
        if (model) {
            args.push(model);
        }
        args.push("utf8");
        args.push(function (error, data) {
            if (error) {
                callback({
                    isError: true,
                    message: error.message
                });
                return;
            }
            processData(data || model, responseParser, directModel, callback);
        });
        fs[method + "File"].apply(null, args);
    };

    demo.dataSource.FSGet = function (responseParser, resolveUrl, directModel, callback) {
        fsAll("read", responseParser, resolveUrl, directModel, callback);
    };

    demo.dataSource.FSSet = function (responseParser, resolveUrl, directModel, model, callback) {
        fsAll("write", responseParser, resolveUrl, directModel, callback,
            typeof model === "string" ? model : JSON.stringify(model));
    };

    demo.dataSource.resolveUrl = function (expand, url, termMap, directModel) {
        var map = fluid.copy(termMap);
        map = fluid.transform(map, function (entry) {
            var encode = false;
            if (entry.indexOf(eUC) === 0) {
                encode = true;
                entry = entry.substring(eUC.length);
            }
            if (entry.charAt(0) === "%") {
                entry = fluid.get(directModel, entry.substring(1));
            }
            if (encode) {
                entry = encodeURIComponent(entry);
            }
            return entry;
        });
        var replaced = fluid.stringTemplate(url, map);
        replaced = expand(replaced);
        return replaced;
    };

})();