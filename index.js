#! /usr/bin/env node
var requirejs = require('requirejs');
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
});

require = requirejs;
require.dirname = __dirname;
var process = require('process');
var linkResource = 'link';
if (require.nodeRequire.main !== module) {
    linkResource = __dirname + "/link.js";
}

require(["fs", linkResource], function (fileSystem, link) {
    if (require.nodeRequire.main === module) {
        var directory = '.';
        var outputDirectory = null;
        var htmlFile = null;
        var cssDirectory = null;
        var embedImages = true;
        var exportType = "js";
        var signed = false;
        if (process.argv.length < 3) {
            // if there aren't enough arguments
            console.log("Not enough arguments")
            console.log("Possible arguments: ")
            console.log("\tinput-directory - mandatory")
            console.log("\toutput-directory - optional (defaults to input-directory/../output)")
            console.log("\thtml-file - optional (if not given, will default to javascript file link instead of HTML file link)")
            console.log("\tcss-directory - optional (if not given, will not inject any CSS into output HTML file)")
            console.log("\tembed-images - optional (if this is 'false', the link will not embed images in CSS, otherwise, the default is to embed images in CSS.)")
            console.log("\texport-type - optional (ex: js, html, node, firefox)")
            console.log("\tsigned - optional (will look in " + process.cwd().replaceAll("\\", "/") + "/api-keys.json for api keys for the build type)")
            console.log("\t\tExample JSON:")
            console.log("\t\t{")
            console.log("\t\t\t\"firefox\": {")
            console.log("\t\t\t\t\"api-key\": \"your JWT issuer from addons.mozilla.org\",")
            console.log("\t\t\t\t\"api-secret\": \"your JWT secret from addons.mozilla.org\"")
            console.log("\t\t\t}")
            console.log("\t\t}")
            return;
        }
        if (process.argv.length > 2) {
            directory = process.argv[2];
        }
        if (process.argv.length > 3) {
            outputDirectory = process.argv[3];
        }
        if (process.argv.length > 4) {
            htmlFile = process.argv[4];
        }
        if (process.argv.length > 5) {
            cssDirectory = process.argv[5];
        }
        if (process.argv.length > 6) {
            embedImages = !(process.argv[6] === "false");
        }
        if (process.argv.length > 7) {
            exportType = process.argv[7];
        }
        if (process.argv.length > 7) {
            signed = process.argv[8] === "signed";
        }
        if (outputDirectory === null) {
            outputDirectory = directory + '/../output'
        }
        if (htmlFile === "null") {
            htmlFile = null;
        }
        if (cssDirectory == "null") {
            cssDirectory = null;
        }
        link(directory, outputDirectory, htmlFile, cssDirectory, embedImages, exportType, signed);
    } else {
        module.exports = link;
    }
});