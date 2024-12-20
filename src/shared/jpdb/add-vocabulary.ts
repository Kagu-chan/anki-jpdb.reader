import { JPDBAddVocabularyRequest, JPDBRequestOptions } from './api.types';
import { request } from './request';
import { JPDBSpecialDeckNames } from './types';

export const addVocabulary = async (
  id: number | JPDBSpecialDeckNames,
  vid: number,
  sid: number,
  options?: JPDBRequestOptions,
): Promise<void> => {
  const payload: JPDBAddVocabularyRequest = {
    id,
    vocabulary: [[vid, sid]],
  };

  await request('deck/add-vocabulary', payload, options);
};
