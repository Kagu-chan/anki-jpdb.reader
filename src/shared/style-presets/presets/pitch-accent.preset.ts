import { ConfigurationSchema, PresetColor } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

type PitchAccentPresetConfig = Pick<
  ConfigurationSchema,
  | 'generatePitch'
  | 'highlightPitchAccent'
  | 'pitchColorHeiban'
  | 'pitchColorAtamadaka'
  | 'pitchColorNakadaka'
  | 'pitchColorOdaka'
  | 'pitchColorKifuku'
>;

export const pitchAccentPreset = (config: PitchAccentPresetConfig): string => {
  if (!config.generatePitch || !config.highlightPitchAccent) {
    return '';
  }

  const rules: [string, PresetColor][] = [
    ['.jpdb-word.heiban', config.pitchColorHeiban],
    ['.jpdb-word.atamadaka', config.pitchColorAtamadaka],
    ['.jpdb-word.nakadaka', config.pitchColorNakadaka],
    ['.jpdb-word.odaka', config.pitchColorOdaka],
    ['.jpdb-word.kifuku', config.pitchColorKifuku],
  ];

  return rules
    .map(([selector, color]) => resolveColorRule(selector, color))
    .filter(Boolean)
    .join('\n');
};
