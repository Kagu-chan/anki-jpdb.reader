import { ConfigurationSchema, FuriganaVisibility } from '@shared/configuration/types';
import { css } from '../css';

type FuriganaConfig = Pick<
  ConfigurationSchema,
  | 'furiganaUnminedWords'
  | 'furiganaNewWords'
  | 'furiganaLearningWords'
  | 'furiganaKnownWords'
  | 'skipFurigana'
>;

const CATEGORY_CONFIG_KEYS = {
  'cat-unmined': 'furiganaUnminedWords',
  'cat-new': 'furiganaNewWords',
  'cat-learning': 'furiganaLearningWords',
  'cat-known': 'furiganaKnownWords',
} as const;

const furiganaRule = (categoryClass: string, visibility: FuriganaVisibility): string => {
  if (visibility === FuriganaVisibility.ALWAYS) {
    return '';
  }

  if (visibility === FuriganaVisibility.NEVER) {
    return css`
      .jpdb-word.${categoryClass} rt {
        opacity: 0;
      }
    `;
  }

  return css`
    .jpdb-word.${categoryClass} rt {
      opacity: 0;
    }

    .jpdb-word.${categoryClass}:hover rt {
      opacity: 1;
    }
  `;
};

export const furiganaPreset = (config: FuriganaConfig): string => {
  if (config.skipFurigana) {
    return '';
  }

  return Object.entries(CATEGORY_CONFIG_KEYS)
    .map(([categoryClass, configKey]) => furiganaRule(categoryClass, config[configKey]))
    .filter(Boolean)
    .join('\n');
};
