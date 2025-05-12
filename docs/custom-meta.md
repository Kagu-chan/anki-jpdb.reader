# Custom Parsing

## Preintegrated apps
[Some apps](../README.md#automatic-parsing) require additional logic to handle properly. Those apps have either custom configuration or custom code to behave as expected and interact with the extension automatically on page load.

Those apps can be viewed and disabled in the settings.

## Custom hosts
If a you find yourself often parsing a specific web app, you can enable autoatic parsing for such an app.

Just fill in the hosts (one per line, or seperate by `,`, `;` or `[space]`) in the settings. Those hosts are recognized by the extension and parsed as soon as you navigated to it or inside the app. URL matching implements [roughly the functionality described here](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

Please note that this works only properly for static content - apps loading its content async wont work properly. For anything advanced see [Custom meta](#custom-meta).

```
# Parsing an app, e.g. satorireader
*://*.satorireader.com/*

# Parsing a local file (e.g. a script pushing to the file)
file:///*local-japanese*.html
```

## Custom meta
App integrations is done by configuring a JSON object which maches to one or multiple hosts.

* [The complete schema can be viewed here](https://github.com/Kagu-chan/anki-jpdb.reader/blob/dev/src/shared/host-meta/public-api.ts)
* [All internal integrations are here](https://github.com/Kagu-chan/anki-jpdb.reader/blob/dev/src/shared/host-meta/default-hosts.ts)
  * please be aware that the samples use configuration objects that are ignored for custom meta. This serves only as a sample!

The configuration can be added as a JSON Array in the settings (*you wont see them in the list however, they are not processed in the settings page. To disable them, remove them from your configuration*)

```json5
[
  { // We can exclude apps from parsing completely
    // Defines a list of hosts, here crunchyroll and YouTube music
    "host": ["*://*.crunchyroll.com/*", "*://music.youtube.com/*"],
    // auto: false makes this configuration not parse automatically
    "auto": false,
    // disable excludes those pages from parsing. CR does not have any Japanese text at all, for YouTube it is to remove the parse controls
    "disabled": true
  },
  { // The actual keyboard shortcut and "Parse page" logic refers to this configuration
    // Match all pages (that is, if they don't find any other configuration that matches)
    "host": "<all_urls>",
    // Don't parse them automatically, so they respond to the shortcuts defined in the settings
    "auto": false,
    // Parse the 'body' of the page
    "parse": "body"
  },
  { // The CDE extension from JPDB is implemented here:
    "host": [
      // We match a list of jpdb pages that contain dictionary entries
      "*://jpdb.io/vocabulary/*",
      "*://jpdb.io/review*",
      "*://jpdb.io/deck*",
      "*://jpdb.io/search*"
    ],
    // We define a parser class - this way we can style those dict entries separately if we want
    "parserClass": "kochounoyume-parser",
    // We wait for elements to be added to the DOM to parse them
    "addedObserver": {
      // We search for children of the body element - can be omitted
      "observeFrom": "body",
      // If the added elements match this class, they should be parsed
      "notifyFor": ".custom-dictionary-entry",
      // A standard configuration that notifies us about added or removed child nodes - can be omitted
      "config": {
        "childList": true,
        "subtree": true
      }
    },
    // Don't parse elements matching this class
    "filter": ".meaning-subsection-label"
  },
  {
    "host": ["*://*.youtube.com/*", "*://*.youtu.be/*"],
    "parseVisibleObserver": true,
    "parserClass": "youtube-parser",
    "addedObserver": {
      "notifyFor": "ytd-comment-view-model"
    }
  },
  {
    "host": ["*://ja.wikipedia.org/*", "*://ja.m.wikipedia.org/*"],
    "parserClass": "wikipedia-parser",
    // Wikipedia works like most other extensions, but it contains a very large amount of text.
    // The parseVisibleObserver limits the parsing to the content you currently read (e.g. visible on the screen)
    "parseVisibleObserver": true,
    "addedObserver": {
      "notifyFor": "#firstHeading, #mw-content-text .mw-parser-output > *, .mwe-popups-extract > *",
      "observeFrom": "body",
      "config": {
        "childList": true,
        "subtree": true
      }
    },
    "filter": ".p-lang-btn, .vector-menu-heading-label, .vector-toc-toggle, .vector-page-toolbar, .mw-editsection, sup.reference"
  },
  {
    "host": "*://*.satorireader.com/articles/*",
    "parserClass": "satori-reader-parser",
    "parse": "#article-content", // Satori is nothing special - only automated parsing for the content
    "filter": ".play-button-container, .notes-button-container, .fg, .wpr" // We exclude some learning stuff and pay buttons however
  }
]
```
