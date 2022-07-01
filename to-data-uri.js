
// #region NodeJS Require
var define
if (typeof define !== 'function') {
    define = require('amdefine')(module);
}
// #endregion NodeJS Require

define(['fs'], function (fileSystem) {
    var toDataUri = function (pngLocation) {
        var base64mime = "image/png";
        if (pngLocation.endsWith(".jpg") || pngLocation.endsWith(".jpeg")) {
            base64mime = "image/jpg";
        } else if (pngLocation.endsWith(".mp3")) {
            base64mime = "audio/mp3"
        } else if (pngLocation.endsWith(".mp4")) {
            base64mime = "video/mp4"
        }
        var dataUri = 'data:' + base64mime + ';base64,';
        var data = fileSystem.readFileSync(pngLocation, 'binary');
        var buffer = Buffer.from(data, 'binary');
        var string = buffer.toString('base64');

        var limit = parseInt(string.length/50);
        for (var i = 1; i <= limit; i++) {
            // more output
            dataUri += '' + string.substring( (i - 1) * 50, i * 50 ) + '';
        }
        if (string.length > limit * 50) {
            // final lines of output
            dataUri += '' + string.substring( limit * 50, string.length ) + '';
        }
        return dataUri;
    }
    return toDataUri;
});