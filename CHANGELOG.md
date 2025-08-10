## 0.7.0 (2025.08.10)
- fix: Fixed a race condition where sometimes a reload would not parse the page. [#306](https://github.com/Kagu-chan/anki-jpdb.reader/issues/306) [Parser]
- fix: Fixed a race condition where custom styles were not applied correctly. [#330](https://github.com/Kagu-chan/anki-jpdb.reader/issues/330) [Texthighlighter]
- add: Added an option to extend the popup to the right of the word. [#315](https://github.com/Kagu-chan/anki-jpdb.reader/issues/315) [Popup]
- add: Added support for Crunchyroll subtitles removal. [Features]


## 0.6.4 (2025.08.05)
- fix: Added experimental support for bunpro. [#61](https://github.com/Kagu-chan/anki-jpdb.reader/issues/61) [Parser]
- fix: Improved CSS injection and reduced flickering. [#235](https://github.com/Kagu-chan/anki-jpdb.reader/issues/235) [#272](https://github.com/Kagu-chan/anki-jpdb.reader/issues/272) [#306](https://github.com/Kagu-chan/anki-jpdb.reader/issues/306) [Texthighlighter]
- fix: Fixed a bug where the parser would not parse nested elements. [#238](https://github.com/Kagu-chan/anki-jpdb.reader/issues/238) [Parser]
- fix: Added an option to disable touch events in Satori Reader. [#307](https://github.com/Kagu-chan/anki-jpdb.reader/issues/307) [Parser]
- add: Added import and export of settings. [#66](https://github.com/Kagu-chan/anki-jpdb.reader/issues/66) [Settings]
- add: Added a debug mode for host configuration. [Settings]
- add: Added a link to the GitHub issues page. [Settings]
- chore: Fixed links in the changelog. [Documentation]
- chore: Updated wording and documentation. [Documentation]


## 0.6.3 (2025.05.23)
- fix: Re-added touchscreen support. [#63](https://github.com/Kagu-chan/anki-jpdb.reader/issues/63) [Popup]
- fix: Fixed keybinds not working when the browser was not focused. [#239](https://github.com/Kagu-chan/anki-jpdb.reader/issues/239) [Browser]
- change: Context menus are now skipped on mobile devices or if not granted. [#59](https://github.com/Kagu-chan/anki-jpdb.reader/issues/59) [#60](https://github.com/Kagu-chan/anki-jpdb.reader/issues/60) [#99](https://github.com/Kagu-chan/anki-jpdb.reader/issues/99) [#100](https://github.com/Kagu-chan/anki-jpdb.reader/issues/100) [Browser]
- change: Reduced the permissions required by the extension. [#91](https://github.com/Kagu-chan/anki-jpdb.reader/issues/91) [Browser]
- add: Added the ability to add cycling options to the popup. [#63](https://github.com/Kagu-chan/anki-jpdb.reader/issues/63) [Popup]


## 0.6.2 (2025.05.18)
- fix: Used options_ui for compatibility with Luna Translator. [#227](https://github.com/Kagu-chan/anki-jpdb.reader/issues/227) [Settings]
- change: Popup state classes are now applied to the popup container itself. [Popup]
- add: Added support for Luna Translator. [#227](https://github.com/Kagu-chan/anki-jpdb.reader/issues/227) [Hosts]


## 0.6.1 (2025.05.18)
- fix: Issues with JPDB reachability are now displayed properly. [#193](https://github.com/Kagu-chan/anki-jpdb.reader/issues/193) [API]
- fix: Fixed Kanji tokens not being applied for fragmented words. [#215](https://github.com/Kagu-chan/anki-jpdb.reader/issues/215) [Texthighlighter]
- fix: Fixed the same error message being shown multiple times. [#216](https://github.com/Kagu-chan/anki-jpdb.reader/issues/216) [Popup]
- fix: Improved the error message shown on text highlighter errors. [#216](https://github.com/Kagu-chan/anki-jpdb.reader/issues/216) [Popup]
- fix: The copy error button now writes the actual exception to the clipboard. [#216](https://github.com/Kagu-chan/anki-jpdb.reader/issues/216) [Popup]
- fix: Fixed custom meta being applied twice. [Hosts]
- change: Updated documentation for custom parsing. [#217](https://github.com/Kagu-chan/anki-jpdb.reader/issues/217) [Hosts, Documentation]
- change: Added the ability to mark all words as frequent. [#237](https://github.com/Kagu-chan/anki-jpdb.reader/issues/237) [Texthighlighter]
- change: Added the ability to filter simple hosts. [Hosts]
- change: Disabled YouTube Music parsing. [Hosts]
- add: Added NHK News support. [Hosts]
- add: Added Satori Reader support. [Hosts]


## 0.6.0 (2025.05.04)
- fix: Fixed the popup staying when the hovered object is removed from the DOM. [#164](https://github.com/Kagu-chan/anki-jpdb.reader/issues/164) [Popup]
- fix: Enhanced token matching for text highlighting. [#176](https://github.com/Kagu-chan/anki-jpdb.reader/issues/176) [Texthighlighter]
- fix: Fixed the parse page button being shown despite the option being disabled. [#190](https://github.com/Kagu-chan/anki-jpdb.reader/issues/190) [Parser]
- change: Added the ability to disable automatic parsing for specific pages. [#144](https://github.com/Kagu-chan/anki-jpdb.reader/issues/144) [Hosts]
- add: Added support for the TamperMonkey addon for monolingual dictionaries by Nakura Nakamoto. [#176](https://github.com/Kagu-chan/anki-jpdb.reader/issues/176) [API, Parser]
- add: Added the ability to add pages and meta definitions for custom parsing. [#176](https://github.com/Kagu-chan/anki-jpdb.reader/issues/176) [Hosts]
- add: Added the release date to the changelog. [#199](https://github.com/Kagu-chan/anki-jpdb.reader/issues/199) [Documentation]
- add: Added the ability to mark more frequent words in the text highlighter. [#210](https://github.com/Kagu-chan/anki-jpdb.reader/issues/210) [Texthighlighter]
- add: Added a new pattern for the generic texthooker. [Hosts]


## 0.5.0 (2025.04.13)
- fix: Fixed an issue where the card state did not properly update in certain cases. [#156](https://github.com/Kagu-chan/anki-jpdb.reader/issues/156) [Texthighlighter, API]
- change: Added the ability to move the currently active tab to the top of the list. [#108](https://github.com/Kagu-chan/anki-jpdb.reader/issues/108) [Parser]
- change: Added the ability to reduce the list of tabs to only the active tab. [#109](https://github.com/Kagu-chan/anki-jpdb.reader/issues/109) [Parser]
- change: Updated the settings page. [#110](https://github.com/Kagu-chan/anki-jpdb.reader/issues/110) [Settings]
- change: Added the ability to assign two keyboard shortcuts to actions. [#134](https://github.com/Kagu-chan/anki-jpdb.reader/issues/134) [Parser, Texthighlighter]
- change: Added the ability to change the states for card state rotation. [Texthighlighter, API]
- add: Added a parse page control to web pages. [#133](https://github.com/Kagu-chan/anki-jpdb.reader/issues/133) [Parser]
- add: Added support for suspended cards and decks. [#133](https://github.com/Kagu-chan/anki-jpdb.reader/issues/133) [API, Texthighlighter, Parser]
- add: Added the ability to change the position of deck and mining actions on the popup. [#151](https://github.com/Kagu-chan/anki-jpdb.reader/issues/151) [Popup]
- add: Added a changelog. [#156](https://github.com/Kagu-chan/anki-jpdb.reader/issues/156) [Documentation]
- add: Published the extension on the Chrome Web Store. [Browser, Documentation]


## 0.4.0 (2025.02.10)
- fix: Fixed hosts configuration. [Hosts, Parser]
- change: Changed app styles injection. [Texthighlighter]
- change: Updated styling documentation. [Texthighlighter, Documentation]
- add: Added the ability to style based on the current parser. [Texthighlighter, Parser]


## 0.3.1 (2025.02.09)
- chore: Fixed release references. [#58](https://github.com/Kagu-chan/anki-jpdb.reader/issues/58) [Browser]


## 0.3.0 (2025.02.09)
- fix: Furigana will no longer be copied when looking up a word. [#56](https://github.com/Kagu-chan/anki-jpdb.reader/issues/56) [Texthighlighter, API]
- add: Added support for pitch accent. [#55](https://github.com/Kagu-chan/anki-jpdb.reader/issues/55) [Texthighlighter]
- add: Added the ability to add words to FORQ. [#64](https://github.com/Kagu-chan/anki-jpdb.reader/issues/64) [API]
- add: Added the ability to set sentences on JPDB. [#65](https://github.com/Kagu-chan/anki-jpdb.reader/issues/65) [API]


## 0.2.1 (2025.02.09)
- chore: Prepared extension store releases. [#58](https://github.com/Kagu-chan/anki-jpdb.reader/issues/58) [Browser]


## 0.2.0 (2025.02.09)
- add: Added support for Firefox. [#58](https://github.com/Kagu-chan/anki-jpdb.reader/issues/58) [Browser]


## 0.1.2 (2025.02.04)
- fix: Fixed an issue where single words could not be parsed. [#72](https://github.com/Kagu-chan/anki-jpdb.reader/issues/72) [Parser]


## 0.1.1 (2025.02.04)
- add: Added the ability to hide the popup after unhovering the related token. [#69](https://github.com/Kagu-chan/anki-jpdb.reader/issues/69) [Popup]
- add: Marked Linux as a compatible operating system. [Platform]


## 0.1.0 (2025.01.31)
- add: Initial release with basic functionality. [Browser]

