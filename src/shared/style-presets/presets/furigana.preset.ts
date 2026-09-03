import { ConfigurationSchema, FuriganaVisibility } from '@shared/configuration/types';
import { css } from '../css';

type FuriganaConfig = Pick<
  ConfigurationSchema,
  | 'furiganaUnminedWords'
  | 'furiganaNewWords'
  | 'furiganaLearningWords'
  | 'furiganaKnownWords'
  | 'furiganaUnrelatedWords'
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
    return css`
      .jpdb-word.${categoryClass} rt {
        display: ruby-text;
        opacity: 1;
      }
    `;
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

/**
 * Covers furigana that isn't inside a `.jpdb-word` at all - native `<ruby>`/`<rt>` markup the
 * text-highlighter didn't touch. Selectors here are always less specific than the per-category
 * `.jpdb-word.cat-*` rules above, so classified words keep taking precedence regardless of order.
 */
const unrelatedFuriganaRule = (visibility: FuriganaVisibility): string => {
  if (visibility === FuriganaVisibility.UNSET) {
    return '';
  }

  if (visibility === FuriganaVisibility.ALWAYS) {
    return css`
      rt {
        display: ruby-text;
        opacity: 1;
      }
    `;
  }

  if (visibility === FuriganaVisibility.NEVER) {
    return css`
      rt {
        opacity: 0;
      }
    `;
  }

  return css`
    rt {
      opacity: 0;
    }

    ruby:hover rt {
      opacity: 1;
    }
  `;
};

export const furiganaPreset = (config: FuriganaConfig): string => {
  if (config.skipFurigana) {
    return '';
  }

  return [
    unrelatedFuriganaRule(config.furiganaUnrelatedWords),
    ...Object.entries(CATEGORY_CONFIG_KEYS).map(([categoryClass, configKey]) =>
      furiganaRule(categoryClass, config[configKey]),
    ),
  ]
    .filter(Boolean)
    .join('\n');
};
