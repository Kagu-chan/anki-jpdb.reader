import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';

export type Keybind = { key: string; code: string; modifiers: string[] };
export type ConfigurationSchema = {
  schemaVersion: number;
  jpdbApiToken: string;
  jpdbMiningDeck: string;
  jpdbBlacklistDeck: string;
  jpdbForqDeck: string;
  jpdbSuspendDeck: string;
  jpdbNeverForgetDeck: string;
  skipReleaseNotes: boolean;
  jpdbAddToForq: boolean;
  jpdbUseTwoGrades: boolean;
  jpdbDisableReviews: boolean;
  jpdbReviewNothing: Keybind;
  jpdbReviewSomething: Keybind;
  jpdbReviewHard: Keybind;
  jpdbReviewOkay: Keybind;
  jpdbReviewEasy: Keybind;
  jpdbReviewFail: Keybind;
  jpdbReviewPass: Keybind;
  jpdbRotateForward: Keybind;
  jpdbRotateBackward: Keybind;

  jpdbRotateFlags: boolean;
  jpdbRotateCycle: boolean;
  jpdbCycleNeverForget: boolean;
  jpdbCycleBlacklist: boolean;
  jpdbCycleSuspended: boolean;

  enableAnkiIntegration: boolean;
  ankiUrl: string;
  ankiProxyUrl: string;
  ankiMiningConfig: DeckConfiguration;
  ankiBlacklistConfig: DeckConfiguration;
  ankiNeverForgetConfig: DeckConfiguration;
  ankiReadonlyConfigs: DiscoverWordConfiguration[];

  setSentences: boolean;
  hidePopupAutomatically: boolean;
  hidePopupDelay: number;
  hideAfterAction: boolean;

  useLegacyHighlighter: boolean;
  skipFurigana: boolean;
  generatePitch: boolean;
  showCurrentOnTop: boolean;
  hideInactiveTabs: boolean;

  showPopupOnHover: boolean;
  touchscreenSupport: boolean;
  disableFadeAnimation: boolean;

  parseKey: Keybind;
  showPopupKey: Keybind;
  showAdvancedDialogKey: Keybind;
  lookupSelectionKey: Keybind;
  addToMiningKey: Keybind;
  addToBlacklistKey: Keybind;
  addToNeverForgetKey: Keybind;
  addToSuspendedKey: Keybind;

  customWordCSS: string;
  customPopupCSS: string;
};
