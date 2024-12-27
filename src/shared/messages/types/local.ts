import { PotentialPromise } from '@shared/types';

type KeybindEvent = [[e: KeyboardEvent | MouseEvent], PotentialPromise<void>];

type KeybindEvents = {
  jpdbReviewNothing: KeybindEvent;
  jpdbReviewSomething: KeybindEvent;
  jpdbReviewHard: KeybindEvent;
  jpdbReviewOkay: KeybindEvent;
  jpdbReviewEasy: KeybindEvent;
  jpdbReviewFail: KeybindEvent;
  jpdbReviewPass: KeybindEvent;
  jpdbRotateForward: KeybindEvent;
  jpdbRotateBackward: KeybindEvent;
  parseKey: KeybindEvent;
  showPopupKey: KeybindEvent;
  showAdvancedDialogKey: KeybindEvent;
  lookupSelectionKey: KeybindEvent;
  addToMiningKey: KeybindEvent;
  addToBlacklistKey: KeybindEvent;
  addToNeverForgetKey: KeybindEvent;
};

type ReleaseKeybindEvents = {
  [K in keyof KeybindEvents as `${K & string}Released`]: KeybindEvents[K];
};

/**
 * Defines events which can occur in the current scope
 * Those do not get transferred between browser and extension
 */
export type LocalEvents = KeybindEvents &
  ReleaseKeybindEvents & {
    keydown: KeybindEvent;
    keyup: KeybindEvent;
  };

export type LocalEventArgs<T extends keyof LocalEvents> = LocalEvents[T][0];
export type LocalEventResult<T extends keyof LocalEvents> = LocalEvents[T][1];
export type LocalEventFunction<T extends keyof LocalEvents = keyof LocalEvents> = (
  ...args: LocalEventArgs<T>
) => LocalEventResult<T>;
