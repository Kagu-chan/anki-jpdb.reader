import { BaseStylingMode, PresetColor } from '@shared/configuration/types';
import { getJpdbColorRules } from '../jpdb-color-rules';
import { StylePresetCssConfig } from '../types';

export const getActiveColorRules = (config: StylePresetCssConfig): [string, PresetColor][] => {
  const rules: [string, PresetColor][] = [['.jpdb-word', config.baseColor]];
  const plainKnownWords = config.stylePresets.includes('plain-known-words');

  if (config.baseStylingMode === BaseStylingMode.JPDB) {
    rules.push(...getJpdbColorRules(config, plainKnownWords));
  }

  if (config.baseStylingMode === BaseStylingMode.CATEGORY) {
    rules.push(
      ['.jpdb-word.cat-unmined', config.categoryColorUnmined],
      ['.jpdb-word.cat-new', config.categoryColorNew],
      ['.jpdb-word.cat-learning', config.categoryColorLearning],
    );

    if (!plainKnownWords) {
      rules.push(['.jpdb-word.cat-known', config.categoryColorKnown]);
    }
  }

  if (config.highlightMisparsed) {
    rules.push(['.jpdb-word.misparsed', config.misparsedColor]);
  }

  if (config.generatePitch && config.highlightPitchAccent) {
    rules.push(
      ['.jpdb-word.heiban', config.pitchColorHeiban],
      ['.jpdb-word.atamadaka', config.pitchColorAtamadaka],
      ['.jpdb-word.nakadaka', config.pitchColorNakadaka],
      ['.jpdb-word.odaka', config.pitchColorOdaka],
      ['.jpdb-word.kifuku', config.pitchColorKifuku],
    );
  }

  if (config.topXMark) {
    rules.push(['.jpdb-word.frequent', config.frequentColor]);
  }

  if (config.iPlus1Mark) {
    rules.push(['.jpdb-word.i-plus-one', config.iPlusOneColor]);
  }

  return rules;
};
