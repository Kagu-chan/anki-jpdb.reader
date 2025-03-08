import { ConfigurationSchema } from './types';

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

  //#endregion
  //#region Texthighlighting

  useLegacyHighlighter: false,
  skipFurigana: false,
  generatePitch: false,

  customWordCSS: '',

  //#endregion
  //#region Popup

  showPopupOnHover: false,
  touchscreenSupport: false,
  disableFadeAnimation: false,

  // Popup settings
  hideAfterAction: true,
  hidePopupAutomatically: true,
  hidePopupDelay: 500,
  moveMiningActions: false,
  moveGradingActions: false,

  customPopupCSS: '',

  //#endregion
  //#region Keybinds

  // General keybinds
  parseKey: [{ key: 'P', code: 'KeyP', modifiers: ['Alt'] }],
  showPopupKey: [{ key: 'Shift', code: 'ShiftLeft', modifiers: [] }],
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
});
