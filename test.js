
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
require.dirname = __dirname;
// #endregion NodeJS Require

require(["link", "fs", "html-validator", "child_process"], function (link, fileSystem, validator, process) {
    link("./example", "./output", "./example/index.html", "./example/css");
    const options = {
        format: 'text',
        data: fileSystem.readFileSync('output/output.html', 'utf8'),
        validator: 'WHATWG'
      }

    try {
        validator(options).then(function (result) {
            console.log("HTML Validator Results:")
            console.log(JSON.stringify(result, null, 4));
            if (result.errors.length !== 0) {
                throw result;
            }
        })['catch'](function (error) {
            throw error;
        });
    } catch (error) {
        throw error
    }
    process.exec("npx nightwatch --env firefox", function (error, stdout, stderr) {
        if (error) {
            console.log(error.message);
            return;
        }
        if (stderr) {
            console.log(stderr);
            return;
        }
        console.log(stdout);
    });
})