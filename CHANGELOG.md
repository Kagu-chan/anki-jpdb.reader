## 0.6.1 (2025.05.17)
- fix: Issues with JPDB reachability will now get displayed properly [[#193](193)] [API]
- fix: Fix Kanji tokens not being applied for fragmented words [[#215](215)] [Texthighlighter]
- fix: Fix the same error message being shown multiple times [[#216](216)] [Popup]
- fix: Improved the error shown on text highlighter errors [[#216](216)] [Popup]
- fix: The copy error button now writes the actual exception to the clipboard [[#216](216)] [Popup]
- fix: Fix custom meta being applied twice [Hosts]
- change: Update documentation for custom parsing [[#217](217)] [Hosts, Documentation]
- change: Allow marking all words as frequent [[#237](237)] [Texthighlighter]
- change: Allow filtering simple hosts [Hosts]
- change: Disable youtube music parsing [Hosts]
- add: Add NHK news support [Hosts]
- add: Add Satori Reader support [Hosts]


## 0.6.0 (2025.05.04)
- fix: Fix the popup staying when the hovered object is removed from the DOM [[#164](164)] [Popup]
- fix: Enhanced the token matching for text highlighting [[#176](176)] [Texthighlighter]
- fix: Fix the parse page button shown despite the option being disabled [[#190](190)] [Parser]
- change: Allow disabling automatic parsing for specific pages [[#144](144)] [Hosts]
- add: Allow adding pages and meta definitions for custom parsing [[#176](176)] [Hosts]
- add: The TamperMonkey Addon for monolingual dictionaries by Nakura Nakamoto is now supported [[#176](176)] [API, Parser]
- add: Added the release date to the changelog [[#199](199)] [Documentation]
- add: Allow marking more frequent words in the text highlighter [[#210](210)] [Texthighlighter]
- add: add new pattern for generic texthooker [Hosts]


## 0.5.0 (2025.04.13)
- fix: In certain cases the card state did not properly update [[#156](156)] [Texthighlighter, API]
- change: The currently active tab can now be moved to the top of the list [[#108](108)] [Parser]
- change: The list of tabs can now be reduced to only the active tab [[#109](109)] [Parser]
- change: The settings page has been updated [[#110](110)] [Settings]
- change: Actions can now be assigned two keyboard shortcuts [[#134](134)] [Parser, Texthighlighter]
- change: The states for card state rotation can now be changed [Texthighlighter, API]
- add: Added a little parse page control to web pages [[#133](133)] [Parser]
- add: Suspended cards and decks are now supported [[#133](133)] [API, Texthighlighter, Parser]
- add: Allow changing the position of deck and mining actions on the popup [[#151](151)] [Popup]
- add: A changelog is now available [[#156](156)] [Documentation]
- add: The extension is now on the chrome web store [Browser, Documentation]


## 0.4.0 (2025.02.10)
- fix: Fix hosts configuration [Hosts, Parser]
- change: Update app styles injection [Texthighlighter]
- change: Update styling documentation [Texthighlighter, Documentation]
- add: Allow styling based on the current parser [Texthighlighter, Parser]


## 0.3.1 (2025.02.09)
- chore: Fix release references [[#58](58)] [Browser]


## 0.3.0 (2025.02.09)
- fix: Furigana will no longer be copied when looking up a word [[#56](56)] [Texthighlighter, API]
- add: Added support for Pitch Accent [[#55](55)] [Texthighlighter]
- add: Words can now be added to FORQ [[#64](64)] [API]
- add: Sentences can now be set on JPDB [[#65](65)] [API]


## 0.2.1 (2025.02.09)
- chore: Prepare extension store releases [[#58](58)] [Browser]


## 0.2.0 (2025.02.09)
- add: Added support for firefox [[#58](58)] [Browser]


## 0.1.2 (2025.02.04)
- fix: Single words can now be parsed [[#72](72)] [Parser]


## 0.1.1 (2025.02.04)
- add: Allow hiding the popup after unhovering the related token [[#69](69)] [Popup]
- add: Mark linux as compatible operating system [Platform]


## 0.1.0 (2025.01.31)
- add: Initial release with basic functionality [Browser]

