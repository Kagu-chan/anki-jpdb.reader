import { getConfiguration, ConfigurationSchema, Keybind } from '@shared/configuration';
import { JPDBCard, JPDBGrade } from '@shared/jpdb';
import { onBroadcastMessage, sendToBackground } from '@shared/messages';
import { FilterKeys } from '@shared/types';
import { KeybindManager } from '../integration/keybind-manager';
import { Registry } from '../integration/registry';
import { MiningActions } from './mining-actions';

export class GradingActions {
  private _keyManager = new KeybindManager([]);
  private _card?: JPDBCard;

  constructor(private _miningActions: MiningActions) {
    const { events } = Registry;

    onBroadcastMessage('configurationUpdated', () => this.updateGradingKeys(), true);

    events.on('jpdbReviewNothing', () => this.reviewCard('nothing'));
    events.on('jpdbReviewSomething', () => this.reviewCard('something'));
    events.on('jpdbReviewHard', () => this.reviewCard('hard'));
    events.on('jpdbReviewOkay', () => this.reviewCard('okay'));
    events.on('jpdbReviewEasy', () => this.reviewCard('easy'));
    events.on('jpdbReviewFail', () => this.reviewCard('fail'));
    events.on('jpdbReviewPass', () => this.reviewCard('pass'));
    events.on('jpdbRotateForward', () => this.rotateFlag(true));
    events.on('jpdbRotateBackward', () => this.rotateFlag(false));
  }

  public activate(context: HTMLElement): void {
    this._card = Registry.getCardFromElement(context);
    this._keyManager.activate();
  }

  public deactivate(): void {
    this._card = undefined;
    this._keyManager.deactivate();
  }

  private async updateGradingKeys(): Promise<void> {
    const isAnkiEnabled = await getConfiguration('enableAnkiIntegration');
    const useTwoButtonGradingSystem = await getConfiguration('jpdbUseTwoGrades');
    const useFlagRotation = await getConfiguration('jpdbRotateFlags');
    const disableReviews = await getConfiguration('jpdbDisableReviews');
    const fiveGradeKeys: FilterKeys<ConfigurationSchema, Keybind>[] = [
      'jpdbReviewNothing',
      'jpdbReviewSomething',
      'jpdbReviewHard',
      'jpdbReviewOkay',
      'jpdbReviewEasy',
    ];
    const twoGradeKeys: FilterKeys<ConfigurationSchema, Keybind>[] = [
      'jpdbReviewFail',
      'jpdbReviewPass',
    ];
    const flagKeys: FilterKeys<ConfigurationSchema, Keybind>[] = [
      'jpdbRotateForward',
      'jpdbRotateBackward',
    ];

    if (isAnkiEnabled) {
      return this._keyManager.removeKeys([...fiveGradeKeys, ...twoGradeKeys]);
    }

    if (useFlagRotation) {
      this._keyManager.addKeys(flagKeys, true);
    } else {
      this._keyManager.removeKeys(flagKeys, true);
    }

    if (disableReviews) {
      return this._keyManager.removeKeys([...fiveGradeKeys, ...twoGradeKeys]);
    }

    if (useTwoButtonGradingSystem) {
      this._keyManager.removeKeys(fiveGradeKeys, true);
      await this._keyManager.addKeys(twoGradeKeys);

      return;
    }

    this._keyManager.addKeys(fiveGradeKeys, true);
    await this._keyManager.removeKeys(twoGradeKeys);
  }

  private async reviewCard(grade: JPDBGrade): Promise<void> {
    if (!this._card) {
      return;
    }

    const { vid, sid } = this._card;

    await sendToBackground('gradeCard', vid, sid, grade);
    await sendToBackground('updateCardState', vid, sid);
  }

  private async rotateFlag(forward: boolean): Promise<void> {
    if (!this._card) {
      return;
    }

    const state = this._card.cardState ?? [];
    const nf = state.includes('never-forget');
    const bl = state.includes('blacklisted');

    this._miningActions.suspendUpdateWordStates();

    if (forward) {
      if (!nf && !bl) {
        await this._miningActions.setDecks({ neverForget: true });
      }

      if (nf && !bl) {
        await this._miningActions.setDecks({ neverForget: false, blacklist: true });
      }

      if (!nf && bl) {
        await this._miningActions.setDecks({ blacklist: false });
      }

      return this._miningActions.resumeUpdateWordStates();
    }

    if (!nf && !bl) {
      await this._miningActions.setDecks({ blacklist: true });
    }

    if (nf && !bl) {
      await this._miningActions.setDecks({ neverForget: false });
    }

    if (!nf && bl) {
      await this._miningActions.setDecks({ blacklist: false, neverForget: true });
    }

    this._miningActions.resumeUpdateWordStates();
  }
}