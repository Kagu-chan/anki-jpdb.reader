import { hoverColorsPreset } from './static-presets/hover-colors.preset';
import { plainKnownWordsPreset } from './static-presets/plain-known-words.preset';
import { underlineColorsPreset } from './static-presets/underline-colors.preset';
import { StylePreset } from './types';

export const STATIC_PRESETS: StylePreset[] = [
  {
    id: 'underline-colors',
    name: 'Underline colors',
    description: 'Shows word state colors as an underline instead of coloring the text itself.',
    css: underlineColorsPreset,
  },
  {
    id: 'plain-known-words',
    name: 'Plain known words',
    description: 'Removes the base color highlight from known words so they read naturally.',
    css: plainKnownWordsPreset,
  },
  {
    id: 'hover-colors',
    name: 'Colors on hover',
    description: 'Hides all word state colors until you hover over the word.',
    css: hoverColorsPreset,
  },
];
