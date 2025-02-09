import { JPDBRemoveVocabularyRequest, JPDBRequestOptions } from './api.types';
import { request } from './request';
import { requestByUrl } from './request-by-url';
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

  if (id === 'forq') {
    return await requestByUrl(
      undefined,
      'deprioritize',
      {
        v: vid,
        s: sid,
        origin: '/',
      },
      options,
    );
  }

  await request('deck/remove-vocabulary', payload, options);
};
