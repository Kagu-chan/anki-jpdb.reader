import { BaseStylingMode, ConfigurationSchema, PresetColor } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

type CategoryPresetConfig = Pick<
  ConfigurationSchema,
  | 'baseStylingMode'
  | 'stylePresets'
  | 'categoryColorUnmined'
  | 'categoryColorNew'
  | 'categoryColorLearning'
  | 'categoryColorKnown'
>;

export const categoryPreset = (config: CategoryPresetConfig): string => {
  if (config.baseStylingMode !== BaseStylingMode.CATEGORY) {
    return '';
  }

  const plainKnownWords = config.stylePresets.includes('plain-known-words');

  const rules: [string, PresetColor][] = [
    ['.jpdb-word.cat-unmined', config.categoryColorUnmined],
    ['.jpdb-word.cat-new', config.categoryColorNew],
    ['.jpdb-word.cat-learning', config.categoryColorLearning],
    ['.jpdb-word.cat-known', config.categoryColorKnown],
  ];

  return rules
    .filter(([selector]) => !(plainKnownWords && selector === '.jpdb-word.cat-known'))
    .map(([selector, color]) => resolveColorRule(selector, color))
    .filter(Boolean)
    .join('\n');
};
