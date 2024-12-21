import { Empty } from '@shared/types';
import { JPDBCardState, JPDBParseResult, JPDBSpecialDeckNames } from './types';

type JPDBFieldNames =
  | 'vid'
  | 'sid'
  | 'rid'
  | 'spelling'
  | 'reading'
  | 'frequency_rank'
  | 'part_of_speech'
  | 'meanings_chunks'
  | 'meanings_part_of_speech'
  | 'card_state'
  | 'pitch_accent';
type JPDBTokenNames = 'vocabulary_index' | 'position' | 'length' | 'furigana';
type JPDBVidSidTuple = [vid: number, sid: number][];
type JPDBFieldList = JPDBFieldNames[];
type JPDBTokenList = JPDBTokenNames[];

type JPDBPositionLengthEncoding = 'utf16';

type JPDBParseRequest = {
  text: string[];
  position_length_encoding: JPDBPositionLengthEncoding;
  token_fields: JPDBTokenList;
  vocabulary_fields: JPDBFieldList;
};

type JPDBLookupVocabularyRequest = {
  list: JPDBVidSidTuple;
  fields: JPDBFieldList;
};
type JPDBLookupVocabularyResult = {
  vocabulary_info: [[JPDBCardState[]]];
};

type JPDBListUserDecksRequest = {
  fields: JPDBDeckFields[];
};
type JPDBListUserDecksResult = {
  decks: Exclude<JPDBDeck[keyof JPDBDeck], undefined>[][];
};

export type JPDBAddVocabularyRequest = {
  id: number | JPDBSpecialDeckNames;
  vocabulary: JPDBVidSidTuple;
  occurences?: number[];
  replace_existing_occurences?: boolean;
  ignore_unknown?: boolean;
};
export type JPDBRemoveVocabularyRequest = Pick<JPDBAddVocabularyRequest, 'id' | 'vocabulary'>;

export type JPDBDeck = {
  id?: string | number;
  name?: string;
  vocabulary_count?: number;
  word_count?: number;
  vocabulary_known_coverage?: number;
  vocabulary_in_progress_coverage?: number;
  is_built_in?: boolean;
};
export type JPDBDeckFields = keyof JPDBDeck;

export type JPDBRequestOptions = {
  apiToken?: string;
};

export type JPDBErrorResponse = {
  error_message: string;
};
export type JPDBEndpoints = {
  ping: [Empty, void];
  parse: [JPDBParseRequest, JPDBParseResult];
  'lookup-vocabulary': [JPDBLookupVocabularyRequest, JPDBLookupVocabularyResult];
  'list-user-decks': [JPDBListUserDecksRequest, JPDBListUserDecksResult];
  'deck/add-vocabulary': [JPDBAddVocabularyRequest, void];
  'deck/remove-vocabulary': [JPDBRemoveVocabularyRequest, void];
};
