import { JPDBRequestOptions } from './api.types';
import { request } from './request';
import { JPDBCardState } from './types';

export const getCardState = async (
  vid: number,
  sid: number,
  options?: JPDBRequestOptions,
): Promise<JPDBCardState[]> => {
  const result = await request(
    'lookup-vocabulary',
    {
      list: [[vid, sid]],
      fields: ['card_state'],
    },
    options,
  );
  const [firstWord] = result.vocabulary_info;
  const [firstField] = firstWord;

  return firstField?.length ? firstField : ['not-in-deck'];
};
