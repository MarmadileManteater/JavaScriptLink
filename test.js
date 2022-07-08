
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
            var results = JSON.stringify(result, null, 4);
            console.log(results);
            try {
                fileSystem.mkdirSync("tests_output");
            } catch {

            }
            fileSystem.writeFileSync("tests_output/html-validator-results.json", results);
        })['catch'](function (error) {
        });
    } catch (error) {
    }
    process.exec("npx nightwatch --env firefox", function (error, stdout, stderr) {
        if (error) {
            throw new Error(error.message);
        }
        if (stderr) {
            console.log(stderr);
        }
        console.log(stdout);
        // Inject dark mode styles to test results
        var darkModeTestStyles = fileSystem.readFileSync('test/style.css');
        var nightwatchTestStyles = fileSystem.readFileSync('tests_output/nightwatch-html-report/css/style.css')
        fileSystem.writeFileSync('tests_output/nightwatch-html-report/css/style.css', nightwatchTestStyles + "\n" + darkModeTestStyles)
    });
})