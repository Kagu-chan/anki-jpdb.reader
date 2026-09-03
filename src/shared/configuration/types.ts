import { DeckConfiguration, DiscoverWordConfiguration } from '../anki/types';
import { StateCategories } from '../jpdb/types';

export type Keybind = { key: string; code: string; modifiers: string[] };
export type Keybinds = Keybind | [Keybind?, Keybind?];

export type PresetColor = { r?: number; g?: number; b?: number; a?: number; style?: string };

export enum BaseStylingMode {
  JPDB = 'jpdb',
  CATEGORY = 'category',
  NONE = 'none',
}

export enum FuriganaVisibility {
  UNSET = 'unset',
  ALWAYS = 'always',
  HOVER = 'hover',
  NEVER = 'never',
}

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

  stateCategories: StateCategories;

  topXMark: boolean;
  topXMarkAll: boolean;
  topXMarkCount: number;
  iPlus1Mark: boolean;
  iPlus1MarkOnlyFrequent: boolean;
  iPlus1EvalAgainstKnown: boolean;
  iPlus1MinSentenceLen: number;
  skipFurigana: boolean;
  generatePitch: boolean;

  enableStylePresets: boolean;
  stylePresets: string[];
  baseStylingMode: BaseStylingMode;

  baseColor: PresetColor;

  jpdbColorLocked: PresetColor;
  jpdbColorSuspended: PresetColor;
  jpdbColorBlacklisted: PresetColor;
  jpdbColorNeverForget: PresetColor;
  jpdbColorNotInDeck: PresetColor;
  jpdbColorNew: PresetColor;
  jpdbColorLearning: PresetColor;
  jpdbColorKnown: PresetColor;
  jpdbColorDue: PresetColor;
  jpdbColorFailed: PresetColor;

  categoryColorUnmined: PresetColor;
  categoryColorNew: PresetColor;
  categoryColorLearning: PresetColor;
  categoryColorKnown: PresetColor;

  frequentColor: PresetColor;
  iPlusOneColor: PresetColor;
  misparsedColor: PresetColor;

  pitchColorHeiban: PresetColor;
  pitchColorAtamadaka: PresetColor;
  pitchColorNakadaka: PresetColor;
  pitchColorOdaka: PresetColor;
  pitchColorKifuku: PresetColor;

  furiganaUnminedWords: FuriganaVisibility;
  furiganaNewWords: FuriganaVisibility;
  furiganaLearningWords: FuriganaVisibility;
  furiganaKnownWords: FuriganaVisibility;
  furiganaUnrelatedWords: FuriganaVisibility;

  highlightMisparsed: boolean;
  highlightPitchAccent: boolean;

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
  hidePopupKey: Keybinds;
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
  //#region Parsers

  parserTouchEventsShowToggleOverlayButton: boolean;
  parserTouchEventsToggleEventSource: Keybinds;

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
