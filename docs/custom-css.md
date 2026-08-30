# Customize Text Colors and Furigana

Customization is done in two layers:

1. **Style Presets** (Settings → Text Highlighting) — the primary, settings-driven way to control word colors and furigana visibility. No CSS knowledge required.
2. **Custom CSS** — a power-user escape hatch layered on top of the presets, for anything the settings don't expose directly.

## Style Presets

Enable them via the **Enable style presets** checkbox in Settings → Text Highlighting. With this on, the extension injects CSS for you based on the options below; you don't need to write any CSS at all unless you want something the presets don't cover.

### State categories

Every word carries one or more raw JPDB card states (`Not in Deck`, `New`, `Learning`, `Known`, `Due`, `Failed`, `Locked`, `Never Forget`, `Suspended`, `Blacklisted`, `Redundant`). The **State Categories** table lets you assign each of these states to one of four categories — `Unmined`, `New`, `Learning`, `Known` — or `None` to leave a state uncategorized. Categories, not raw states, are what most of the options below (furigana visibility, frequency marking, i+1 marking) actually key off, so this table controls how those features apply to your states.

The default mapping:

| Card state | Category |
| --- | --- |
| Not in Deck | Unmined |
| New | New |
| Learning | Learning |
| Failed | Learning |
| Known | Known |
| Never Forget | Known |

### Base Style

Choose how words are colored:

- **JPDB** — colors words by their raw JPDB state (Not in deck, New, Learning, Known, Due, Failed, Locked, Never forget, Suspended, Blacklisted), matching the coloring used by the jpdb mpv plugin.
- **Category** — colors words by their assigned category instead (Unmined, New, Learning, Known), so states you've mapped to the same category share one color.
- **None** — disables the built-in coloring entirely; use Custom CSS below if you still want word colors.

Each mode shows its own color table once selected, plus a color option for each other word-highlighting features.

Each color field is a full color control: pick a color and alpha via the color picker, or expand it for a custom CSS style override (e.g. an underline or text-shadow instead of a plain text color) if you need more than a flat color.

### Furigana visibility

Independently of coloring, you can set furigana visibility per category — **Always**, **On hover**, or **Never** — for Unmined, New, Learning, and Known words. This lets you, for example, always show furigana on words you haven't mined yet while hiding it for words you already know.

## Custom CSS (advanced)

For anything the style presets don't cover, `customWordCSS` (Settings → Text Highlighting) and `customPopupCSS` let you write raw CSS that's injected alongside — and after — the preset-generated CSS.

> **Important:**  
> You will usually need `!important` in your rules to override the extension's preset styles and the website's own styles. For example:  
> ```css
> .jpdb-word { color: red !important; }
> ```
> Without `!important`, your custom styles may not be applied.

Here are some common customizations. Feel free to use multiple of them, and modify them to your liking.

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

Color by category instead of raw state (matches the "Category" base style, so this is only useful if you want to override individual colors rather than use the built-in color pickers):
```css
.jpdb-word.cat-unmined { color: rgb(75, 141, 255) !important; }
.jpdb-word.cat-new { color: rgb(75, 141, 255) !important; }
.jpdb-word.cat-learning { color: rgb(255, 69, 0) !important; }
.jpdb-word.cat-known { color: rgb(112, 192, 0) !important; }
```

### Notes if you aren't super familiar with CSS

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
- `.frequent` - Words in a top most frequency range. Only applied if enabled in the settings, and by default only for words in the `Unmined` category.
- `.i-plus-one` - The single unmined word in an otherwise-understood sentence. Only applied if i+1 marking is enabled.

### List of state category classes

- `.cat-unmined` - Words whose card state is mapped to the `Unmined` category.
- `.cat-new` - Words whose card state is mapped to the `New` category.
- `.cat-learning` - Words whose card state is mapped to the `Learning` category.
- `.cat-known` - Words whose card state is mapped to the `Known` category.

These are added alongside the raw state classes above (a word can carry both `.new` and `.cat-unmined`, for example, depending on how you've configured the State Categories table), and are what the "Category" base style and the per-category furigana visibility settings target.

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
