# Anki JPDB Reader

## Downloads

* [Chrome (Browser Extension)](https://chromewebstore.google.com/detail/anki-jpdb-reader/ocmngfhjplhjgmkjmacdmkodkphnicad)
* [Firefox (Browser Extension)](https://addons.mozilla.org/firefox/addon/anki-jpdb-reader/)
* [All Releases](https://github.com/Kagu-chan/anki-jpdb.reader/releases)

A browser extension thats aims to parse most japanese text in the browser using [JPDB](https://jpdb.io/) and mining into JPDB or [Anki](https://apps.ankiweb.net/) decks.

## This is a fork of the [JPDB Web Reader extension](https://github.com/max-kamps/jpd-breader)
Thanks to Max and the [JPDB Discord](https://discord.gg/jWwVD7D2sZ) for making the original extension and fixing some issues along the way!
Sadly, manifest 3 came along and thus the original is no longer working.

### Please note:
* Currently only chromium-based browsers and firefox are supported.
* Installation in Kiwi and comparable browsers possible, but the extension is not adjusted for mobile use
* Bunpro is currently not supported
* Touchscreen support is currently missing
* An import and export of settings is currently missing
* Support for youtube subtitles has been removed - please use this extension together with [asbplayer](https://github.com/killergerbah/asbplayer)
* Extension Updates in browser app stores are sometimes delayed from releases on github - this should usually make no difference

## Automatic parsing
Some web apps and sites require special attention to work properly, therefore they parse automatically on certain triggers.

|App|URLs
|---|---
|[ッツ Reader](https://github.com/ttu-ttu/ebook-reader)|[reader.ttsu.app](https://reader.ttsu.app), [ttu-ebook.web.app](https://ttu-ebook.web.app)
|Texthooker pages|[anacreondjt texthooker](https://anacreondjt.gitlab.io/texthooker.html), [learnjapanese.moe texthooker](https://learnjapanese.moe/texthooker.html), [exSTATic tracker](https://kamwithk.github.io/exSTATic/tracker.html), [renji-xd texthooker](https://renji-xd.github.io/texthooker-ui/)
|Mokuro|[reader.mokuro.app](https://reader.mokuro.app)
|Mokuro (Legacy)|[Mokuro](https://github.com/kha-white/mokuro): **IMPORTANT**: File path must contain `mokuro`, and file name must end in `.html`
|Readwok|[app.readwok.com](https://app.readwok.com/)
|Wikipedia|[ja.wikipedia.org](https://ja.wikipedia.org/)
|asbplayer|[github.com/killergerbah/asbplayer](https://github.com/killergerbah/asbplayer)
|Youtube comments|[youtube.com](https://youtube.com/)


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

[Firefox Browser Extension](https://addons.mozilla.org/firefox/addon/anki-jpdb-reader/) **or**

1. Download the latest `-firefox.xpi` file from the releases page
2. Open up your browser and navigate to `about:debugging`
3. Click on `This firefox`, then `Load temporary addon`
4. In the file picker dialog, navigate to the folder you downloaded the xpi file to.
7. Click select/open/choose to exit the dialog and load the extension
8. Continue with the [Setup](#setup) section

Please note, that if you use the manual setup, the extension will be unloaded the next time you open firefox. Your settings will be preserved. This is only for testing and debugging!

## Setup

Upon installation the settings page will open. You can also find it by clicking on the reader icon (読) in the browser menu bar. It might be hidden behind the extension overflow menu, which looks like a little puzzle piece (🧩).

Here you will need to enter your jpdb API key. It can be found at the very bottom of the [jpdb settings page](https://jpdb.io/settings).
You can also change various hotkeys

## Usage

You can use the reader on any website. Just select some text, right click, and choose the "Parse ... with jpdb" option. Alternatively use the shortcut (Alt+P) or the extension menu at the top right corner.

Words will be colored according to their state (known, new, etc.). Hover over words while holding Shift to see their meaning, and to mine or review them.

## Can I customize the colors? Can I customize which furigana get shown?

Customization is currently done with custom CSS, because its the most simple way to offer a flexible framework.

Here are some common customizations you might want. Feel free to use multiple of them, and modify them to your liking.

Don't color words:
```css
.jpdb-word { color: inherit; /* inherit color from the website instead of using a custom color */ }
```

Only color new words:
```css
.jpdb-word { color: inherit; }
.jpdb-word.new { color: rgb(75, 141, 255); }
.jpdb-word.not-in-deck { color: rgb(126, 173, 255); }
```

Only color new words, but mark more frequent words additionally
```css
.jpdb-word { color: inherit; }
.jpdb-word.new, .jpdb-word.not-in-deck { color: rgb(75, 141, 255); }
.jpdb-word.frequent { color: rgb(126, 173, 122); }
```

Show an underline rather than changing the text color:
```css
.jpdb-word.new {
    color: inherit;
    text-decoration: underline 3px rgb(75, 141, 255);
}
```

Hide all jpdb furigana:
```css
.jpdb-furi { display: none; }
```

Hide jpdb furigana only for some classes of words:
```css
.jpdb-word:is(.never-forget, .known, .due, .failed) .jpdb-furi { display: none; }
```

Only show jpdb furigana while hovering:
```css
.jpdb-word:not(:hover) .jpdb-furi { visibility: hidden; }
```

Mark misparsed words
```css
.jpdb-word.misparsed {
    color: rgb(255, 0, 0);
    background-color: lightgray;
}
```

Disable misparsed word coloring
```css
.jpdb-word.misparsed {
  color: unset;
  background-color: unset;
}
```

Add extra styles only for ABSPlayer subtitles
```css
.asb-player-parser {
  .jpdb-word { color: white; }
}
```

Notes if you aren't super familiar with CSS:
- CSS supports many color formats, like colornames (`green`), hex `#a2ff0e` or `rgb(126, 230, 17)`. Pick whichever you find most convenient.
- Selectors with more classes are higher priority. For example, `.jpdb-word.new` will overwrite `.jpdb-word`.
- For selectors with the same number of classes, *lower/later lines* have higher priority.
- You can add `!important` after a property (like `color: red !important;`) to overwrite the priority system.
- You can use `:is(.class, .class)` to select any element that has *at least one* of those classes. For example, `.jpdb-word:is(.due, .failed)` selects all words that are due *or* failed.
- You can use `:not(.class)` to select any element that does *not* have that class. For example, `.jpdb-word:not(.new)` selects all words that are *not* new.
- You can nest reoccuring classes to make the css simpler to read. To combine selectors (like `.jpdb-word.new`) you may use
```css
.jpdb-word {
    &.new { color: rgb(75, 141, 255); }
}
```

List of classes:
- `.jpdb-word` - Any part of the text that was run through the jpdb parser
- `.jpdb-furi` - Furigana added via jpdb. Note that these might not necessarily be correct, as they are machine-generated.
- `.unparsed` - Parts where jpdb could not identify any words
- `.not-in-deck` - Words that were not in any of your decks. Note that these are not necessarily new, they might have been reviewed before.
    jpdb does not track the state of words that are not in any decks.
- `.locked` - Locked words
- `.redundant` - Redundant words
- `.new` - New words
- `.learning` - Learning words
- `.known` - Known words
- `.never-forget` - Words that are marked as never forget, or are part of a deck that is marked never forget.
- `.due` - Due words (that is, words that are in the `Due` state. If you have failed your last review, the words will be `Failed` instead!)
- `.failed` - Failed words
- `.suspended` - Suspended words (for example, through the "Suspend words outside of a given top most common words" feature)
- `.blacklisted` - Blacklisted words (either individually, or through settings like "Blacklist particles", "Blacklist katakana loanwords", etc.)
- `.frequent` - Words in a top most frequency range. Only applied if enabled in the settings

List of pitch pattern classes:
- `.heiban` - Words that follow the heiban (平板型) pitch accent pattern
- `.atamadaka` - Words that follow the atamadaka (頭高型) pitch accent pattern
- `.nakadaka` - Words that follow the nakadaka (中高型) pitch accent pattern
- `.odaka` - Words that follow the odaka (尾高型) pitch accent pattern
- `.kifuku` - Words that follow the kifuku (起伏型) pitch accent pattern

List of miscellaneous classes:
- `.misparsed` - Words that are clearly mistaken by jpdb. Only works if the source already has furigana.
- `.unknown-pattern` - Words where the pitch accent pattern could not be determined

List of app container classes:
- `.base-parser`
- `.texthooker-parser`
- `.ex-static-parser`
- `.readwok-parser`
- `.ttsu-parser`
- `.youtube-parser`
- `.mokuro-parser`
- `.mokuro-legacy-parser`
- `.wikipedia-parser`
- `.asb-player-parser`
- `.kochounoyume-parser`

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
