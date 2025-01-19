import { JPDBToken } from '@shared/jpdb/types';

export type Handle = {
  text: string;
  length: number;
  resolve: (tokens: JPDBToken[]) => void;
  reject: (e?: Error) => void;
};

export type Batch = {
  strings: string[];
  handles: Handle[];
};
