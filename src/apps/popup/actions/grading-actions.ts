import { JPDBCard, JPDBGrade } from '@shared/jpdb/types';
import { KeybindManager } from '../../integration/keybind-manager';
import { Registry } from '../../integration/registry';
import { GradingController } from './grading-controller';

/**
 * Handles keybinds for grading cards.
 */
export class GradingActions {
  private _keyManager = new KeybindManager([
    'jpdbReviewNothing',
    'jpdbReviewSomething',
    'jpdbReviewHard',
    'jpdbReviewOkay',
    'jpdbReviewEasy',
    'jpdbReviewFail',
    'jpdbReviewPass',
  ]);
  private _card?: JPDBCard;

  constructor(private _controller: GradingController) {
    const { events } = Registry;

    events.on('jpdbReviewNothing', () => this.reviewCard('nothing'));
    events.on('jpdbReviewSomething', () => this.reviewCard('something'));
    events.on('jpdbReviewHard', () => this.reviewCard('hard'));
    events.on('jpdbReviewOkay', () => this.reviewCard('okay'));
    events.on('jpdbReviewEasy', () => this.reviewCard('easy'));
    events.on('jpdbReviewFail', () => this.reviewCard('fail'));
    events.on('jpdbReviewPass', () => this.reviewCard('pass'));
  }

  public activate(context: HTMLElement): void {
    this._card = Registry.getCardFromElement(context);
    this._keyManager.activate();
  }

  public deactivate(): void {
    this._card = undefined;
    this._keyManager.deactivate();
  }

  private reviewCard(grade: JPDBGrade): void {
    if (!this._card) {
      return;
    }

    this._controller.gradeCard(this._card, grade);
  }
}
