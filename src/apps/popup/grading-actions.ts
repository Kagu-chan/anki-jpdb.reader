import { getConfiguration } from '@shared/configuration/get-configuration';
import { ConfigurationSchema, Keybinds } from '@shared/configuration/types';
import { JPDBCard, JPDBGrade } from '@shared/jpdb/types';
import { GradeCardCommand } from '@shared/messages/background/grade-card.command';
import { UpdateCardStateCommand } from '@shared/messages/background/update-card-state.command';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { FilterKeys } from '@shared/types';
import { KeybindManager } from '../integration/keybind-manager';
import { Registry } from '../integration/registry';
import { MiningActions } from './mining-actions';

export class GradingActions {
  private _keyManager = new KeybindManager([]);
  private _card?: JPDBCard;

  private _rotateCycle = false;
  private _cycleNeverForget = false;
  private _cycleBlacklist = false;
  private _cycleSuspended = false;

  constructor(private _miningActions: MiningActions) {
    const { events } = Registry;

    onBroadcastMessage(
      'configurationUpdated',
      async (): Promise<void> => {
        await this.updateGradingKeys();

        this._rotateCycle = await getConfiguration('jpdbRotateCycle', true);
        this._cycleNeverForget = await getConfiguration('jpdbCycleNeverForget', true);
        this._cycleBlacklist = await getConfiguration('jpdbCycleBlacklist', true);
        this._cycleSuspended = await getConfiguration('jpdbCycleSuspended', true);
      },
      true,
    );

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
    const isAnkiEnabled = await getConfiguration('enableAnkiIntegration', true);
    const useTwoButtonGradingSystem = await getConfiguration('jpdbUseTwoGrades', true);
    const useFlagRotation = await getConfiguration('jpdbRotateFlags', true);
    const disableReviews = await getConfiguration('jpdbDisableReviews', true);
    const fiveGradeKeys: FilterKeys<ConfigurationSchema, Keybinds>[] = [
      'jpdbReviewNothing',
      'jpdbReviewSomething',
      'jpdbReviewHard',
      'jpdbReviewOkay',
      'jpdbReviewEasy',
    ];
    const twoGradeKeys: FilterKeys<ConfigurationSchema, Keybinds>[] = [
      'jpdbReviewFail',
      'jpdbReviewPass',
    ];
    const flagKeys: FilterKeys<ConfigurationSchema, Keybinds>[] = [
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

    await new GradeCardCommand(vid, sid, grade).call();
    await new UpdateCardStateCommand(vid, sid).call();
  }

  private async rotateFlag(forward: boolean): Promise<void> {
    if (!this._card) {
      return;
    }

    // get the current card state and translate it into a flag
    const state = this._card.cardState ?? [];
    const lookupState = state.includes('never-forget')
      ? 'neverForget'
      : state.includes('blacklisted')
        ? 'blacklist'
        : state.includes('suspended')
          ? 'suspend'
          : undefined;

    // Build a list of valid flags to rotate through
    const rotateArray = [
      this._cycleNeverForget && 'neverForget',
      this._cycleBlacklist && 'blacklist',
      this._cycleSuspended && 'suspend',
    ].filter(Boolean) as (string | undefined)[];

    // Find the current index of the card state in the rotate array
    const currentIndex = rotateArray.indexOf(lookupState);

    let newIndex: number;

    // If the index is -1, the newIndex will be 0 if rotating forward, or the last index if rotating backward
    // If _rotateCycle is false, the newIndex will be -1 if rotating forward and the currentIndex is the last index or if rotating backwards and the currentIndex is 0
    // If _rotateCycle is true, the newIndex will wrap around to the other end of the array if the new index would go out of bounds
    if (currentIndex === -1) {
      newIndex = forward ? 0 : rotateArray.length - 1;
    } else {
      if (forward) {
        newIndex = currentIndex + 1;

        if (newIndex >= rotateArray.length) {
          newIndex = this._rotateCycle ? 0 : -1;
        }
      } else {
        newIndex = currentIndex - 1;

        if (newIndex < 0) {
          newIndex = this._rotateCycle ? rotateArray.length - 1 : -1;
        }
      }
    }

    // the new index is translated into a map of flags to set or unset
    const deckArgs = rotateArray.reduce(
      (acc, key, index) => {
        return { ...acc, [key!]: index === newIndex };
      },
      {} as { neverForget: boolean; blacklist: boolean; suspend: boolean },
    );

    this._miningActions.suspendUpdateWordStates();

    // the flags are set or unset based on the new index
    await this._miningActions.setDecks(deckArgs);

    return this._miningActions.resumeUpdateWordStates();
  }
}
