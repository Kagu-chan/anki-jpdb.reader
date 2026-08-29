import { ConfigurationSchema } from '@shared/configuration/types';
import { categoryPreset } from './presets/category.preset';
import { furiganaPreset } from './presets/furigana.preset';
import { jpdbPreset } from './presets/jpdb.preset';
import { misparsedPreset } from './presets/misparsed.preset';
import { pitchAccentPreset } from './presets/pitch-accent.preset';

export type InjectConditionalCssConfig = Pick<
  ConfigurationSchema,
  | 'enableStylePresets'
  | 'baseStylingMode'
  | 'jpdbColorLocked'
  | 'jpdbColorSuspended'
  | 'jpdbColorBlacklisted'
  | 'jpdbColorNeverForget'
  | 'jpdbColorNotInDeck'
  | 'jpdbColorNew'
  | 'jpdbColorLearning'
  | 'jpdbColorKnown'
  | 'jpdbColorDue'
  | 'jpdbColorFailed'
  | 'categoryColorUnmined'
  | 'categoryColorNew'
  | 'categoryColorLearning'
  | 'categoryColorKnown'
  | 'highlightMisparsed'
  | 'misparsedColor'
  | 'highlightPitchAccent'
  | 'pitchColorHeiban'
  | 'pitchColorAtamadaka'
  | 'pitchColorNakadaka'
  | 'pitchColorOdaka'
  | 'pitchColorKifuku'
  | 'furiganaUnminedWords'
  | 'furiganaNewWords'
  | 'furiganaLearningWords'
  | 'furiganaKnownWords'
  | 'skipFurigana'
>;

const CONDITIONAL_PRESETS: ((config: InjectConditionalCssConfig) => string)[] = [
  jpdbPreset,
  categoryPreset,
  misparsedPreset,
  pitchAccentPreset,
  furiganaPreset,
];

export const injectConditionalCss = (config: InjectConditionalCssConfig): string => {
  if (!config.enableStylePresets) {
    return '';
  }

  return CONDITIONAL_PRESETS.map((preset) => preset(config))
    .filter(Boolean)
    .join('\n');
};
