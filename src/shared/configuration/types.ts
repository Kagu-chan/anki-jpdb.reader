import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';

export type Keybind = { key: string; code: string; modifiers: string[] };
export type ConfigurationSchema = {
  schemaVersion: number;
  jpdbApiToken: string;
  jpdbMiningDeck: string;
  jpdbBlacklistDeck: string;
  jpdbForqDeck: string;
  jpdbNeverForgetDeck: string;
  skipReleaseNotes: boolean;
  jpdbAddToForq: boolean;
  jpdbUseTwoGrades: boolean;
  jpdbDisableReviews: boolean;
  jpdbRotateFlags: boolean;
  jpdbRotateCycle: boolean;
  jpdbReviewNothing: Keybind;
  jpdbReviewSomething: Keybind;
  jpdbReviewHard: Keybind;
  jpdbReviewOkay: Keybind;
  jpdbReviewEasy: Keybind;
  jpdbReviewFail: Keybind;
  jpdbReviewPass: Keybind;
  jpdbRotateForward: Keybind;
  jpdbRotateBackward: Keybind;

  enableAnkiIntegration: boolean;
  ankiUrl: string;
  ankiProxyUrl: string;
  ankiMiningConfig: DeckConfiguration;
  ankiBlacklistConfig: DeckConfiguration;
  ankiNeverForgetConfig: DeckConfiguration;
  ankiReadonlyConfigs: DiscoverWordConfiguration[];

  contextWidth: number;
  hidePopupAutomatically: boolean;
  hidePopupDelay: number;
  hideAfterAction: boolean;

  useLegacyHighlighter: boolean;
  skipFurigana: boolean;

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

  customWordCSS: string;
  customPopupCSS: string;
};
