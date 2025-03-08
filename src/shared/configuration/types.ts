import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';

export type Keybind = { key: string; code: string; modifiers: string[] };
export type Keybinds = Keybind | [Keybind?, Keybind?];
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
  jpdbReviewNothing: Keybinds;
  jpdbReviewSomething: Keybinds;
  jpdbReviewHard: Keybinds;
  jpdbReviewOkay: Keybinds;
  jpdbReviewEasy: Keybinds;
  jpdbReviewFail: Keybinds;
  jpdbReviewPass: Keybinds;
  jpdbRotateForward: Keybinds;
  jpdbRotateBackward: Keybinds;

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
  showParseButton: boolean;

  parseKey: Keybinds;
  showPopupKey: Keybinds;
  showAdvancedDialogKey: Keybinds;
  lookupSelectionKey: Keybinds;
  addToMiningKey: Keybinds;
  addToBlacklistKey: Keybinds;
  addToNeverForgetKey: Keybinds;
  addToSuspendedKey: Keybinds;

  customWordCSS: string;
  customPopupCSS: string;
};
