import { JPDBToken } from '@shared/jpdb';

export {};

declare global {
  interface Document {
    ajb?: {
      id: number;
    };
  }

  interface HTMLElement {
    ajbContext?: {
      token: JPDBToken;
      context: string;
      contextOffset: number;
    };
  }
}
