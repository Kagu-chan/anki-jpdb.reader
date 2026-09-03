// The actual effect (dropping the known-word color rule) happens at the source in
// `jpdb.preset.ts` / `category.preset.ts` / `active-color-rules.ts`, keyed off `stylePresets`
// including this preset's id - nothing needs to be injected here.
export const plainKnownWordsPreset = (): string => '';
