import { JPDBCardState, LabeledCardState } from '@shared/jpdb/types';
import { CheckboxListInput } from './lib/checkbox-list.input';

const LABELED_CARD_STATES: LabeledCardState[] = [
  {
    id: JPDBCardState.NOT_IN_DECK,
    name: 'Not in Deck',
    description: 'The card is not currently in any deck.',
  },
  {
    id: JPDBCardState.NEW,
    name: 'New',
    description: "Card is in one of your decks and you've never reviewed it.",
  },
  {
    id: JPDBCardState.LEARNING,
    name: 'Learning',
    description:
      'Card was positively reviewed and is waiting until its review interval lapses; its level is not yet high enough to be treated as known.',
  },
  {
    id: JPDBCardState.KNOWN,
    name: 'Known',
    description:
      'Card was positively reviewed and is waiting until its review interval lapses; its level is high enough to be treated as known.',
  },
  {
    id: JPDBCardState.DUE,
    name: 'Due',
    description:
      "Card was positively reviewed but its review interval has already lapsed so it's ready for another review.",
  },
  {
    id: JPDBCardState.FAILED,
    name: 'Failed',
    description:
      "Card was negatively reviewed and it's either waiting or ready for another review.",
  },
  {
    id: JPDBCardState.LOCKED,
    name: 'Locked',
    description:
      "One of card's dependencies is not fulfilled, or one of its dependencies was just reviewed.",
  },
  {
    id: JPDBCardState.NEVER_FORGET,
    name: 'Never forget',
    description: 'Card is permanently treated as known and will never appear in your reviews.',
  },
  {
    id: JPDBCardState.SUSPENDED,
    name: 'Suspended',
    description: 'Card will never appear in your reviews and will be treated as not known.',
  },
  {
    id: JPDBCardState.BLACKLISTED,
    name: 'Blacklisted',
    description:
      'Card will never appear in your reviews and will be treated just as if it has never existed in the first place.',
  },
  {
    id: JPDBCardState.REDUNDANT,
    name: 'Redundant',
    description:
      'Card is a variant of another card; it will never appear in your reviews, and its state will be derived from the variant to which it is submissive to.',
  },
];

export class HTMLNewStateInputElement extends CheckboxListInput<LabeledCardState> {
  protected allowInspect = false;
  protected invertList = false;

  protected getRows(): LabeledCardState[] {
    return LABELED_CARD_STATES;
  }
}
