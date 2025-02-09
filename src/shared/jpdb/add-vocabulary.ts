import { JPDBAddVocabularyRequest, JPDBRequestOptions } from './api.types';
import { request } from './request';
import { requestByUrl } from './request-by-url';
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

  if (id === 'forq') {
    return await requestByUrl(
      undefined,
      'prioritize',
      {
        v: vid,
        s: sid,
        origin: '/',
      },
      options,
    );
  }

  await request('deck/add-vocabulary', payload, options);
};
