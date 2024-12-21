import { getConfiguration, ConfigurationSchema, Keybind } from '@shared/configuration';
import { JPDBGrade } from '@shared/jpdb';
import { onBroadcastMessage, sendToBackground } from '@shared/messages';
import { FilterKeys } from '@shared/types';
import { IntegrationScript } from '../integration-script';
import { KeybindManager } from '../keybind-manager';
import { MiningActions } from './mining-actions';

export class GradingActions extends IntegrationScript {
  private _keyManager: KeybindManager;
  private _currentContext?: HTMLElement;

  constructor(private _miningActions: MiningActions) {
    super();

    this._keyManager = new KeybindManager([]);

    this.installEvents();

    onBroadcastMessage('configurationUpdated', () => this.updateGradingKeys());
    void this.updateGradingKeys();
  }

  public activate(context: HTMLElement): void {
    this._currentContext = context;
    this._keyManager.activate();
  }

  public deactivate(): void {
    this._currentContext = undefined;
    this._keyManager.deactivate();
  }

  private installEvents(): void {
    this.on('jpdbReviewNothing', () => this.reviewCard('nothing'));
    this.on('jpdbReviewSomething', () => this.reviewCard('something'));
    this.on('jpdbReviewHard', () => this.reviewCard('hard'));
    this.on('jpdbReviewOkay', () => this.reviewCard('okay'));
    this.on('jpdbReviewEasy', () => this.reviewCard('easy'));
    this.on('jpdbReviewFail', () => this.reviewCard('fail'));
    this.on('jpdbReviewPass', () => this.reviewCard('pass'));

    this.on('jpdbRotateForward', () => this.rotateFlag(true));
    this.on('jpdbRotateBackward', () => this.rotateFlag(false));
  }

  private async updateGradingKeys(): Promise<void> {
    const isAnkiEnabled = await getConfiguration('enableAnkiIntegration');
    const useTwoButtonGradingSystem = await getConfiguration('jpdbUseTwoGrades');
    const useFlagRotation = await getConfiguration('jpdbRotateFlags');

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

    if (useTwoButtonGradingSystem) {
      this._keyManager.removeKeys(fiveGradeKeys, true);
      await this._keyManager.addKeys(twoGradeKeys);

      return;
    }

    this._keyManager.addKeys(fiveGradeKeys, true);
    await this._keyManager.removeKeys(twoGradeKeys);
  }

  private async reviewCard(grade: JPDBGrade): Promise<void> {
    const { token } = this._currentContext?.ajbContext ?? {};

    if (!token) {
      return;
    }

    const { vid, sid } = token.card;

    await sendToBackground('gradeCard', vid, sid, grade);
    await sendToBackground('updateCardState', vid, sid);
  }

  private async rotateFlag(forward: boolean): Promise<void> {
    const { token } = this._currentContext?.ajbContext ?? {};

    if (!token) {
      return;
    }

    const state = token.card.cardState ?? [];

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
