import { BaseStylingMode, ConfigurationSchema } from '@shared/configuration/types';
import { resolveColorRule } from '../color';
import { getJpdbColorRules, JpdbColorRulesConfig } from '../jpdb-color-rules';

type JpdbPresetConfig = JpdbColorRulesConfig &
  Pick<ConfigurationSchema, 'baseStylingMode' | 'stylePresets'>;

export const jpdbPreset = (config: JpdbPresetConfig): string => {
  if (config.baseStylingMode !== BaseStylingMode.JPDB) {
    return '';
  }

  const plainKnownWords = config.stylePresets.includes('plain-known-words');

  return getJpdbColorRules(config, plainKnownWords)
    .map(([selector, color]) => resolveColorRule(selector, color))
    .filter(Boolean)
    .join('\n');
};
