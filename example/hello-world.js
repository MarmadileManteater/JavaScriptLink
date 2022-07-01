
// #region NodeJS Require
var define, require, nodeRequire
if (typeof define !== 'function') {
    define = require('amdefine')(module);
}
if  (typeof requirejs !== 'function') {
    nodeRequire = require;
    requirejs = require('requirejs');
    require = requirejs;
}
require.config({
    paths: {
        "builtins/storage": "../builtins/storage",
        "builtins/loader": "../builtins/loader",
        "builtins/http-request": "../builtins/http-request",
        "data-uri": "../builtins/data-uri"
    },
    nodeRequire: nodeRequire
});
require("builtins/storage");
require("builtins/loader");
require("builtins/http-request");
require("data-uri");
window = { location: { href: __dirname }}
// #endregion NodeJS Require

require(["text!data/swords.json", "builtins/storage", "builtins/loader", "data-uri!img/parallax-forest-preview.png", "data-uri!music/desert_loop.mp3", "text!templates/card.html"], async function (swordsJSON, storage, loader, imageUri , desertLoopUri, cardHTML) {
    var createElementsFromHTML = function (html) {
        var div = document.createElement("div");
        div.innerHTML = html;
        return div.children;
    }
    var print = function (content, title = null, referenceMedia = null, colCount = 12, textareaHeight = 'auto') {
        try {
            var html = cardHTML;
            html = html.replace("<!-- Columns -->", colCount.toString());
            if (referenceMedia !== null) {
                var mediaHTML = "";
                if (typeof referenceMedia === 'function') {
                    mediaHTML = "<textarea>" + referenceMedia.toString() + "</textarea>";
                    html = html.replace("<!-- JSON -->", mediaHTML);
                } else if (typeof referenceMedia === 'object') {
                    mediaHTML = "<textarea>" + JSON.stringify(referenceMedia, null, 2) + "</textarea>";
                    html = html.replace("<!-- JSON -->", mediaHTML);
                } else if (typeof referenceMedia === 'string') {
                    if (referenceMedia.startsWith("data:audio")) {
                        var audio = document.createElement("audio");
                        audio.src = referenceMedia;
                        audio.setAttribute("controls","");
                        mediaHTML = audio.outerHTML;
                    } else if (referenceMedia.startsWith("data:image")) {
                        var img = document.createElement("img");
                        img.src = referenceMedia;
                        mediaHTML = img.outerHTML;
                    } else {
                        mediaHTML = "<textarea style=\"height: " + textareaHeight + "px;\">" + referenceMedia.toString() + "</textarea>";
                        html = html.replace("<!-- JSON -->", mediaHTML);
                        mediaHTML = "";
                    }
                    html = html.replace("<!-- Reference -->", mediaHTML);
                }
            }
            if (title !== null) {
                html = html.replace("<!-- Title -->", title);
            }
            if (content === null) {
                html = html.replace("<p><!-- Description --></p>", "");// remove content section if content is null
            } else {
                html = html.replace("<!-- Description -->", content);
            }

            var card = createElementsFromHTML(html)[0];
            document.querySelector(".card-list").appendChild(card);
        } catch (exception) {
            console.warn(exception);
            console.log(content);
        }
    }
    loader.onload(async function () {
        var testField = await storage.get("test-field");
        if (testField === undefined || testField === null) {
            await storage.set("test-field", { location: window.location.href, integer: 23});
        }

        var swords = JSON.parse(swordsJSON);
        print("A CLI tool for transpiling a directory of resources into a target output file<br/><a href=\"https://github.com/MarmadileManteater/JavaScriptLink\">View on GitHub&raquo;</a>", "JavaScript Link Example");
        print(null, "Usage:", `\r# @param {string} input-directory - directory to check for source files\r# @param {string} output-directory - (optional) directory to output to (defaults to input-directory/../output)\r# @param {string} html-file - (optional) the base html file to be used (for HTML based exports)\r# @param {string} css-directory - (optional) the CSS directory\r# @param {bool} embed-images - (optional) whether or not to embed resources like images and audio (defaults to true)\r# @param {string} export-type - (optional) the type of export (ex: js, html, userscript, chrome, firefox)\r# @param {bool} signed - (optional) only used for Firefox extension exports and requires a file name api-keys.json with the content:\r# {  \r# "firefox": {\r#     "api-key": "your JWT issuer from addons.mozilla.org",\r#     "api-secret": "your JWT secret from addons.mozilla.org"\r#   }\r# }\rnpx javascript-link {input-directory} {output-directory} {html-file} {css-directory} {embed-images=true} {export-type=js} {signed=false}`, 12, 250);
        print("You can load data using the same notation as the text plugin in RequireJS. <br/> This is how to retrieve data from a JSON file.", null, `require(["text!data/swords.json"], function (swordsJSON) {\r  console.log(swordsJSON);\r});`, 6);
        print("This is a list loaded from JSON:", null, swords, 6);
        print("This is how to set and get data from the storage associated with your export type.", null, `require(["builtins/storage"], async function (storage) {\r  await storage.set("test-field", { location: window.location.href, integer: 23});\r  console.log(await storage.get("test-field"));\r});`, 6);
        var testField = await storage.get("test-field");
        print("This is a piece of data stored in local storage:", null, testField, 6);
        print("This is how to display a linked image.", null, `require(["data-uri!img/parallax-forest-preview.png"], async function (forestPreview) {\r  var image = document.createElement('img');\r  image.src = forestPreview;\r  document.body.appendChild(image);\r});`, 6);
        print("", null, imageUri, 6);
        print("This is how to display a linked audio file.", null, `require(["data-uri!music/desert_loop.mp3"], async function (desertLoop) {\r  var audio = document.createElement('audio');\r  audio.src = desertLoop;\r  document.body.appendChild(audio);\r});`, 6);
        print("", null, desertLoopUri, 6);
    });

});