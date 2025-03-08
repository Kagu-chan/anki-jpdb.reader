import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';

export type Keybind = { key: string; code: string; modifiers: string[] };
export type Keybinds = Keybind | [Keybind?, Keybind?];
export type ConfigurationSchema = {
  schemaVersion: number;

  // JPDB Integration
  jpdbApiToken: string;

  //#region Mining configuration

  jpdbAddToForq: boolean;
  setSentences: boolean;
  jpdbDisableReviews: boolean;
  jpdbUseTwoGrades: boolean;

  // JPDB Flag settings
  jpdbRotateFlags: boolean;
  jpdbRotateCycle: boolean;
  jpdbCycleNeverForget: boolean;
  jpdbCycleBlacklist: boolean;
  jpdbCycleSuspended: boolean;

  // JPDB decks
  jpdbMiningDeck: string;
  jpdbBlacklistDeck: string;
  jpdbForqDeck: string;
  jpdbSuspendDeck: string;
  jpdbNeverForgetDeck: string;

  //#endregion
  //#region Accessibility

  showPopupOnHover: boolean;
  touchscreenSupport: boolean;
  disableFadeAnimation: boolean;
  showCurrentOnTop: boolean;
  hideInactiveTabs: boolean;
  showParseButton: boolean;
  skipReleaseNotes: boolean;

  // Popup settings
  hideAfterAction: boolean;
  hidePopupAutomatically: boolean;
  hidePopupDelay: number;

  //#endregion
  //#region Keybinds

  // General keybinds
  parseKey: Keybinds;
  showPopupKey: Keybinds;
  showAdvancedDialogKey: Keybinds;
  lookupSelectionKey: Keybinds;

  // Mining keybinds
  addToMiningKey: Keybinds;
  addToBlacklistKey: Keybinds;
  addToNeverForgetKey: Keybinds;
  addToSuspendedKey: Keybinds;

  // Review keybinds
  jpdbReviewNothing: Keybinds;
  jpdbReviewSomething: Keybinds;
  jpdbReviewHard: Keybinds;
  jpdbReviewOkay: Keybinds;
  jpdbReviewEasy: Keybinds;
  jpdbReviewFail: Keybinds;
  jpdbReviewPass: Keybinds;

  // Rotation keybinds
  jpdbRotateForward: Keybinds;
  jpdbRotateBackward: Keybinds;

  //#endregion
  //#region Parsing

  useLegacyHighlighter: boolean;
  skipFurigana: boolean;
  generatePitch: boolean;

  //#endregion
  //#region Appearance

  customWordCSS: string;
  customPopupCSS: string;

  //#endregion
  //#region Anki Integration (not implemented!)

  enableAnkiIntegration: boolean;
  ankiUrl: string;
  ankiProxyUrl: string;
  ankiMiningConfig: DeckConfiguration;
  ankiBlacklistConfig: DeckConfiguration;
  ankiNeverForgetConfig: DeckConfiguration;
  ankiReadonlyConfigs: DiscoverWordConfiguration[];

  //#endregion
};
