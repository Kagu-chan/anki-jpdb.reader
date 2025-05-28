# Anki JPDB Reader

## Contents

1. [Downloads](#downloads)
2. [Automatic parsing](#automatic-parsing)
3. [Installation](#installation)
4. [Setup](#setup)
5. [Usage](#usage)
6. [Customize parsing](#customize-parsing)
7. [Customize text colors and furigana](#customize-text-colors-and-furigana)
8. [Building](#building)
9. [Contributing](#contributing)
10. [License](#license)

## Downloads

* [Chrome (Browser Extension) for chromium based browsers](https://chromewebstore.google.com/detail/anki-jpdb-reader/ocmngfhjplhjgmkjmacdmkodkphnicad)
* [Firefox (Browser Extension) for Firefox and Firefox Android](https://addons.mozilla.org/firefox/addon/anki-jpdb-reader/)
* [Edge (Browser Extension) for Edge or Edge Canary Edition](https://microsoftedge.microsoft.com/addons/detail/gpomfklkdbhmpagecjpnlhlffdlhcbnb)
* [All Releases](https://github.com/Kagu-chan/anki-jpdb.reader/releases)

A browser extension thats aims to parse most japanese text in the browser using [JPDB](https://jpdb.io/) and mining into JPDB or [Anki](https://apps.ankiweb.net/) decks.

## This is a fork of the [JPDB Web Reader extension](https://github.com/max-kamps/jpd-breader)
Thanks to Max and the [JPDB Discord](https://discord.gg/jWwVD7D2sZ) for making the original extension and fixing some issues along the way!
Sadly, manifest 3 came along and thus the original is no longer working.

### Please note:
* Currently only chromium-based browsers and firefox (including Android) are supported
* Mobile support for kiwi, Edge Canary and comparable browsers as well as firefox android is experimental
* Bunpro is currently not supported
* An import and export of settings is currently missing
* Support for youtube subtitles has been removed - please use this extension together with [asbplayer](https://github.com/killergerbah/asbplayer)
* Extension Updates in browser app stores are sometimes delayed from releases on github - this should usually make no difference

## Automatic parsing
Some web apps and sites require special attention to work properly, therefore they parse automatically on certain triggers. Those can be disabled or extended in the settings.

|App|URLs
|---|---
|[ッツ Reader](https://github.com/ttu-ttu/ebook-reader)|[reader.ttsu.app](https://reader.ttsu.app), [ttu-ebook.web.app](https://ttu-ebook.web.app)
|Texthooker pages|[anacreondjt texthooker](https://anacreondjt.gitlab.io/texthooker.html), [learnjapanese.moe texthooker](https://learnjapanese.moe/texthooker.html), [exSTATic tracker](https://kamwithk.github.io/exSTATic/tracker.html), [renji-xd texthooker](https://renji-xd.github.io/texthooker-ui/)
|Mokuro|[reader.mokuro.app](https://reader.mokuro.app)
|Mokuro (Legacy)|[Mokuro](https://github.com/kha-white/mokuro): **IMPORTANT**: File path must contain `mokuro`, and file name must end in `.html`
|Readwok|[app.readwok.com](https://app.readwok.com/)
|Satori Reader|[satorireader.com](https://www.satorireader.com/)
|NHK News|[nhk.or.jp](https://www3.nhk.or.jp/news/)
|Wikipedia|[ja.wikipedia.org](https://ja.wikipedia.org/)
|asbplayer|[github.com/killergerbah/asbplayer](https://github.com/killergerbah/asbplayer)
|Youtube comments|[youtube.com](https://youtube.com/)
|Custom Dictionaries|[CDM by Nakura Nakamoto](https://gitlab.com/nakura/jpdb_cdm)
|LunaTranslator|[Luna Translator](https://docs.lunatranslator.org/en/) with webview2 enabled

## Installation

### Chrome

[Chrome Browser Extension](https://chromewebstore.google.com/detail/anki-jpdb-reader/ocmngfhjplhjgmkjmacdmkodkphnicad) **or**

1.  Download the latest `*-chromium.zip` file from the releases page
2.  Unpack the zip file in a location of your choosing
3.  Open up your browser and navigate to `chrome://extensions/`
4.  Check the `Developer mode` switch at the top right of your window
5.  Click the `Load unpacked` button at the top left
6.  In the file picker dialog, navigate to the folder you unpacked earlier. You should see a file called `manifest.json` inside the folder
7.  Click select/open/choose to exit the dialog and load the extension
8.  Continue with the [Setup](#setup) section

### Firefox

[Firefox Browser Extension](https://addons.mozilla.org/firefox/addon/anki-jpdb-reader/), install it via Firefox for Android **or**

1. Download the latest `-firefox.xpi` file from the releases page
2. Open up your browser and navigate to `about:debugging`
3. Click on `This firefox`, then `Load temporary addon`
4. In the file picker dialog, navigate to the folder you downloaded the xpi file to.
7. Click select/open/choose to exit the dialog and load the extension
8. Continue with the [Setup](#setup) section

Please note, that if you use the manual setup, the extension will be unloaded the next time you open firefox. Your settings will be preserved. This is only for testing and debugging!

### Edge Canary

I am currently not able to test or verify the Edge version of the extension, but you can follow the instructions [on the Kiwi browser repository](https://github.com/kiwibrowser/src.next) as a starting point.

The extension ID is `gpomfklkdbhmpagecjpnlhlffdlhcbnb`.

## Setup

Upon installation the settings page will open. You can also find it by clicking on the reader icon (読) in the browser menu bar. It might be hidden behind the extension overflow menu, which looks like a little puzzle piece (🧩).

Here you will need to enter your jpdb API key. It can be found at the very bottom of the [jpdb settings page](https://jpdb.io/settings).
You can also change various hotkeys

## Usage

You can use the reader on any website. Just select some text, right click, and choose the "Parse ... with jpdb" option. Alternatively use the shortcut (Alt+P) or the extension menu at the top right corner.

Words will be colored according to their state (known, new, etc.). Hover over words while holding Shift to see their meaning, and to mine or review them.

## Customize parsing

Parsing can be enabled or disabled per integration. You can also add custom URLs to automatically parse in the settings.

Additionally, you can add complete meta definitions in JSON format - refer to [the typings](https://github.com/Kagu-chan/anki-jpdb.reader/blob/dev/src/shared/host-meta/public-api.ts) or see [the docs](docs/custom-meta.md)

## Customize text colors and furigana

Customization is currently done with custom CSS, because its the most simple way to offer a flexible framework. [See the docs on it here](docs/custom-css.md)

## Building

Node version 22.x is used!

You can run the following command to build the extension locally:
```sh
$ npm install
$ npm run build
```
The resulting files will be located in the `anki-jpdb.reader/` folder

For development, you can also run the build in watch mode:
```sh
$ npm install
$ npm run watch
```
This will continuously rebuild the source code as it changes, and place the output in the `anki-jpdb.reader/` folder.
It can be loaded as an unpacked extension from there.
Please remember to wait until building is done, and reload the extension on the "manage extensions" page before testing your changes.

Reloading is not required for the browser popup (top right) or the settings page.

Also, please look at the [Contributing](#contributing) section if you plan on contributing your changes.

## Contributing

Issues with feedback or ideas for new features are very welcome. You can also message me on the JPDB and Refold Japanese Discord servers (@chinokusari).

The following commands may be of interest to you:
* `npm run lint`: Checks your code for formatting issues, linter warnings and type errors. The CI also runs this, so your pull request will only be accepted if it passes. You can use eslint ignore comments if you get false positives, but leave a comment explaining why you think the error is false and safe to ignore.
* `npm run lint:fix`: Reformats your code, as well as fixing any fixable lint issues. Note, if your editor has a `prettier` plugin, installing that and turning on "format on save" will be more convenient.
* `npm run build`: Compiles the code for chrome, putting the compiled code into `anki-jpdb.reader/`
* `npm run build [target]` builds for a specific target
* `npm run watch`: Automatically recompiles the code for chrome when it changes, putting the output into `anki-jpdb.reader/`. Using this is recommended during development.
* `npm run watch [target]` recompiles for the specified target
* `npm run pack` builds, then packs the extension for all targets. The archives are placed inside `packages/`
* `npm run pack [target, [target...]]` builds for specified targets

Currently `chrome|chromium` and `firefox` are supported

## License

[MIT](https://choosealicense.com/licenses/mit/)

This project uses [Font Awesome 4](https://fontawesome.com/v4.7.0/), which is licensed under the [MIT License](https://opensource.org/licenses/MIT). Please ensure compliance with its license when using or distributing this project.
