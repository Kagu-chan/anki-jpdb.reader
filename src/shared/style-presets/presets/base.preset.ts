import { ConfigurationSchema } from '@shared/configuration/types';
import { resolveColorRule } from '../color';

type BasePresetConfig = Pick<ConfigurationSchema, 'baseColor'>;

/**
 * `.jpdb-word` is always less specific than every per-state color rule (`.jpdb-word.known`,
 * `.jpdb-word.cat-known`, ...), so those still win the cascade regardless of injection order -
 * this only supplies a fallback for whatever a more specific rule doesn't set.
 */
export const basePreset = (config: BasePresetConfig): string =>
  resolveColorRule('.jpdb-word', config.baseColor);
