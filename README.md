# Anki JPDB Reader

A browser extension thats aims to parse most japanese text in the browser using [JPDB](https://jpdb.io/) and mining into JPDB or [Anki](https://apps.ankiweb.net/) decks.

## This is a fork of the [JPDB Web Reader extension](https://github.com/max-kamps/jpd-breader)
Thanks to Max and the [JPDB Discord](https://discord.gg/jWwVD7D2sZ) for making the original extension and fixing some issues along the way!
Sadly, manifest 3 came along and thus the original is no longer working.

## Installation

### Chrome and other Chromium-based browsers
1.  Download the latest `.zip` file from the releases page
2.  Unpack the zip file in a location of your choosing
3.  Open up your browser and navigate to `chrome://extensions/`
4.  Check the `Developer mode` switch at the top right of your window
5.  Click the `Load unpacked` button at the top left
6.  In the file picker dialog, navigate to the folder you unpacked earlier. You should see a file called `manifest.json` inside the folder
7.  Click select/open/choose to exit the dialog and load the extension
8.  Continue with the [Initial Setup](#initial-setup) section

The extension will be uploaded to the chrome web store once its in a more mature state!
### Firefox
Firefox is not yet supported - however, this is planned in the future.

### Mobile browsers (e.g. Kiwi Browser)
Mobile is not yet supported. I dont own any devices to experiment on this, therefore i would need help from the community on this.

## Initial Setup
Open the settings page. You can find it by clicking on the reader icon (読) in the browser menu bar. It might be hidden behind the extension overflow menu, which looks like a little puzzle piece (🧩)
Here you will need to enter your jpdb API key. It can be found at the very bottom of the [jpdb settings page](https://jpdb.io/settings).
You can also change various hotkeys

## Usage

You can use the reader on any website. Just select some text, right click, and choose the "Parse ... with jpdb" option. Alternatively use the shortcut or the extension menu at the top right corner.

Words will be colored according to their state (known, new, etc.). Hover over words while holding to see their meaning, and to mine or review them.

Some pages require special support for technical reasons and will therefore start parsing immediately.

### Features missing

* touchscreen support
* forq
* set sentence
* import / export
* wider browser support

### Sites supported by the old extension
Most integrations are currently either not implemented or tested - Feedback is appreciated!

|App|URLs|Status
|---|---|---
|[ッツ Reader](https://github.com/ttu-ttu/ebook-reader)|[reader.ttsu.app](https://reader.ttsu.app), [ttu-ebook.web.app](https://ttu-ebook.web.app)|**buggy**
|Texthooker pages|[anacreondjt texthooker](https://anacreondjt.gitlab.io/texthooker.html), [learnjapanese.moe texthooker](https://learnjapanese.moe/texthooker.html), [exSTATic tracker](https://kamwithk.github.io/exSTATic/tracker.html), [renji-xd texthooker](https://renji-xd.github.io/texthooker-ui/)|seems to work
|Mokuro (Legacy)|[Mokuro](https://github.com/kha-white/mokuro): **IMPORTANT**: File path must contain `mokuro`, and file name must end in `.html`|**not implemented**
|Readwok|[app.readwok.com](https://app.readwok.com/)|*non-functional*
|Wikipedia|[ja.wikipedia.org](https://ja.wikipedia.org/)|**buggy**
|Youtube subtitles|[youtube.com](https://youtube.com/)|**not implemented**
|Bunpro|[bunpro.jp](https://bunpro.jp)|*not tested*

### Added by the community
|App|URLs|Status
|---|---|---
|asbplayer|[github.com/killergerbah/asbplayer](https://github.com/killergerbah/asbplayer)|seems to work
|Mokuro|[reader.mokuro.app](https://reader.mokuro.app)|**not implemented**
|Youtube comments|[youtube.com](https://youtube.com/)|**not implemented**
|NHK Japanese News Easy|[nhk.or.jp/news/easy](https://www3.nhk.or.jp/news/easy/)|**buggy**

### Known Bugs

* some pages like nhkweb / newseasy dont keep the correct context, but always the first word of the row

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

Notes if you aren't super familiar with CSS:
- CSS supports many color formats, like colornames (`green`), hex `#a2ff0e` or `rgb(126, 230, 17)`. Pick whichever you find most convenient.
- Selectors with more classes are higher priority. For example, `.jpdb-word.new` will overwrite `.jpdb-word`.
- For selectors with the same number of classes, *lower/later lines* have higher priority.
- You can add `!important` after a property (like `color: red !important;`) to overwrite the priority system.
- You can use `:is(.class, .class)` to select any element that has *at least one* of those classes. For example, `.jpdb-word:is(.due, .failed)` selects all words that are due *or* failed.
- You can use `:not(.class)` to select any element that does *not* have that class. For example, `.jpdb-word:not(.new)` selects all words that are *not* new.

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

## Building

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

Issues with feedback or ideas for new features are very welcome. You can also message me on the JPDB Discord server (@hmry#6502).

The following commands may be of interest to you:
*  `npm run lint`: Checks your code for formatting issues, linter warnings and type errors. The CI also runs this, so your pull request will only be accepted if it passes. You can use eslint ignore comments if you get false positives, but leave a comment explaining why you think the error is false and safe to ignore.
*  `npm run lint:fix`: Reformats your code, as well as fixing any fixable lint issues. Note, if your editor has a `prettier` plugin, installing that and turning on "format on save" will be more convenient.
*  `npm run build`: Compiles the code, putting the compiled code into `anki-jpdb.reader/`
*  `npm run watch`: Automatically recompiles code when it changes, putting the output into `anki-jpdb.reader/`. Using this is recommended during development.

Please note the following:
* All lint errors must be fixed - this should catch most potential problems
* Top level code is not allowed - please wrap everything in clean classes
* Extending `IntegrationScript` gives you access to some utility functions in content scripts
* Extending `BaseParser` or `AutomaticParser` can do a lot for you - in most cases simple adjustments are sufficient
* Using the `hosts.json` is the preferred way to add support for other pages - most appy can be broken down to common patterns and the code automated this way
* A lot of the code will be rewritten and better separated

If your change is large, or adds new dependencies, please consider opening an issue beforehand, so we may discuss.
Otherwise, I may choose to reject your pull request. Sorry.

For contributing, you can of course use any editor you want. I use VSCode together with ESLint (`dbaeumer.vscode-eslint`), Prettier (`esbenp.prettier-vscode`) and Prettier ESLint (`rvest.vs-code-prettier-eslint`).

## License

[MIT](https://choosealicense.com/licenses/mit/)
