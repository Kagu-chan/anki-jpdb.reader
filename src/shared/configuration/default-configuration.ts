import { JPDBCardState, WordStateCategory } from '../jpdb/types';
import { BaseStylingMode, ConfigurationSchema, FuriganaVisibility } from './types';

export const DEFAULT_CONFIGURATION = Object.freeze<ConfigurationSchema>({
  schemaVersion: 1,

  //#region JPDB Integration

  jpdbApiToken: '',

  //#endregion
  //#region Mining configuration

  jpdbAddToForq: false,
  setSentences: false,
  jpdbDisableReviews: false,
  jpdbUseTwoGrades: false,

  // JPDB Flag settings
  jpdbRotateFlags: false,
  jpdbRotateCycle: false,
  jpdbCycleNeverForget: true,
  jpdbCycleBlacklist: true,
  jpdbCycleSuspended: false,

  // JPDB decks
  jpdbMiningDeck: '',
  jpdbBlacklistDeck: 'blacklist',
  jpdbForqDeck: 'forq',
  jpdbSuspendDeck: '',
  jpdbNeverForgetDeck: 'never-forget',

  //#endregion
  //#region Parsing

  hideInactiveTabs: true,
  showCurrentOnTop: true,
  showParseButton: true,

  enabledFeatures: [],
  disabledParsers: [],
  additionalHosts: '',
  additionalMeta: '[]',

  //#endregion
  //#region Texthighlighting

  stateCategories: {
    [JPDBCardState.NOT_IN_DECK]: WordStateCategory.UNMINED,
    [JPDBCardState.NEW]: WordStateCategory.NEW,
    [JPDBCardState.LEARNING]: WordStateCategory.LEARNING,
    [JPDBCardState.FAILED]: WordStateCategory.LEARNING,
    [JPDBCardState.KNOWN]: WordStateCategory.KNOWN,
    [JPDBCardState.NEVER_FORGET]: WordStateCategory.KNOWN,
  },

  topXMark: false,
  topXMarkAll: false,
  topXMarkCount: 10_000,

  iPlus1Mark: false,
  iPlus1MarkOnlyFrequent: false,
  iPlus1EvalAgainstKnown: true,
  iPlus1MinSentenceLen: 3,
  skipFurigana: false,
  generatePitch: false,

  enableStylePresets: true,
  stylePresets: [],
  baseStylingMode: BaseStylingMode.JPDB,

  jpdbColorLocked: { r: 119, g: 119, b: 119 },
  jpdbColorSuspended: { r: 119, g: 119, b: 119 },
  jpdbColorBlacklisted: { r: 119, g: 119, b: 119 },
  jpdbColorNeverForget: { r: 112, g: 192, b: 0 },
  jpdbColorNotInDeck: { r: 75, g: 141, b: 255, a: 0.5 },
  jpdbColorNew: { r: 75, g: 141, b: 255 },
  jpdbColorLearning: { r: 94, g: 167, b: 128 },
  jpdbColorKnown: { r: 112, g: 192, b: 0 },
  jpdbColorDue: { r: 255, g: 69, b: 0 },
  jpdbColorFailed: { r: 255, g: 0, b: 0 },

  categoryColorUnmined: { r: 75, g: 141, b: 255, a: 0.5 },
  categoryColorNew: { r: 75, g: 141, b: 255 },
  categoryColorLearning: { r: 255, g: 69, b: 0 },
  categoryColorKnown: { r: 112, g: 192, b: 0 },

  frequentColor: { r: 75, g: 141, b: 127 },
  iPlusOneColor: {
    r: 53,
    g: 158,
    b: 255,
    style:
      'text-shadow: 0 2px 6px ${color}, 0 4px 12px ${color}; transition: text-shadow 0.3s ease-in-out;',
  },
  misparsedColor: {
    r: 255,
    g: 0,
    b: 0,
    style: 'color: ${color}; background-color: lightgray;',
  },

  pitchColorHeiban: {
    r: 53,
    g: 158,
    b: 255,
    style: 'text-decoration: underline; text-decoration-color: ${color};',
  },
  pitchColorAtamadaka: {
    r: 254,
    g: 75,
    b: 116,
    style: 'text-decoration: underline; text-decoration-color: ${color};',
  },
  pitchColorNakadaka: {
    r: 251,
    g: 168,
    b: 64,
    style: 'text-decoration: underline; text-decoration-color: ${color};',
  },
  pitchColorOdaka: {
    r: 87,
    g: 204,
    b: 183,
    style: 'text-decoration: underline; text-decoration-color: ${color};',
  },
  pitchColorKifuku: {
    r: 144,
    g: 80,
    b: 246,
    style: 'text-decoration: underline; text-decoration-color: ${color};',
  },

  furiganaUnminedWords: FuriganaVisibility.ALWAYS,
  furiganaNewWords: FuriganaVisibility.ALWAYS,
  furiganaLearningWords: FuriganaVisibility.HOVER,
  furiganaKnownWords: FuriganaVisibility.NEVER,

  highlightMisparsed: true,
  highlightPitchAccent: true,

  customWordCSS: '',

  //#endregion
  //#region Popup

  showPopupOnHover: false,
  renderCloseButton: true,
  touchscreenSupport: false,
  disableFadeAnimation: false,
  leftAlignPopupToWord: false,

  // Popup settings
  hideAfterAction: true,
  hidePopupAutomatically: true,
  hidePopupDelay: 500,

  showMiningActions: true,
  moveMiningActions: false,

  showGradingActions: true,
  moveGradingActions: false,

  showRotateActions: false,
  moveRotateActions: false,

  customPopupCSS: '',

  //#endregion
  //#region Keybinds

  // General keybinds
  parseKey: [{ key: 'P', code: 'KeyP', modifiers: ['Alt'] }],
  showPopupKey: [{ key: 'Shift', code: 'ShiftLeft', modifiers: [] }],
  hidePopupKey: [{ key: 'Escape', code: 'Escape', modifiers: [] }],
  showAdvancedDialogKey: [],
  lookupSelectionKey: [{ key: 'L', code: 'KeyL', modifiers: ['Alt'] }],

  // Mining keybinds
  addToMiningKey: [],
  addToBlacklistKey: [],
  addToNeverForgetKey: [],
  addToSuspendedKey: [],

  // Review keybinds
  jpdbReviewNothing: [],
  jpdbReviewSomething: [],
  jpdbReviewHard: [],
  jpdbReviewOkay: [],
  jpdbReviewEasy: [],
  jpdbReviewFail: [],
  jpdbReviewPass: [],

  // Rotation keybinds
  jpdbRotateForward: [],
  jpdbRotateBackward: [],

  //#endregion
  //#region Parsers

  parserTouchEventsShowToggleOverlayButton: false,
  parserTouchEventsToggleEventSource: [],

  //#endregion
  //#region Anki Integration (not implemented!)

  enableAnkiIntegration: false,
  ankiUrl: 'http://localhost:8765',
  ankiProxyUrl: '',
  ankiMiningConfig: {
    deck: '',
    model: '',
    proxy: false,
    wordField: '',
    readingField: '',
    templateTargets: [],
  },
  ankiBlacklistConfig: {
    deck: '',
    model: '',
    proxy: false,
    wordField: '',
    readingField: '',
    templateTargets: [],
  },
  ankiNeverForgetConfig: {
    deck: '',
    model: '',
    proxy: false,
    wordField: '',
    readingField: '',
    templateTargets: [],
  },
  ankiReadonlyConfigs: [],

  //#endregion

  skipReleaseNotes: false,
  enableDebugMode: false,
});
