
// #region NodeJS Require
var define
if (typeof define !== 'function') {
    define = require('amdefine')(module);
    amdefine = true;
}

// #endregion NodeJS Require

define(['fs', 'xml2js-parser'], function (fileSystem, xml2js){
    var tmx = {
            load: function (name, req, onload, config) {
                var result = tmx.loadSync(name, req);
                onload(result);
            },
            loadSync: function (name, req = require) {
                var url = req.toUrl(name);
                var fileContents = fileSystem.readFileSync(url + ".tmx").toString();
                var result = xml2js.parseStringSync(fileContents);
                var splitUrl = url.split("/");
                splitUrl.pop();
                var urldirectory = splitUrl.join('/');
                for (var i = 0; i < result["map"]["tileset"].length; i++) {
                    var tileset = result["map"]["tileset"][i];
                    var tilesetSource = tileset['$']['source'];
                    var tilesetContents = fileSystem.readFileSync(urldirectory + "/" + tilesetSource).toString();
                    var tileset = xml2js.parseStringSync(tilesetContents)["tileset"];
                    for (var k = 0; k < tileset["image"].length; k++) {
                        var image = tileset["image"][k];
                        var normalizedUrl = (urldirectory.replaceAll("\\", "/") + "/" + image["$"]["source"]).replace(/[^/]*\/\.\.\//g, "").replace(/\.\//g, "");
                        tileset["image"][k] = normalizedUrl;
                        
                    }
                    result["map"]["tileset"][i]["$"]["source"] = tileset;
                }
                return result;
            }
        }
    return tmx;
});
