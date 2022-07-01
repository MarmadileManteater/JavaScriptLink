
// #region NodeJS Require
var define, nodeRequire
if (typeof define !== 'function') {
    define = require('amdefine')(module);
}
if (typeof nodeRequire === 'undefined') {
    if (require.nodeRequire !== undefined) {
        nodeRequire = require.nodeRequire;
    } else {
        nodeRequire = require;
    }
}
// #endregion NodeJS Require

define(function () {
    
    var generateStorageLibrary = function (type) {
        if (type === "userscript") {
            return function () {
                var OBJECT_PREFIX = "object stored: ";
                var FUNCTION_PREFIX = "function stored: ";
                var INTEGER_PREFIX = "integer stored: ";
                var FLOAT_PREFIX = "float stored: ";
                return {
                    get: function (key) {
                        var value = GM_getValue(key);
                        if (value === undefined) {
                            value = undefined;
                        } else if (value.startsWith(OBJECT_PREFIX)) {
                            value = JSON.parse(value.substring(OBJECT_PREFIX.length, value.length));
                        } else if (value.startsWith(INTEGER_PREFIX)) {
                            value = parseInt(value.substring(INTEGER_PREFIX.length, value.length));
                        } else if (value.startsWith(FLOAT_PREFIX)) {
                            value = parseFloat(value.substring(FLOAT_PREFIX.length, value.length));
                        }
                        return new Promise(function (resolve) {
                            resolve(value);
                        });
                    },
                    set: function (key, value) {
                        if (typeof value === 'string') {
                            GM_setValue(key, value);
                        }
                        if (typeof value === 'object') {
                            GM_setValue(key, OBJECT_PREFIX + JSON.stringify(value));
                        } 
                        if (typeof value === 'function') {
                            GM_setValue(key, FUNCTION_PREFIX + value.toString());
                        } 
                        if (typeof value === 'number') {
                            if (value.toString().indexOf(".") !== -1) {
                                // Float
                                GM_setValue(key, FLOAT_PREFIX + value.toString());
                            } else {
                                // Integer
                                GM_setValue(key, INTEGER_PREFIX + value.toString());
                            }
                            
                        }
                        return new Promise(function (resolve) {
                            resolve();
                        })
                    }
                }
            }
        }

        if (type === "html") {
            return function () {
                var OBJECT_PREFIX = "object stored: ";
                var FUNCTION_PREFIX = "function stored: ";
                var INTEGER_PREFIX = "integer stored: ";
                var FLOAT_PREFIX = "float stored: ";
                return {
                    get: function (key) {
                        var value = localStorage.getItem(key);
                        if (value === null) {
                            value = undefined;
                        } else if (value.startsWith(OBJECT_PREFIX)) {
                            value = JSON.parse(value.substring(OBJECT_PREFIX.length, value.length));
                        } else if (value.startsWith(INTEGER_PREFIX)) {
                            value = parseInt(value.substring(INTEGER_PREFIX.length, value.length));
                        } else if (value.startsWith(FLOAT_PREFIX)) {
                            value = parseFloat(value.substring(FLOAT_PREFIX.length, value.length));
                        }
                        return new Promise(function (resolve) {
                            resolve(value);
                        });
                    },
                    set: function (key, value) {
                        if (typeof value === 'string') {
                            localStorage.setItem(key, value);
                        }
                        if (typeof value === 'object') {
                            localStorage.setItem(key, OBJECT_PREFIX + JSON.stringify(value));
                        } 
                        if (typeof value === 'function') {
                            localStorage.setItem(key, FUNCTION_PREFIX + value.toString());
                        } 
                        if (typeof value === 'number') {
                            if (value.toString().indexOf(".") !== -1) {
                                // Float
                                localStorage.setItem(key, FLOAT_PREFIX + value.toString());
                            } else {
                                // Integer
                                localStorage.setItem(key, INTEGER_PREFIX + value.toString());
                            }
                        } 
                        return new Promise(function (resolve) {
                            resolve();
                        })
                    }
                }
            }
        }

        if (type === "node") {
            return function () {
                var OBJECT_PREFIX = "object stored: ";
                var FUNCTION_PREFIX = "function stored: ";
                var INTEGER_PREFIX = "integer stored: ";
                var FLOAT_PREFIX = "float stored: ";
                return {
                    get: function (key) {
                        var fileSystem = nodeRequire("fs");
                        var storage = {};
                        if (fileSystem.existsSync("./storage.json")) {
                            storage = JSON.parse(fileSystem.readFileSync("./storage.json").toString())
                        }
                        value = storage[key];
                        if (value === undefined || value === null) {
                            value = undefined;
                        }
                        if (value.startsWith(OBJECT_PREFIX)) {
                            value = JSON.parse(value.substring(OBJECT_PREFIX.length, value.length));
                        } else if (value.startsWith(INTEGER_PREFIX)) {
                            value = parseInt(value.substring(INTEGER_PREFIX.length, value.length));
                        } else if (value.startsWith(FLOAT_PREFIX)) {
                            value = parseFloat(value.substring(FLOAT_PREFIX.length, value.length));
                        }
                        return new Promise(function (resolve) {
                            resolve(value);
                        })
                    },
                    set: function (key, value) {
                        var fileSystem = nodeRequire("fs");
                        var storage = {};
                        if (fileSystem.existsSync("./storage.json")) {
                            storage = JSON.parse(fileSystem.readFileSync("./storage.json").toString())
                        }
                        storage[key] = value;
                        if (typeof value === 'string') {
                            storage[key] = value;
                        }
                        if (typeof value === 'object') {
                            storage[key] = OBJECT_PREFIX + JSON.stringify(value);
                        } 
                        if (typeof value === 'function') {
                            storage[key] = FUNCTION_PREFIX + value.toString();
                        } 
                        if (typeof value === 'number') {
                            if (value.toString().indexOf(".") !== -1) {
                                // Float
                                localStorage.setItem(key, FLOAT_PREFIX + value.toString());
                            } else {
                                // Integer
                                localStorage.setItem(key, INTEGER_PREFIX + value.toString());
                            }
                            
                        } 
                        var storageFile = fileSystem.openSync("./storage.json", "w");
                        
                        fileSystem.writeSync(storageFile, JSON.stringify(storage));
                        fileSystem.close(storageFile);
                        return new Promise(function (resolve) {
                            resolve();
                        })
                    }
                }
            }
        }
        // ambiguous js format
        if (type === "js") {
            return function () {
                var OBJECT_PREFIX = "object stored: ";
                var FUNCTION_PREFIX = "function stored: ";
                var INTEGER_PREFIX = "integer stored: ";
                var FLOAT_PREFIX = "float stored: ";
                return {
                    get: function (key) {
                        var storage = {};
                        var value = undefined;
                        if (typeof window === 'undefined') {
                            var fileSystem = require("fs");
                            if (fileSystem.existsSync("./storage.json")) {
                                storage = JSON.parse(fileSystem.readFileSync("./storage.json").toString())
                            }
                            value = storage[key];
                        } else {
                            value = localStorage.getItem(key);
                        }
                        if (value === undefined || value === null) {
                            value =  undefined;
                        } else if (value.startsWith(OBJECT_PREFIX)) {
                            value = JSON.parse(value.substring(OBJECT_PREFIX.length, value.length));
                        } else if (value.startsWith(INTEGER_PREFIX)) {
                            value = parseInt(value.substring(INTEGER_PREFIX.length, value.length));
                        } else if (value.startsWith(FLOAT_PREFIX)) {
                            value = parseFloat(value.substring(FLOAT_PREFIX.length, value.length));
                        }
                        return new Promise(function (resolve) {
                            resolve(value);
                        })
                    },
                    set: function (key, value) {
                        if (typeof window === 'undefined') {
                            var fileSystem = require("fs");
                            var storage = {};
                            if (fileSystem.existsSync("./storage.json")) {
                                storage = JSON.parse(fileSystem.readFileSync("./storage.json").toString())
                            }
                            storage[key] = value;
                            if (typeof value === 'string') {
                                storage[key] = value;
                            }
                            if (typeof value === 'object') {
                                storage[key] = OBJECT_PREFIX + JSON.stringify(value);
                            } 
                            if (typeof value === 'function') {
                                storage[key] = FUNCTION_PREFIX + value.toString();
                            } 
                            if (typeof value === 'number') {
                                if (value.toString().indexOf(".") !== -1) {
                                    // Float
                                    localStorage.setItem(key, FLOAT_PREFIX + value.toString());
                                } else {
                                    // Integer
                                    localStorage.setItem(key, INTEGER_PREFIX + value.toString());
                                }
                                
                            } 
                            var storageFile = fileSystem.openSync("./storage.json", "w");
                            
                            fileSystem.writeSync(storageFile, JSON.stringify(storage));
                            fileSystem.close(storageFile);
                        } else {
                            if (typeof value === 'string') {
                                localStorage.setItem(key, value);
                            }
                            if (typeof value === 'object') {
                                localStorage.setItem(key, OBJECT_PREFIX + JSON.stringify(value));
                            } 
                            if (typeof value === 'function') {
                                localStorage.setItem(key, FUNCTION_PREFIX + value.toString());
                            } 
                            if (typeof value === 'number') {
                                if (value.toString().indexOf(".") !== -1) {
                                    // Float
                                    localStorage.setItem(key, FLOAT_PREFIX + value.toString());
                                } else {
                                    // Integer
                                    localStorage.setItem(key, INTEGER_PREFIX + value.toString());
                                }
                            }
                        }
                        return new Promise(function (resolve) {
                            resolve();
                        })
                    }
                }
            }
        }
        if (type === "firefox") {
            return function () {
                var OBJECT_PREFIX = "object stored: ";
                var FUNCTION_PREFIX = "function stored: ";
                var INTEGER_PREFIX = "integer stored: ";
                var FLOAT_PREFIX = "float stored: ";
                return {
                    get: function (key) {
                        return new Promise(function (resolve, reject) {
                            browser.storage.sync.get(key).then(function (value) {
                                if (typeof value === 'object') {
                                    value = value[key];
                                }
                                if (typeof value !== 'string') {
                                    value = undefined;
                                } else if (value.startsWith(OBJECT_PREFIX)) {
                                    if (value.substring(OBJECT_PREFIX.length, value.length) === "[object Object]") {
                                        value = OBJECT_PREFIX + "{}";
                                    }
                                    value = JSON.parse(value.substring(OBJECT_PREFIX.length, value.length));
                                    return resolve(value);
                                } else if (value.startsWith(INTEGER_PREFIX)) {
                                    value = parseInt(value.substring(INTEGER_PREFIX.length, value.length));
                                    return resolve(value);
                                } else if (value.startsWith(FLOAT_PREFIX)) {
                                    value = parseFloat(value.substring(FLOAT_PREFIX.length, value.length));
                                }
                                resolve(value);
                            })["catch"](reject);
                        });
                    },
                    set: function (key, value) {
                        return new Promise(function (resolve, reject) {
                            var syncObject = {};
                            if (typeof value === 'string') {
                                syncObject[key] = value.toString();
                            }
                            if (typeof value === 'object') {
                                syncObject[key] = OBJECT_PREFIX + JSON.stringify(value);
                            } 
                            if (typeof value === 'function') {
                                syncObject[key] = FUNCTION_PREFIX + value.toString();
                            } 
                            if (typeof value === 'number') {
                                if (value.toString().indexOf(".") !== -1) {
                                    // Float
                                    syncObject[key] = FLOAT_PREFIX + value.toString();
                                } else {
                                    // Integer
                                    syncObject[key] = INTEGER_PREFIX + value.toString();
                                }
                            }
                            browser.storage.sync.set(syncObject).then(resolve)['catch'](reject);
                        });
                    }
                }
            }
        }
        if (type === "chrome") {
            return function () {
                var OBJECT_PREFIX = "object stored: ";
                var FUNCTION_PREFIX = "function stored: ";
                var INTEGER_PREFIX = "integer stored: ";
                var FLOAT_PREFIX = "float stored: ";
                var browser = chrome;
                return {
                    get: function (key) {
                        return new Promise(function (resolve, reject) {
                            browser.storage.sync.get(key, function (value) {
                                if (chrome.runtime.lastError) {
                                    return reject(Error(chrome.runtime.lastError.message))
                                }
                                if (typeof value === 'object') {
                                    value = value[key];
                                }
                                if (typeof value !== 'string') {
                                    value = undefined;
                                } else if (value.startsWith(OBJECT_PREFIX)) {
                                    if (value.substring(OBJECT_PREFIX.length, value.length) === "[object Object]") {
                                        value = OBJECT_PREFIX + "{}";
                                    }
                                    value = JSON.parse(value.substring(OBJECT_PREFIX.length, value.length));
                                } else if (value.startsWith(INTEGER_PREFIX)) {
                                    value = parseInt(value.substring(INTEGER_PREFIX.length, value.length));
                                } else if (value.startsWith(FLOAT_PREFIX)) {
                                    value = parseFloat(value.substring(FLOAT_PREFIX.length, value.length));
                                }
                                resolve(value);
                            });
                        });
                    },
                    set: function (key, value) {
                        return new Promise(function (resolve, reject) {
                            var syncObject = {};
                            if (typeof value === 'string') {
                                syncObject[key] = value.toString();
                            }
                            if (typeof value === 'object') {
                                syncObject[key] = OBJECT_PREFIX + JSON.stringify(value);
                            } 
                            if (typeof value === 'function') {
                                syncObject[key] = FUNCTION_PREFIX + value.toString();
                            } 
                            if (typeof value === 'number') {
                                if (value.toString().indexOf(".") !== -1) {
                                    // Float
                                    syncObject[key] = FLOAT_PREFIX + value.toString();
                                } else {
                                    // Integer
                                    syncObject[key] = INTEGER_PREFIX + value.toString();
                                }
                            }
                            browser.storage.sync.set(syncObject, function (result) {
                                if (chrome.runtime.lastError) {
                                    return reject(Error(chrome.runtime.lastError.message))
                                }
                                resolve(result);
                            });
                        });
                    }
                }
            }
            
        }
    }
    
    generateStorageLibrary.GMgrants = ["GM_setValue", "GM_getValue"];
    generateStorageLibrary.FFpermissions = ["storage"];

    // If imported through node, generate a node library and pass it through
    generateStorageLibrary.get = function (key) {
        return generateStorageLibrary("node")().get(key);
    }

    generateStorageLibrary.set = function (key, value) {
        return generateStorageLibrary("node")().set(key, value);
    }

    return generateStorageLibrary;
});