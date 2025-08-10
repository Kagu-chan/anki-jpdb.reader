type JPDBMeaning = {
  glosses: string[];
  partOfSpeech: string[];
};

type JPDBFuriganaEntry = string | [spelling: string, reading: string];
type JPDBFurigana = JPDBFuriganaEntry[] | null;

export type JPDBRuby = {
  text: string;
  start: number;
  end: number;
  length: number;
};

export type JPDBParseResult = {
  tokens: JPDBRawToken[][];
  vocabulary: JPDBRawVocabulary[];
};

export type JPDBDeck = {
  id?: string | number;
  name?: string;
  vocabulary_count?: number;
  word_count?: number;
  vocabulary_known_coverage?: number;
  vocabulary_in_progress_coverage?: number;
  is_built_in?: boolean;
};

export type JPDBSpecialDeckNames = 'blacklist' | 'never-forget' | 'forq';
export type JPDBGrade = 'nothing' | 'something' | 'hard' | 'okay' | 'easy' | 'fail' | 'pass';
export enum JPDBCardState {
  NEW = 'new',
  LEARNING = 'learning',
  KNOWN = 'known',
  DUE = 'due',
  FAILED = 'failed',
  LOCKED = 'locked',
  NEVER_FORGET = 'never-forget',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
  REDUNDANT = 'redundant',
  NOT_IN_DECK = 'not-in-deck',
}

export type JPDBRawVocabulary = [
  vid: number,
  sid: number,
  rid: number,
  spelling: string,
  reading: string,
  frequency_rank: number,
  part_of_speech: string[],
  meanings_chunks: string[][],
  meanings_part_of_speech: string[][],
  card_state: JPDBCardState[],
  pitch_accent: string[] | null,
];
export type JPDBCard = {
  vid: number;
  sid: number;
  rid: number;
  spelling: string;
  reading: string;
  frequencyRank: number;
  partOfSpeech: string[];
  meanings: JPDBMeaning[];
  cardState: JPDBCardState[];
  pitchAccent: string[];
  wordWithReading: string | null;
};
export type JPDBRawToken = [
  vocabularyIndex: number,
  position: number,
  length: number,
  furigana: JPDBFurigana,
];

export type JPDBToken = {
  card: JPDBCard;
  start: number;
  end: number;
  length: number;
  rubies: JPDBRuby[];
  pitchClass: string;
  sentence?: string;
};
