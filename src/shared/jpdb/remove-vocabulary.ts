import { JPDBRemoveVocabularyRequest, JPDBRequestOptions } from './api.types';
import { request } from './request';
import { JPDBSpecialDeckNames } from './types';

export const removeVocabulary = async (
  id: number | JPDBSpecialDeckNames,
  vid: number,
  sid: number,
  options?: JPDBRequestOptions,
): Promise<void> => {
  const payload: JPDBRemoveVocabularyRequest = {
    id,
    vocabulary: [[vid, sid]],
  };

  await request('deck/remove-vocabulary', payload, options);
};
