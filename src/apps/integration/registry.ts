import { JPDBCard, JPDBCardState } from '@shared/jpdb';
import { BatchController } from '../batches/batch-controller';
import { BaseParser } from '../parser/base.parser';
import { PopupManager } from '../popup/popup-manager';
import { SequenceManager } from '../sequence/sequence-manager';
import { EventCollection } from './event-collection';
import { HostEvaluator } from './host-evaluator';

export class Registry {
  public static readonly isMainFrame = window === window.top;

  public static readonly events = new EventCollection();
  public static readonly hostEvaluator = new HostEvaluator();

  public static readonly parsers: BaseParser[] = [];
  public static readonly batchController = new BatchController();
  public static readonly sequenceManager = new SequenceManager();
  public static popupManager?: PopupManager;

  private static readonly cards = new Map<string, JPDBCard>();

  public static addCard(card: JPDBCard): void {
    this.cards.set(`${card.vid}/${card.sid}`, card);
  }

  public static updateCard(vid: number, sid: number, state: JPDBCardState[]): void {
    const card = this.getCard(vid, sid);

    if (!card) {
      return;
    }

    card.cardState = state;

    document.querySelectorAll(`[vid="${vid}"][sid="${sid}"]`).forEach((element) => {
      const classes = Array.from(element.classList).filter((x) => x.startsWith('jpdb-'));

      classes.push(...state);
      element.classList.value = classes.join(' ');
    });
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
