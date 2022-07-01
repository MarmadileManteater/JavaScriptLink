
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

require(["text!data/swords.json", "builtins/storage", "builtins/loader", "data-uri!img/parallax-forest-preview.png", "data-uri!music/desert_loop.mp3"], async function (swordsJSON, storage, loader, imageUri , desertLoopUri) {
    var print = function (content) {
        try {
            var paragraph = document.createElement('p');
            if (typeof content === 'object') {
                content = JSON.stringify(content);
            }
            paragraph.innerHTML = content;
            paragraph.setAttribute("class", "log")
            document.body.appendChild(paragraph);
        } catch {
            console.log(content);
        }
    }
    loader.onload(async function () {
        var testField = await storage.get("test-field");
        if (testField === undefined || testField === null) {
            await storage.set("test-field", { location: window.location.href, integer: 23});
        }
        var audio = document.createElement("audio");
        audio.src = desertLoopUri;
        audio.setAttribute("controls","")
        document.body.appendChild(audio);
        var swords = JSON.parse(swordsJSON);
        print("This should run when the linked script is loaded.");
        print("Hello World!");
        print("You can load data using the same notation as the text plugin in RequireJS.");
        print("This is a list loaded from JSON:");
        for (var i = 0; i < swords.length; i++) {
            print(swords[i]);
        }
        var testField = await storage.get("test-field");
        print(testField);
        print("You can also load an image in as a uri using the require plugin data-uri!{image-path}")
        print(imageUri);
    });

});