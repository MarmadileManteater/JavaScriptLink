
// #region NodeJS Require
var define
if (typeof define !== 'function') {
	define = require('amdefine')(module);
}
// #endregion NodeJS Require

define(function () {
	
	var generateOnLoadLibrary = function (type) {
		if (["chrome", "firefox", "html", "userscript"].indexOf(type) !== -1) {
			// if any of the above platforms
				return function () {
					var onload = function (listener, listenerType = 'load') {
						if (document.readyState === 'complete') {
							listener();
						} else {
							window.addEventListener(listenerType, listener);
						}
					}
					return {
						onload: onload
					};
				}
		}
		if ("js" === type) {
				return function () {
					var onload = function (listener, listenerType = 'load') {
						if (typeof window === 'undefined') {
							listener();
						} else {
							if (document.readyState === 'complete') {
								listener();
							} else {
								window.addEventListener(listenerType, listener);
							}
						}
					}
					return {
						onload: onload
					};
				}
		}
		if ("node" === type) {
				return function () {
					var onload = function (listener, listenerType = 'load') {
						listener();
					}
					return {
						onload: onload
					};
				}
		}
	}
	
	generateOnLoadLibrary.GMgrants = [];
	generateOnLoadLibrary.FFpermissions = [];

	// If imported through node, generate a node library and pass it through
	generateOnLoadLibrary.onload = function (listener, listenerType = 'load') {
		return generateOnLoadLibrary("node")().onload(listener, listenerType);
	}

	return generateOnLoadLibrary;
});