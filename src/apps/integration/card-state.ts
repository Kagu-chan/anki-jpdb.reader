import { JPDBCardState, WordStateCategory } from '@shared/jpdb/types';
import { Registry } from './registry';

export class CardStates {
  public getCategories(states: JPDBCardState[]): WordStateCategory[] {
    const categories = Registry.textHighlighterOptions.stateCategories;

    return [...new Set(states.map((state) => categories[state]).filter((c) => c !== undefined))];
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
}
