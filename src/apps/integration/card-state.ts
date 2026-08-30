import { JPDBCard, JPDBCardState, WordStateCategory } from '@shared/jpdb/types';
import { Registry } from './registry';

export class CardStates {
  public getCategories(states: JPDBCardState[]): WordStateCategory[] {
    const categories = Registry.textHighlighterOptions.stateCategories;

    return [...new Set(states.map((state) => categories[state]).filter((c) => c !== undefined))];
  }

  public isUnmined(states: JPDBCardState[]): boolean {
    return this.getCategories(states).includes(WordStateCategory.UNMINED);
  }

  public isNew(states: JPDBCardState[]): boolean {
    return this.getCategories(states).includes(WordStateCategory.NEW);
  }

  public isLearning(states: JPDBCardState[]): boolean {
    return this.getCategories(states).includes(WordStateCategory.LEARNING);
  }

  public isKnown(states: JPDBCardState[]): boolean {
    return this.getCategories(states).includes(WordStateCategory.KNOWN);
  }

  public isFrequent({ frequencyRank, cardState }: JPDBCard): boolean {
    const { topXMark, topXMarkCount, topXMarkAll } = Registry.textHighlighterOptions;

    if (!topXMark) {
      return false;
    }

    if (!frequencyRank || frequencyRank > topXMarkCount) {
      return false;
    }

    return topXMarkAll || this.isUnmined(cardState);
  }
}
