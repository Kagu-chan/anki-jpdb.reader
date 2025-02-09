import { JPDBRequestOptions } from './api.types';
import { request } from './request';

export const setCardSentence = (
  vid: number,
  sid: number,
  sentence: string,
  options?: JPDBRequestOptions,
): Promise<void> =>
  request(
    'set-card-sentence',
    {
      vid,
      sid,
      sentence,
    },
    options,
  );
