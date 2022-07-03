
describe('test', function() {

    // test() and specify() is also available
    var log = function () {
        var fs = require('fs')
        var content = "";
        for (var i = 0; i < arguments.length; i++) {
            content += arguments[i] + "\r\n";
        }
        fs.writeFileSync('log', content, 'utf-8');
    }
    it('do the page logs match what should be expected given the example folder?', function(browser) {
      browser
        .url('file:///' + __dirname.toString().replaceAll('\\', '/') + '/output/output.html')
        .waitForElementVisible('.card', 4000)
        .elements('css selector', '.card-list [class="card"]', function (logEntries) {
            log(JSON.stringify(logEntries.value, null, 2))
            var cards = [
                {
                    title: "JavaScript Link Example",
                    description: 
`A CLI tool for transpiling a directory of resources into a target output file
View on GitHub�`
                },
                {
                    title: "Usage:",
                    description: "",
                    referenceMedia:
                    `# @param {string} input-directory - directory to check for source files
# @param {string} output-directory - (optional) directory to output to (defaults to input-directory/../output)
# @param {string} html-file - (optional) the base html file to be used (for HTML based exports)
# @param {string} css-directory - (optional) the CSS directory
# @param {bool} embed-images - (optional) whether or not to embed resources like images and audio (defaults to true)
# @param {string} export-type - (optional) the type of export (ex: js, html, userscript, chrome, firefox)
# @param {bool} signed - (optional) only used for Firefox extension exports and requires a file name api-keys.json with the content:
# {  
# "firefox": {
#     "api-key": "your JWT issuer from addons.mozilla.org",
#     "api-secret": "your JWT secret from addons.mozilla.org"
#   }
# }
npx javascript-link {input-directory} {output-directory} {html-file} {css-directory} {embed-images=true} {export-type=js} {signed=false}`
                },
                {
                    title: null,
                    description: 
`You can load data using the same notation as the text plugin in RequireJS.
This is how to retrieve data from a JSON file.`,
                    referenceMedia: 
`require(["text!data/swords.json"], function (swordsJSON) {
  console.log(swordsJSON);
});`
                },
                {
                    title: null,
                    description: "This is a list loaded from JSON:",
                    referenceMedia: 
`[
  {
    "name": "Magic Blade",
    "might": 25,
    "hit": 100,
    "description": "Wow, shiny!"
  },
  {
    "name": "Bronze Sword",
    "might": 5,
    "hit": 85,
    "description": "A sword"
  }
]`
                },
                {
                    title: null,
                    description: "This is how to set and get data from the storage associated with your export type.",
                    referenceMedia: 
`require(["builtins/storage"], async function (storage) {
  await storage.set("test-field", { location: window.location.href, integer: 23});
  console.log(await storage.get("test-field"));
});`
                },
                {
                    title: null,
                    description: "This is a piece of data stored in local storage:",
                    referenceMedia: 
`{
  "location": "file:///` + __dirname.replaceAll("\\", "/") + `/output/output.html",
  "integer": 23
}`
                },
                {
                    title: null,
                    description: "This is how to display a linked image.",
                    referenceMedia: 
`require(["data-uri!img/parallax-forest-preview.png"], async function (forestPreview) {
  var image = document.createElement('img');
  image.src = forestPreview;
  document.body.appendChild(image);
});`
                },
                {
                    title: null,
                    description: null,
                    referenceMedia: 
`data:image/png;base64,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`
                },
                {
                    title: null,
                    description: "This is how to display a linked audio file.",
                    referenceMedia: 
`require(["data-uri!music/desert_loop.mp3"], async function (desertLoop) {
  var audio = document.createElement('audio');
  audio.src = desertLoop;
  document.body.appendChild(audio);
});`
                },
                {
                    title: null,
                    description: null,
                    referenceMedia: 
                }
            ];
            logEntries = logEntries.value;
            browser.assert.equal(logEntries.length, cards.length, ((logEntries.length === cards.length)?"Just the right amount of":(logEntries.length > cards.length?"Too many":"Too few")) + " logs based on the example folder");
            for (var i = 0; i < logEntries.length; i++) {
                var logEntry = logEntries[i];
                logEntry.key = i;
                ;(function (logEntry) {
                    browser.element('css selector', '.card-list [class="card"]:nth-child(' + (logEntry.key + 1).toString() + ') h1', function (titleElement) {
                        if (titleElement.status === 0) {
                            browser.elementIdText(titleElement.value[Object.keys(titleElement.value)[0]], function (text) {
                                if (Object.keys(cards[logEntry.key]).indexOf('title') == -1) {
                                    cards[logEntry.key].title = ""
                                }
                                if (cards[logEntry.key].title === null) {
                                    cards[logEntry.key].title = ""
                                }
                                browser.assert.equal(text.value, cards[logEntry.key].title, "Title of card #" + (logEntry.key + 1).toString())
                            });
                        } else if (Object.keys(cards[logEntry.key]).indexOf('title') == -1) {
                            // There is supposed to be a title here
                            browser.assert.not.equals(cards[logEntry.key].title, undefined)
                        }

                    });

                    browser.element('css selector', '.card-list [class="card"]:nth-child(' + (logEntry.key + 1).toString() + ') p', function (descriptionElement) {
                        log(JSON.stringify(descriptionElement, null, 2))
                        if (descriptionElement.status === 0) {
                            browser.elementIdText(descriptionElement.value[Object.keys(descriptionElement.value)[0]], function (text) {
                                if (Object.keys(cards[logEntry.key]).indexOf('description') == -1) {
                                    cards[logEntry.key].description = ""
                                }
                                if (cards[logEntry.key].description === null) {
                                    cards[logEntry.key].description = ""
                                }
                                browser.assert.equal(text.value, cards[logEntry.key].description, "Description of card #" + (logEntry.key + 1).toString())
                            });
                        } else if (Object.keys(cards[logEntry.key]).indexOf('description') == -1) {
                            // There is supposed to be a description here
                            browser.assert.not.equals(cards[logEntry.key].description, undefined)
                        }

                    });

                    browser.element('css selector', '.card-list [class="card"]:nth-child(' + (logEntry.key + 1).toString() + ') img', function (imageElement) {
                        log(JSON.stringify(imageElement, null, 2))
                        if (imageElement.status === 0) {
                            browser.elementIdAttribute(imageElement.value[Object.keys(imageElement.value)[0]], "src", function (text) {
                                if (Object.keys(cards[logEntry.key]).indexOf('referenceMedia') == -1) {
                                    cards[logEntry.key].referenceMedia = ""
                                }
                                if (cards[logEntry.key].referenceMedia === null) {
                                    cards[logEntry.key].referenceMedia = ""
                                }
                                if (cards[logEntry.key].referenceMedia.startsWith('data:image')) {
                                    browser.assert.equal(text.value, cards[logEntry.key].referenceMedia, "Image of card #" + (logEntry.key + 1).toString())
                                }
                            });
                        } else if (Object.keys(cards[logEntry.key]).indexOf('referenceMedia') == -1) {
                            // There is supposed to be an image here
                            if (cards[logEntry.key].referenceMedia !== undefined && cards[logEntry.key].referenceMedia !== null) {
                                if (cards[logEntry.key].referenceMedia.startsWith('data:image')) {
                                    browser.assert.not.equals(cards[logEntry.key].referenceMedia, undefined)
                                }
                            }
                        }

                    });

                    browser.element('css selector', '.card-list [class="card"]:nth-child(' + (logEntry.key + 1).toString() + ') textarea', function (textareaElement) {
                        log(JSON.stringify(textareaElement, null, 2))
                        if (textareaElement.status === 0) {
                            browser.elementIdText(textareaElement.value[Object.keys(textareaElement.value)[0]], function (text) {
                                if (Object.keys(cards[logEntry.key]).indexOf('referenceMedia') == -1) {
                                    cards[logEntry.key].referenceMedia = ""
                                }
                                if (cards[logEntry.key].referenceMedia === null) {
                                    cards[logEntry.key].referenceMedia = ""
                                }
                                if (!cards[logEntry.key].referenceMedia.startsWith('data:audio') && !cards[logEntry.key].referenceMedia.startsWith('data:image')) {
                                    log(text.value);
                                    log(text.value + "\r\n" + cards[logEntry.key].referenceMedia);
                                    browser.assert.equal(text.value, cards[logEntry.key].referenceMedia, "Textarea of card #" + (logEntry.key + 1).toString())
                                }
                            });
                        } else if (Object.keys(cards[logEntry.key]).indexOf('referenceMedia') == -1) {
                            // There is supposed to be audio here
                            if (cards[logEntry.key].referenceMedia !== undefined && cards[logEntry.key].referenceMedia !== null) {
                                if (!cards[logEntry.key].referenceMedia.startsWith('data:audio') && !cards[logEntry.key].referenceMedia.startsWith('data:image')) {
                                    browser.assert.not.equals(cards[logEntry.key].referenceMedia, undefined)
                                }
                            }
                        }

                    });

                    browser.element('css selector', '.card-list [class="card"]:nth-child(' + (logEntry.key + 1).toString() + ') audio', function (audioElement) {
                        log(JSON.stringify(audioElement, null, 2))
                        if (audioElement.status === 0) {
                            browser.elementIdAttribute(audioElement.value[Object.keys(audioElement.value)[0]], "src", function (text) {
                                if (Object.keys(cards[logEntry.key]).indexOf('referenceMedia') == -1) {
                                    cards[logEntry.key].referenceMedia = ""
                                }
                                if (cards[logEntry.key].referenceMedia === null) {
                                    cards[logEntry.key].referenceMedia = ""
                                }
                                if (cards[logEntry.key].referenceMedia.startsWith('data:audio')) {
                                    browser.assert.equal(text.value, cards[logEntry.key].referenceMedia, "Audio of card #" + (logEntry.key + 1).toString())
                                }
                            });
                        } else if (Object.keys(cards[logEntry.key]).indexOf('referenceMedia') == -1) {
                            // There is supposed to be audio here
                            if (cards[logEntry.key].referenceMedia !== undefined && cards[logEntry.key].referenceMedia !== null) {
                                if (cards[logEntry.key].referenceMedia.startsWith('data:audio')) {
                                    browser.assert.not.equals(cards[logEntry.key].referenceMedia, undefined)
                                }
                            }
                        }

                    });
                }(logEntry))
            }
        });
    });
  
  });
  