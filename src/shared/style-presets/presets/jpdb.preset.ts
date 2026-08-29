import { BaseStylingMode, ConfigurationSchema, PresetColor } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

type JpdbPresetConfig = Pick<
  ConfigurationSchema,
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
>;

export const jpdbPreset = (config: JpdbPresetConfig): string => {
  if (config.baseStylingMode !== BaseStylingMode.JPDB) {
    return '';
  }

  const rules: [string, PresetColor][] = [
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
  ];

  return rules
    .map(([selector, color]) => resolveColorRule(selector, color))
    .filter(Boolean)
    .join('\n');
};
