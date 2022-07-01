
// #region NodeJS Require
var define
if (typeof define !== 'function') {
    define = require('amdefine')(module);
    amdefine = true;
}

// #endregion NodeJS Require

define(["../to-data-uri"], function (toDataUri){
    return {
        load: function (name, req, onload, config) {
            var url = req.toUrl(name);
            onload(toDataUri(url));
        }
    }
});
