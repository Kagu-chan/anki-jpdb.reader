import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';
import { JPDBCardState } from '../jpdb/types';

export type Keybind = { key: string; code: string; modifiers: string[] };
export type Keybinds = Keybind | [Keybind?, Keybind?];
export type ConfigurationSchema = {
  schemaVersion: number;

  //#region JPDB Integration

  jpdbApiToken: string;

  //#endregion
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
  //#region Parsing

  hideInactiveTabs: boolean;
  showCurrentOnTop: boolean;
  showParseButton: boolean;

  enabledFeatures: string[];
  disabledParsers: string[];
  additionalHosts: string;
  additionalMeta: string;

  //#endregion
  //#region Texthighlighting

  newStates: JPDBCardState[];

  markTopX: boolean;
  markTopXCount: number;
  markAllTypes: boolean;
  markIPlus1: boolean;
  minSentenceLength: number;
  markOnlyFrequent: boolean;
  skipFurigana: boolean;
  generatePitch: boolean;

  customWordCSS: string;

  //#endregion
  //#region Popup

  showPopupOnHover: boolean;
  renderCloseButton: boolean;
  touchscreenSupport: boolean;
  disableFadeAnimation: boolean;
  leftAlignPopupToWord: boolean;

  // Popup settings
  hideAfterAction: boolean;
  hidePopupAutomatically: boolean;
  hidePopupDelay: number;

  showMiningActions: boolean;
  moveMiningActions: boolean;

  showGradingActions: boolean;
  moveGradingActions: boolean;

  showRotateActions: boolean;
  moveRotateActions: boolean;

  customPopupCSS: string;

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
  //#region Anki Integration (not implemented!)

  enableAnkiIntegration: boolean;
  ankiUrl: string;
  ankiProxyUrl: string;
  ankiMiningConfig: DeckConfiguration;
  ankiBlacklistConfig: DeckConfiguration;
  ankiNeverForgetConfig: DeckConfiguration;
  ankiReadonlyConfigs: DiscoverWordConfiguration[];

  //#endregion

  skipReleaseNotes: boolean;
  enableDebugMode: boolean;
};
