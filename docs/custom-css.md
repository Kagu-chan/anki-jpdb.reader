# Custom CSS

Customization is currently done with custom CSS, because it's the simplest way to offer a flexible framework.

Here are some common customizations you might want. Feel free to use multiple of them, and modify them to your liking.

> **Important:**  
> In most cases, you will need to use `!important` in your CSS rules to override the extension's default styles and the website's own styles. For example:  
> ```css
> .jpdb-word { color: red !important; }
> ```
> Without `!important`, your custom styles may not be applied.
> 
> **Note:**  
> We are aware that requiring `!important` for most customizations is inconvenient. A fix is in the works, but due to the complexity and scale of the extension's styling system, it will take some time to be rolled out.

Don't color words:
```css
.jpdb-word { color: inherit !important; /* inherit color from the website instead of using a custom color */ }
```

Only color new words:
```css
.jpdb-word { color: inherit !important; }
.jpdb-word.new { color: rgb(75, 141, 255) !important; }
.jpdb-word.not-in-deck { color: rgb(126, 173, 255) !important; }
```

Only color new words, but mark more frequent words additionally:
```css
.jpdb-word { color: inherit !important; }
.jpdb-word.new, .jpdb-word.not-in-deck { color: rgb(75, 141, 255) !important; }
.jpdb-word.frequent { color: rgb(126, 173, 122) !important; }
```

Show an underline rather than changing the text color:
```css
.jpdb-word.new {
    color: inherit !important;
    text-decoration: underline 3px rgb(75, 141, 255) !important;
}
```

Hide all jpdb furigana:
```css
.jpdb-furi { display: none !important; }
```

Hide jpdb furigana only for some classes of words:
```css
.jpdb-word:is(.never-forget, .known, .due, .failed) .jpdb-furi { display: none !important; }
```

Only show jpdb furigana while hovering:
```css
.jpdb-word:not(:hover) .jpdb-furi { visibility: hidden !important; }
```

Mark misparsed words:
```css
.jpdb-word.misparsed {
    color: rgb(255, 0, 0) !important;
    background-color: lightgray !important;
}
```

Disable misparsed word coloring:
```css
.jpdb-word.misparsed {
  color: unset !important;
  background-color: unset !important;
}
```

Add extra styles only for asbplayer subtitles:
```css
.asb-player-parser {
  .jpdb-word { color: white !important; }
}
```

## Notes if you aren't super familiar with CSS

- **You will usually need to use `!important`** to override the extension's and website's styles.
- CSS supports many color formats, like color names (`green`), hex `#a2ff0e`, or `rgb(126, 230, 17)`. Pick whichever you find most convenient.
- Selectors with more classes are higher priority. For example, `.jpdb-word.new` will override `.jpdb-word`.
- For selectors with the same number of classes, *lower/later lines* have higher priority.
- You can add `!important` after a property (like `color: red !important;`) to overwrite the priority system.
- You can use `:is(.class, .class)` to select any element that has *at least one* of those classes. For example, `.jpdb-word:is(.due, .failed)` selects all words that are due *or* failed.
- You can use `:not(.class)` to select any element that does *not* have that class. For example, `.jpdb-word:not(.new)` selects all words that are *not* new.
- You can nest recurring classes to make the CSS simpler to read. To combine selectors (like `.jpdb-word.new`) you may use:
```css
.jpdb-word {
    &.new { color: rgb(75, 141, 255) !important; }
}
```

## List of classes

- `.jpdb-word` - Any part of the text that was run through the jpdb parser.
- `.jpdb-furi` - Furigana added via jpdb. Note that these might not necessarily be correct, as they are machine-generated.
- `.unparsed` - Parts where jpdb could not identify any words.
- `.not-in-deck` - Words that were not in any of your decks. Note that these are not necessarily new; they might have been reviewed before. jpdb does not track the state of words that are not in any decks.
- `.locked` - Locked words.
- `.redundant` - Redundant words.
- `.new` - New words.
- `.learning` - Learning words.
- `.known` - Known words.
- `.never-forget` - Words that are marked as never forget, or are part of a deck that is marked never forget.
- `.due` - Due words (that is, words that are in the `Due` state. If you have failed your last review, the words will be `Failed` instead!)
- `.failed` - Failed words.
- `.suspended` - Suspended words (for example, through the "Suspend words outside of a given top most common words" feature).
- `.blacklisted` - Blacklisted words (either individually, or through settings like "Blacklist particles", "Blacklist katakana loanwords", etc.).
- `.frequent` - Words in a top most frequency range. Only applied if enabled in the settings.

### List of pitch pattern classes

- `.heiban` - Words that follow the heiban (平板型) pitch accent pattern.
- `.atamadaka` - Words that follow the atamadaka (頭高型) pitch accent pattern.
- `.nakadaka` - Words that follow the nakadaka (中高型) pitch accent pattern.
- `.odaka` - Words that follow the odaka (尾高型) pitch accent pattern.
- `.kifuku` - Words that follow the kifuku (起伏型) pitch accent pattern.

### List of miscellaneous classes

- `.misparsed` - Words that are clearly mistaken by jpdb. Only works if the source already has furigana.
- `.unknown-pattern` - Words where the pitch accent pattern could not be determined.

### List of app container classes

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
- `.satori-reader-parser`
