import { ConfigurationSchema } from '@shared/configuration/types';
import { STATIC_PRESETS } from './static-presets';
import { StylePresetCssConfig } from './types';

export type InjectStaticPresetsConfig = Pick<ConfigurationSchema, 'enableStylePresets'> &
  StylePresetCssConfig;

export const injectStaticPresets = (config: InjectStaticPresetsConfig): string => {
  if (!config.enableStylePresets) {
    return '';
  }

  return STATIC_PRESETS.filter((preset) => config.stylePresets.includes(preset.id))
    .map((preset) => preset.css(config))
    .filter(Boolean)
    .join('\n');
};
