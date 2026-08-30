import { JPDBCard, JPDBCardState } from '@shared/jpdb/types';
import { BatchController } from '../batches/batch-controller';
import { BaseParser } from '../parser/base.parser';
import { PopupManager } from '../popup/popup-manager';
import { SequenceManager } from '../sequence/sequence-manager';
import { TextHighlighterOptions } from '../text-highlighter/text-highlighter-options';
import { CardStates } from './card-state';
import { EventCollection } from './event-collection';
import { HostEvaluator } from './host-evaluator';
import { SentenceManager } from './sentence-manager';

export class Registry {
  public static readonly isMainFrame = window === window.top;

  public static readonly events = new EventCollection();
  public static readonly hostEvaluator = new HostEvaluator();

  public static readonly parsers: BaseParser[] = [];
  public static readonly batchController = new BatchController();
  public static readonly sequenceManager = new SequenceManager();
  public static readonly sentenceManager = new SentenceManager();
  public static readonly textHighlighterOptions = new TextHighlighterOptions();
  public static readonly cardStates = new CardStates();

  public static skipTouchEvents = false;
  public static popupManager?: PopupManager;

  private static readonly cards = new Map<string, JPDBCard>();

  public static addCard(card: JPDBCard): void {
    this.cards.set(`${card.vid}/${card.sid}`, card);
  }

  public static updateCard(vid: number, sid: number, state: JPDBCardState[]): void {
    const card = this.getCard(vid, sid);
    const managedStates = Object.values(JPDBCardState);
    const categories = this.cardStates.getCategories(state).map((category) => `cat-${category}`);

    if (!card) {
      return;
    }

    card.cardState = state;

    document.querySelectorAll(`[vid="${vid}"][sid="${sid}"]`).forEach((element) => {
      const classes = Array.from(element.classList).filter(
        (x) => !managedStates.includes(x as JPDBCardState) && !x.startsWith('cat-'),
      );

      classes.push(...state, ...categories);
      element.classList.value = classes.join(' ');

      if (this.cardStates.isFrequent(card)) {
        element.classList.add('frequent');
      } else {
        element.classList.remove('frequent');
      }
    });

    this.sentenceManager.updateCardState(vid, sid, state);
  }

  public static getCard(vid: number | string, sid: number | string): JPDBCard | undefined {
    return this.cards.get(`${vid}/${sid}`);
  }

  public static getCardFromElement(element: Element): JPDBCard | undefined {
    const vid = element.getAttribute('vid');
    const sid = element.getAttribute('sid');

    if (!vid || !sid) {
      return;
    }

    return this.getCard(vid, sid);
  }
}
