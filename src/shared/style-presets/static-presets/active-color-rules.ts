import { BaseStylingMode, PresetColor } from '@shared/configuration/types';
import { StylePresetCssConfig } from '../types';

export const getActiveColorRules = (config: StylePresetCssConfig): [string, PresetColor][] => {
  const rules: [string, PresetColor][] = [];

  if (config.baseStylingMode === BaseStylingMode.JPDB) {
    rules.push(
      ['.jpdb-word.locked', config.jpdbColorLocked],
      ['.jpdb-word.suspended', config.jpdbColorSuspended],
      ['.jpdb-word.blacklisted', config.jpdbColorBlacklisted],
      ['.jpdb-word.never-forget', config.jpdbColorNeverForget],
      ['.jpdb-word.not-in-deck', config.jpdbColorNotInDeck],
      ['.jpdb-word.new', config.jpdbColorNew],
      ['.jpdb-word.learning', config.jpdbColorLearning],
      ['.jpdb-word.known', config.jpdbColorKnown],
      ['.jpdb-word.due', config.jpdbColorDue],
      ['.jpdb-word.failed', config.jpdbColorFailed],
    );
  }

  if (config.baseStylingMode === BaseStylingMode.CATEGORY) {
    rules.push(
      ['.jpdb-word.cat-unmined', config.categoryColorUnmined],
      ['.jpdb-word.cat-new', config.categoryColorNew],
      ['.jpdb-word.cat-learning', config.categoryColorLearning],
      ['.jpdb-word.cat-known', config.categoryColorKnown],
    );
  }

  if (config.highlightMisparsed) {
    rules.push(['.jpdb-word.misparsed', config.misparsedColor]);
  }

  if (config.highlightPitchAccent) {
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
