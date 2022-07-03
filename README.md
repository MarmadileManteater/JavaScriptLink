# JavaScriptLink
This is a CLI tool for transpiling a directory of resources into one HTML or javascript file. This is alpha software, so things are unstable.

You can view the output of an example build [here](https://marmadilemanteater.github.io/javascriptlink/).

You can view the results of the latest automated tests ran on that build [here](https://marmadilemanteater.pythonanywhere.com/gh/javascriptlink/latest).

## Why does this exist?

I wanted a way to bundle images and audio into an HTML file, so that I could easily send that HTML file through an app like Discord to be viewed in a desktop web browser. Along the way, I added a way to export your directory to a userscript, a chrome extension, and a firefox extension. In order to bridge the implementation gap between those different build targets, I added several built-in libraries which allow the userscripts and extensions to utilize cross-site HTTP(s) requests and cross-site storage in a more consistent way (with Promises). Also, I wanted to use this for game development, so I added support for the [Tiled](https://github.com/mapeditor/tiled) .tmx format. 
