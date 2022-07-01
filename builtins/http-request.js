
// #region NodeJS Require
var define
if (typeof define !== 'function') {
	define = require('amdefine')(module);
}
// #endregion NodeJS Require

define(function () {
	
	var generateHttpRequestLibrary = function (type) {
        if (type === "userscript") {
            return function () {
                var parseHeaders = function (headers) {
                    var headerParts = headers.split("\r\n");
                    var headerObject = {};
                    for (var i = 0; i < headerParts.length; i++) {
                        var headerPart = headerParts[i];
                        var keyValuePair = headerPart.split(": ");
                        var key = keyValuePair[0];
                        var value = keyValuePair[1];
                        if (key !== "") {
                            headerObject[key.toLowerCase()] = value;
                        }
                    }
                    return headerObject;
                }
                var request = function (uri, method = 'GET', body = undefined) {
                    return new Promise(function (resolve, reject) {
                        GM.xmlHttpRequest({
                            method: method,
                            url: uri,
                            data: body,
                            onload: function (response) {
                                if (response.status !== 200) {
                                    reject({ body: response.responseText, headers: parseHeaders(response.responseHeaders), status: response.status });
                                } else {
                                    resolve({ body: response.responseText, headers: parseHeaders(response.responseHeaders), status: response.status });
                                }
                            }
                        });
                    });
                };
                return request;
            }
        } else if (type === "html" || type === "chrome" || type === "firefox") {
            return function () {
                var parseHeaders = function (headers) {
                    var headerParts = headers.split("\r\n");
                    var headerObject = {};
                    for (var i = 0; i < headerParts.length; i++) {
                        var headerPart = headerParts[i];
                        var keyValuePair = headerPart.split(": ");
                        var key = keyValuePair[0];
                        var value = keyValuePair[1];
                        if (key !== "") {
                            headerObject[key.toLowerCase()] = value;
                        }
                    }
                    return headerObject;
                }
                var request = function (uri, method = 'GET', body = undefined) {
                    return new Promise(function (resolve, reject) {
                        if (window.location.href.startsWith("file://")) {
                            return reject("The request to " + uri + " can not be processed from the local filesystem.");
                        }
                        var xmlHttpRequest = new XMLHttpRequest();
                        xmlHttpRequest.onreadystatechange = function () {
                            if (this.readyState === 4 && this.status === 200) {
                                resolve({ body: this.response, headers: parseHeaders(this.getAllResponseHeaders()), status: this.status });
                            } else if (this.readyState === 4) {
                                // if ready and not 200 status
                                reject({ body: this.response, headers: parseHeaders(this.getAllResponseHeaders()), status: this.status });
                            }
                        }
                        xmlHttpRequest.open(method, uri);
                        xmlHttpRequest.send(body);
                    });
                };
                return request;
            }
		} else if (type === "node") {
            return function () {
                var url = require('url');
                var request = function (uri, method = 'GET', body = "") {
                    return new Promise(function (resolve, reject) {
                        var parsed = url.parse(uri);
                        var protocol = (parsed.protocol == "http") ? require('http') : require('https');
                        
                        const options = {
                            hostname: parsed.hostname,
                            port: parsed.port,
                            path: parsed.pathname,
                            method: method,
                            port: parsed.port,
                            body: body
                        };
            
                        const req = protocol.request(options, res => {
                            res.on('data', d => {
                                resolve({ response: d.toString(), status: res.statusCode, headers: res.headers });
                            });
                        });
                        req.write(body);
                        req.on('error', error => {
                            reject({ response: error.toString(), status: res.statusCode, headers: res.headers  });
                        });
            
                        req.end();
                    });
                }
                return request;
            }
        } else if (type === "js") {
            return function () {
                var parseHeaders = function (headers) {
                    var headerParts = headers.split("\r\n");
                    var headerObject = {};
                    for (var i = 0; i < headerParts.length; i++) {
                        var headerPart = headerParts[i];
                        var keyValuePair = headerPart.split(": ");
                        var key = keyValuePair[0];
                        var value = keyValuePair[1];
                        if (key !== "") {
                            headerObject[key.toLowerCase()] = value;
                        }
                    }
                    return headerObject;
                }
                if (typeof window === 'undefined') {
                    // nodejs
                    var url = require('url');
                    var request = function (uri, method = 'GET', body = "") {
                        return new Promise(function (resolve, reject) {
                            var parsed = url.parse(uri);
                            var protocol = (parsed.protocol == "http") ? require('http') : require('https');
                            
                            const options = {
                                hostname: parsed.hostname,
                                port: parsed.port,
                                path: parsed.pathname,
                                method: method,
                                port: parsed.port,
                                body: body
                            };
                
                            const req = protocol.request(options, res => {
                                res.on('data', d => {
                                    resolve({ response: d.toString(), status: res.statusCode, headers: res.headers });
                                });
                            });
                            req.write(body);
                            req.on('error', error => {
                                reject({ response: error.toString(), status: res.statusCode, headers: res.headers  });
                            });
                
                            req.end();
                        });
                    }
                    return request;
                } else {
                    var request = function (uri, method = 'GET', body = undefined) {
                        return new Promise(function (resolve, reject) {
                            if (window.location.href.startsWith("file://")) {
                                return reject("The request to " + uri + " can not be processed from the local filesystem.");
                            }
                            var xmlHttpRequest = new XMLHttpRequest();
                            xmlHttpRequest.onreadystatechange = function () {
                                if (this.readyState === 4 && this.status === 200) {
                                    resolve({ body: this.response, headers: parseHeaders(this.getAllResponseHeaders()), status: this.status });
                                } else if (this.readyState === 4) {
                                    // if ready and not 200 status
                                    reject({ body: this.response, headers: parseHeaders(this.getAllResponseHeaders()), status: this.status });
                                }
                            }
                            xmlHttpRequest.open(method, uri);
                            xmlHttpRequest.send(body);
                        });
                    };
                    return request;
                }
            }
        } else if (type.indexOf(".") !== -1 || type.indexOf("/") !== -1) {
            return generateHttpRequestLibrary("node")().apply(null, arguments);
        }
	}
	
	generateHttpRequestLibrary.GMgrants = ["GM.xmlHttpRequest"];
	generateHttpRequestLibrary.FFpermissions = ["https://*/*"];

	return generateHttpRequestLibrary;
});