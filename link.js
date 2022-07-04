
// #region NodeJS Require
var define, require, nodeRequire
if (typeof define !== 'function') {
    define = require('amdefine')(module);
}
if  (typeof requirejs !== 'function') {
    nodeRequire = require;
    requirejs = require('requirejs');
    require = requirejs
}
if (typeof __dirname !== 'undefined') {
    require.dirname = __dirname;
}
var process = require('process');

require(require.dirname + "/to-data-uri.js");
require(require.dirname + "/builtins/tmx.js");
// #endregion NodeJS Require

define(["fs", "text!" + require.dirname + "/package.json", "text!" + process.cwd() + "/package.json", "child_process", require.dirname + "/to-data-uri.js", require.dirname + "/builtins/tmx.js"], function (fileSystem, package, buildPackage, childProcess, toDataUri, tmx) {
    package = JSON.parse(package);
    buildPackage = JSON.parse(buildPackage);
    var tabString = function (string, tabs = 1, skipFirst = false) {
        var lines = string.split("\r\n");
        var finished = "";
        if (tabs < 0) {
            for (var i = 0; i < lines.length; i++) {
                if (!skipFirst || i != 0) {
                    for (var k = 0; k < -tabs; k++) {
                        lines[i] = lines[i].replace("\t", "")
                    }
                }
                finished += lines[i];
                if (i !== lines.length - 1) {
                    finished += "\r\n";
                }
            }
        } else {
            for (var i = 0; i < lines.length; i++) {
                if (!skipFirst || i != 0) {
                    for (var k = 0; k < tabs; k++) {
                        finished += "\t";
                    }
                }
                finished += lines[i];
                if (i !== lines.length - 1) {
                    finished += "\r\n";
                }
            }
        }
        return finished;
    }
    /**
     * 
     * @param {string} directory 
     * @param {string} outputDirectory 
     * @param {string} htmlFile (optional) the HTML file to use as the base, if excluded, defaults to outputing a javascript file
     * @param {string} cssDirectory (optional) the directory to source the CSS from, if excluded, does not embed CSS inside of HTML linking
     * @param {bool} embedImages (optional) whether or not to embed images in CSS building, if excluded, automatically embeds all images inside of linked CSS files
     */
    var link = function (directory, outputDirectory = '', htmlFile = null, cssDirectory = null, embedImages = true, exportType = "js", signed = false) {
        var buildDirectoryIntoSingleFile = function (directory, baseDir = '', css = false, globalRules = {}) {
            var file = "";
            if (baseDir === '') {
                baseDir = directory;
            }
            var ls = fileSystem.readdirSync(directory);
            for (var i = 0; i< ls.length; i++) {
                var stat = fileSystem.statSync(directory + "/" + ls[i]);
                if (stat.isDirectory() && directory + "/" + ls[i] !== cssDirectory) {
                    file += buildDirectoryIntoSingleFile(directory + "/" + ls[i], baseDir, css) + "\r\n";
                } else {
                    if (!css) {// If building JavaScript
                        if (ls[i].endsWith(".js")) {
                            var fileContent = fileSystem.readFileSync(directory + "/" + ls[i]).toString();
                            var parts = ls[i].split(".");
                            parts.pop();
                            
                            fileContent = fileContent.replace("define([", "define(\"" + directory.replace(baseDir + "/", "").replace(baseDir, ".")  + "/" + parts.join(".") + "\", [");
                            fileContent = fileContent.replace("define(f", "define(\"" + directory.replace(baseDir + "/", "").replace(baseDir, ".") + "/" + parts.join(".") + "\", f");
                            if (fileContent.indexOf("\r") === -1) {
                                fileContent = fileContent.replaceAll("\n", "\r\n");
                            }
                            fileContent = ";" + fileContent;
                            if (fileContent.indexOf("// #endregion NodeJS Require") !== -1) {
                                fileContent = fileContent.split("// #endregion NodeJS Require")[1].trim() 
                            }
                            file += fileContent;
                        } else if (ls[i].endsWith(".json")) {
                            file += "\r\ndefine(\"" + "text!" + directory.replace(baseDir + "/", "").replace(baseDir, ".") + "/" + ls[i] + "\", [], function () {\r\n\treturn \"" + tabString(fileSystem.readFileSync(directory + "/" + ls[i]).toString().replaceAll(/[\\"]/g, '\\$&').replaceAll(/\u0000/g, '\\0').replaceAll("\r", "\\\r").replaceAll("\n", "\\\n"),  2, true) + "\";\r\n});\r\n"
                        } else if (ls[i].endsWith(".html") && directory + "/" + ls[i] !== htmlFile) {
                            file += "define(\"" + "text!" + directory.replace(baseDir + "/", "").replace(baseDir, ".")  + "/" + ls[i] + "\", [], function () {\r\n\treturn \"" + tabString((fileSystem.readFileSync(directory + "/" + ls[i])).toString().replaceAll(/[\\"]/g, '\\$&').replaceAll(/\u0000/g, '\\0').replaceAll("\r", "\\\r").replaceAll("\n", "\\\n").replaceAll("<", "\\<").replaceAll(">", "\\>").replaceAll("/script", "\\/script").toString(), 2, true) + "\";\r\n});\r\n"
                        } else if ((ls[i].endsWith(".css") && directory + "/" + ls[i] !== htmlFile)) {
                            file += "\r\ndefine(\"" + "text!" + directory.replace(baseDir + "/", "").replace(baseDir, ".") + "/" + ls[i] + "\", [], function () {\r\n\treturn \"" + tabString((fileSystem.readFileSync(directory + "/" + ls[i])).toString().replaceAll(/[\\"]/g, '\\$&').replaceAll(/\u0000/g, '\\0').replaceAll("\r", "\\\r").replaceAll("\n", "\\\n").toString(), 2, true) + "\";\r\n});\r\n"
                        } else if ((ls[i].endsWith(".tmx") && directory + "/" + ls[i] !== htmlFile)) {
                            var fileNameSplit = ls[i].split(".");
                            fileNameSplit.pop();
                            var fileName = fileNameSplit.join(".");
                            var dataUrl = process.cwd() + "/" + directory + "/" + fileName;
                            dataUrl = dataUrl.replaceAll("\\", "/");
                            var fileObject = tmx.loadSync(dataUrl);
                            file += "\r\ndefine(\"" + "tmx!" + directory.replace(baseDir + "/", "").replace(baseDir, ".") + "/" + fileName + "\", [], function () {\r\n\treturn " + tabString(JSON.stringify(fileObject, null, 2).replaceAll("\r", "\\\r").replaceAll("\n", "\\\n").replaceAll(process.cwd().replaceAll("\\", "/") + "/" + baseDir.replace(/\.\//g, "") + "/", ""), 2, true) + ";\r\n});\r\n"
                        } else if ((ls[i].endsWith(".png") || ls[i].endsWith(".mp3")) && embedImages) {
                            file += "\r\ndefine(\"" + "data-uri!" + directory.replace(baseDir + "/", "").replace(baseDir, ".") + "/" + ls[i] + "\", [], function () {\r\n\treturn \"" + toDataUri(directory + "/" + ls[i]).toString() + "\";\r\n});\r\n"
                        }
                        file += "\r\n";
                    } else {// If building CSS
                        if (ls[i].endsWith(".css")) {
                            var fileContent = fileSystem.readFileSync(directory + "/" + ls[i]).toString();
                            fileContent = (function (css) {
                                // process css
                                var index;
                                var rootVariables = globalRules;
                                var rootRules = css.match(/:root {([^}]*\n[^}]*)*}/gm)
                                if (rootRules !== null) {
                                    rootRules = rootRules[0];
                                    css = css.replace(rootRules, "");
                                    var ruleLines = rootRules.split(":root {")[1].split("}")[0].split(";");
                                    for (var i = 0; i < ruleLines.length; i++) {
                                        var ruleLine = ruleLines[i];
                                        var sides = ruleLine.trim().split(":");
                                        if (sides.length > 1) {
                                            rootVariables[sides[0].trim()] = sides[1].trim()
                                        }
                                    }
                                }
                                index = css.indexOf("var(");
                                while(index !== -1) {
                                    var variable = css.match(/var\((.*?)\)/)[0].split("var(")[1].split(")")[0];
                                    var variableNames = Object.keys(rootVariables);
                                    if (variableNames.indexOf(variable) !== -1) {
                                        css = css.replace(/var\((.*?)\)/, rootVariables[variable]);
                                    } else {
                                        css = css.replace(/var\((.*?)\)/, 'undefined');
                                    }
                                    index = css.indexOf("var(");
                                }
                                if (embedImages) {
                                    index = css.indexOf("-image: url(");
                                    while(index !== -1) {
                                        var url = css.match(/-image: url\((.*?)\)/)[0].split("url(")[1].split(")")[0];
                                        if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
                                            url = url.substring(1, url.length - 1);
                                        }
                                        var dataUri = toDataUri(baseDir + "/" + url);
                                        css = css.replace(/-image: url\((.*?)\)/, "--processedimage: url(\"" + dataUri + "\")");
                                        index = css.indexOf("-image: url(");
                                    }
                                    css = css.replace(/--processedimage/g, '-image');
                                }
                                return css;
                            } (fileContent))
                            file += fileContent;
                        }
                    }
                }
            }
            // Remove blank spaces
            var lines = file.split("\r\n");
            var blankLines = 0;
            var outputLines = "";
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].trim() === "") {
                    blankLines++;
                } else {
                    blankLines = 0;
                }
                if (blankLines < 2) {
                    outputLines += lines[i] + "\r\n";
                }
            }
            return outputLines
        }

        try {
            fileSystem.mkdirSync(outputDirectory);
        }
        catch 
        {
            // pass
        }
        var runningScript = "var __defineData = { dependencies: {}, queue: [] };\r\n";
        var innerDefine = function (registerUri, dependencies, callback) {
            var currentlyRegisteredKeys = Object.keys(__defineData.dependencies);
            var foundDependencies = [];
            var wait = false;
            for (var i = 0; i < dependencies.length; i++) {
                if (dependencies[i] === "exports") {
                    var exporte = {};
                    callback(exporte);
                    var result = exporte;
                    foundDependencies.push(result);
                }
                if (dependencies[i] === "require") {
                    var result = exporte;
                    foundDependencies.push(result);
                    __defineData.dependencies[registerUri] = result;
                }
            }
            if (foundDependencies.length === dependencies.length) {
                wait = false;
            } else {
                for (var i = 0; i < dependencies.length; i++) {
                    if (currentlyRegisteredKeys.indexOf(dependencies[i]) == -1)
                    {
                        // Need to wait for a dependency to register
                        wait = true;
                    } else {
                        foundDependencies.push(__defineData.dependencies[dependencies[i]]);
                    }
                }
            }
            if (!wait) {
                var result = callback.apply(null, foundDependencies);
                if (dependencies.indexOf("exports") !== -1) {// change the result if the module uses exports
                    result = foundDependencies["exports".indexOf(dependencies)]
                }
                __defineData.dependencies[registerUri] = result;
                var toRemove = [];
                var currentQueue = __defineData.queue.slice();
                for (i = 0; i < currentQueue.length; i++) {
                    if (currentQueue[i].dependencies.indexOf(registerUri) !== -1) {
                        // Something is waiting on this resource,
                        // Tell it to stop waiting
                        if (currentQueue[i].registerUri !== null) {
                            define(currentQueue[i].registerUri, currentQueue[i].dependencies, currentQueue[i].callback);
                        } else {
                            require(currentQueue[i].dependencies, currentQueue[i].callback);
                        }
                        toRemove.push(i);
                    }
                }
                for (i = 0; i < toRemove.length; i++) {
                    __defineData.queue.splice(toRemove[i], 1);
                }
            } else {
                __defineData.queue.push({ "registerUri": registerUri, "dependencies": dependencies, "callback": callback });
            }
        }
        var innerRequireJs = function (dependencies, callback = null) {
            if (typeof dependencies == 'string' && callback === null & typeof window === 'undefined') {
                return nodeRequire(dependencies);
            } else if (typeof dependencies == 'string' && callback === null) {
                // you can synchronously load something that already exsits in __defineData
                if (Object.keys(__defineData.dependencies).indexOf(dependencies) !== -1) {
                    return __defineData.dependencies[dependencies];
                }
            }
            var currentlyRegisteredKeys = Object.keys(__defineData.dependencies);
            var foundDependencies = [];
            var wait = false;
            for (var i = 0; i < dependencies.length; i++) {
                if (currentlyRegisteredKeys.indexOf(dependencies[i]) == -1)
                {
                    // Need to wait for a dependency to register
                    wait = true;
                    if (typeof window === 'undefined') {
                        // in node, should check for a common require module
                        try {
                            var dependency = nodeRequire(dependencies[i]);
                            __defineData.dependencies[dependencies[i]] = dependency;
                            foundDependencies.push(dependency);
                        } catch {

                        }
                    }
                } else {
                    foundDependencies.push(__defineData.dependencies[dependencies[i]]);
                }
            }
            if (!wait) {
                if (callback === null) {
                    var promise = new Promise(function (resolve, reject) {
                        resolve.apply(null, foundDependencies);
                    });
                    return promise;
                } else {
                    callback.apply(null, foundDependencies);
                }
            } else {
                if (callback !== null) {
                    __defineData.queue.push({ "registerUri": null, "dependencies": dependencies, "callback": callback });
                } else {
                    return new Promise(function (resolve, reject) {
                        __defineData.queue.push({ "registerUri": null, "dependencies": dependencies, "callback": function () {
                            resolve.apply(null, arguments);
                        } });
                    });
                }
            }
        }

        runningScript += "\r\nvar define = " + innerDefine.toString().split("\n").join("\r\n") + ";\r\n\r\n";
        runningScript += "\r\ndefine.amd = true;\r\n\r\n";
        if ((exportType === 'js' || exportType === 'node') && htmlFile === null) {
            runningScript += "var nodeRequire\r\n";
            runningScript += "if (typeof window === 'undefined') {\r\n";
            runningScript += "\tnodeRequire = module.require;\r\n";
            runningScript += "}\r\n\r\n"
        }
        runningScript += "var require = " + innerRequireJs.toString().split("\n").join("\r\n") + ";\r\n" ;
        runningScript += buildDirectoryIntoSingleFile(directory) + "\r\n";
        var finishedScript = "(function () {\r\n";
        finishedScript += "\t//built with javascript-link@" + package.version + "\r\n";
        finishedScript += tabString(runningScript.toString().trim() + "\r\n\r\n", 1);
        finishedScript += "// jlimports\r\n";
        if (finishedScript.endsWith("\t")) {
            finishedScript = finishedScript.substring(0, finishedScript.length - 2);
        }

        var grants = []
        var ffPermissions = [];
        // #region jlimports
        var jlimports = [];
        var importedBuiltins = [];
        var index = 0;
        if (finishedScript.match(/['\"]builtins\/(.*?)['\"]/g) !== null) {
            while (index < finishedScript.match(/['\"]builtins\/(.*?)['\"]/g).length) {
                var builtinName = finishedScript.match(/['\"]builtins\/(.*?)['\"]/g)[index].split("ins/")[1];
                builtinName = builtinName.substring(0, builtinName.length - 1); // remove the end quotes
                var builtins = fileSystem.readdirSync(require.dirname + "/builtins");
                if (builtins.indexOf(builtinName + ".js") !== -1 && importedBuiltins.indexOf(builtinName) === -1) {
                    // This is a valid builtin
                    importedBuiltins.push(builtinName);
                    var builtin
                    if (typeof require.nodeRequire === 'function') {
                        builtin = require.nodeRequire(require.dirname.replace("\\","/") + "/builtins/" + builtinName + ".js");
                    } else {
                        builtin = require(require.dirname.replace("\\","/") + "/builtins/" + builtinName + ".js");
                    }
                    var tab = "";
                    if (jlimports.length > 0) {
                        tab = "\t";
                    }
                    jlimports.push(tab + "define(\"builtins/" + builtinName + "\", [], " + "\t" + tabString(builtin(exportType.toLowerCase()).toString().replaceAll("\n", "\r\n").replaceAll(/\t* {3}/sg, "\t"), -3, true) + ");\r\n");
                    for (var i = 0; i < builtin.GMgrants.length; i++) {
                        var grant = builtin.GMgrants[i];
                        if (grants.indexOf(grant) === -1) {
                            grants.push(grant);
                        }
                    }
                    for (var i = 0; i < builtin.FFpermissions.length; i++) {
                        var permission = builtin.FFpermissions[i];
                        if (ffPermissions.indexOf(permission) === -1) {
                            ffPermissions.push(permission);
                        }
                    }
                }
                index++;
            }
            finishedScript = finishedScript.trim().replace("// jlimports", jlimports.join("\r\n") + "\r\n");
        }
        //finishedScript = finishedScript.substring(0, finishedScript.lastIndexOf("\r\n")) + "\t" + finishedScript.substring(finishedScript.lastIndexOf("\r\n") + 1, finishedScript.length)
        // #endregion

        if (htmlFile === null) {
            finishedScript += "}())";
            if (exportType.toLowerCase() === "userscript") {
                var userscriptPrefix = "// ==UserScript==\r\n" +
                                        "// @name         " + buildPackage.name + "\r\n" +
                                        "// @namespace    " + buildPackage.repository.url + "\r\n" +
                                        "// @version      " + buildPackage.version + "\r\n" +
                                        "// @description  " + buildPackage.description + "\r\n" +
                                        "// @author       " + buildPackage.author + "\r\n";
                                        if (buildPackage.match === undefined) {
                                            userscriptPrefix  += "// @match        https://*/*\r\n";
                                        } else {
                                            userscriptPrefix  += "// @match        " + buildPackage.match + "\r\n";
                                        }
                if (Object.keys(buildPackage).indexOf("icon") !== -1) {
                    userscriptPrefix += "// @icon         " +  toDataUri(buildPackage.icon) + "\r\n"
                }
                for (var i = 0; i < grants.length; i++) {
                    userscriptPrefix += "// @grant        " + grants[i] + "\r\n";
                }
                userscriptPrefix +=     "// ==/UserScript==\r\n";
                finishedScript = userscriptPrefix + finishedScript;
                // Remove blank spaces
                var lines = finishedScript.split("\r\n");
                var outputLines = "";
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].trim() !== "") {
                        outputLines += lines[i]
                        if (i !== lines.length - 2) { 
                            outputLines += "\r\n";
                        }
                    }
                }
                finishedScript = outputLines;

            }
            fileSystem.writeFileSync(outputDirectory + "/output.js", finishedScript);
            var manifest = {};
            // if either chrome or firefox extension
            if (["chrome", "firefox"].indexOf(exportType.toLowerCase()) !== -1) {
                manifest = {
                    manifest_version: 2,
                    name: buildPackage.name,
                    version: buildPackage.version,
                    description: buildPackage.description,
                    content_scripts: [{
                        matches: ["*://*/*"],
                        js: ["output.js"]
                    }]
                }
                manifest.permissions = ffPermissions;
            }
            if (exportType.toLowerCase() === "chrome") {
                manifest.content_scripts[0].run_at = "document_idle";
                try {
                    fileSystem.mkdirSync(outputDirectory + "/chrome");
                }
                catch 
                {
                    // pass
                }
                fileSystem.renameSync(outputDirectory + "/output.js", outputDirectory + "/chrome/output.js")
                fileSystem.writeFileSync(outputDirectory + "/chrome/manifest.json", JSON.stringify(manifest));

                if (buildPackage.icon !== undefined) {
                    manifest.icons = {
                        "48": buildPackage.icon
                    }
                    try {
                        fileSystem.mkdirSync(outputDirectory + "/chrome/icons");
                    }
                    catch 
                    {
                        // pass
                    }
                    fileSystem.copyFileSync(buildPackage.icon, outputDirectory + "/chrome/icons/48.png");
                }
                if (signed) {
                    var apiKeys = {};
                    try {
                        apiKeys = JSON.parse(require("text!" + process.cwd() + "/api-keys.json"));
                        var pack_extension_key = "";
                        try {
                            fileSystem.readFileSync("output/chrome.pem").toString();
                            pack_extension_key = "--pack-extension-key=" + process.cwd() + "/" + outputDirectory + "/chrome.pem";
                        } catch {
                            // will throw if there isn't already a private key
                        }
                        var child = childProcess.exec("chrome.exe --pack-extension=" + process.cwd() + "/" + outputDirectory + "/chrome " + pack_extension_key);
                        child.stdout.setEncoding("utf8");
                        child.stdout.on('data', console.log);
                        child.stderr.on('data', console.error);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            if (exportType.toLowerCase() === "firefox") {
                manifest.browser_specific_settings = {
                    "gecko": {
                        "id":  buildPackage.name + "@" + buildPackage.author.replaceAll(" ", "")
                    }
                };
                try {
                    fileSystem.mkdirSync(outputDirectory + "/firefox");
                }
                catch 
                {
                    // pass
                }
                fileSystem.renameSync(outputDirectory + "/output.js", outputDirectory + "/firefox/output.js")
                fileSystem.writeFileSync(outputDirectory + "/firefox/manifest.json", JSON.stringify(manifest));

                if (buildPackage.icon !== undefined) {
                    manifest.icons = {
                        "48": buildPackage.icon
                    }
                    try {
                        fileSystem.mkdirSync(outputDirectory + "/firefox/icons");
                    }
                    catch 
                    {
                        // pass
                    }
                    fileSystem.copyFileSync(buildPackage.icon, outputDirectory + "/firefox/icons/48.png");
                }
                if (signed) {
                    var apiKeys = {};
                    try {
                        apiKeys = JSON.parse(require("text!" + process.cwd() + "/api-keys.json"));
                        var child = childProcess.exec("cd " + process.cwd() + "/" + outputDirectory+ " && npx web-ext sign --source-dir=.\firefox\ --artifacts-dir=.\ --api-key=" + apiKeys["firefox"]["api-key"] + " --api-secret=" + apiKeys["firefox"]["api-secret"]);
                        child.stdout.setEncoding("utf8");
                        child.stdout.on('data', console.log);
                        child.stderr.on('data', console.error);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        if (htmlFile !== null && exportType === 'html' || exportType === 'js') {
            finishedScript = finishedScript.substring(0, finishedScript.lastIndexOf("\r\n")) + finishedScript.substring(finishedScript.lastIndexOf("\r\n") + 2, finishedScript.length);
            finishedScript += "// " + buildPackage.name + "@" + buildPackage.version + "\r\n";
            finishedScript += "}())";
            var html = fileSystem.readFileSync(htmlFile).toString();
            var inlineScript = tabString(finishedScript, 3);
            var pageParts = html.split("/* import scripts */");
            html = pageParts[0] + "\r\n" + inlineScript + "\r\n\t\t" + pageParts[1];
            if (cssDirectory !== null) {
                var globalRules = {};
                try {
                    globalRulesStats = fileSystem.statSync(cssDirectory + "/global.css");
                    if (!globalRulesStats.isDirectory()) {
                        var css = fileSystem.readFileSync(cssDirectory + "/global.css").toString();
                        var rootRules = css.match(/:root {([^}]*\n[^}]*)*}/gm)
                        if (rootRules !== null) {
                            rootRules = rootRules[0];
                            css = css.replace(rootRules, "");
                            var ruleLines = rootRules.split(":root {")[1].split("}")[0].split(";");
                            for (var i = 0; i < ruleLines.length; i++) {
                                var ruleLine = ruleLines[i];
                                var sides = ruleLine.trim().split(":");
                                if (sides.length > 1) {
                                    globalRules[sides[0].trim()] = sides[1].trim()
                                }
                            }
                        }
                    }
                }
                catch (ex)
                {
                    // no global rules, pass
                }
                var css = buildDirectoryIntoSingleFile(cssDirectory, directory, true, globalRules);
                var inlineCSS = tabString(css, 3);
                function replaceLast(find, replace, string) {
                    var lastIndex = string.lastIndexOf(find);
                    
                    if (lastIndex === -1) {
                        return string;
                    }
                    
                    var beginString = string.substring(0, lastIndex);
                    var endString = string.substring(lastIndex + find.length);
                    
                    return beginString + replace + endString;
                }
                html = replaceLast("/* import styles */", "\r\n" + inlineCSS + "\r\n\t\t", html);
            }
            fileSystem.writeFileSync(outputDirectory + "/output.html", html);
        }
    }
    return link;
});