import { JPDBDeck, JPDBDeckFields, JPDBRequestOptions } from './api.types';
import { request } from './request';

export const listUserDecks = (
  fields: JPDBDeckFields[],
  options?: JPDBRequestOptions,
): Promise<JPDBDeck[]> =>
  request('list-user-decks', { fields }, options).then(({ decks }) =>
    decks.map((deck) =>
      deck.reduce((acc, value, index) => ({ ...acc, [fields[index]]: value }), {} as JPDBDeck),
    ),
  );
