import { ConfigurationSchema } from './types';

export const DEFAULT_CONFIGURATION = Object.freeze<ConfigurationSchema>({
  schemaVersion: 1,

  skipReleaseNotes: false,

  jpdbApiToken: '',
  jpdbMiningDeck: '',
  jpdbBlacklistDeck: 'blacklist',
  jpdbNeverForgetDeck: 'never-forget',
  jpdbForqDeck: 'forq',
  jpdbAddToForq: false,
  jpdbUseTwoGrades: false,
  jpdbRotateFlags: false,
  jpdbRotateCycle: false,
  jpdbDisableReviews: false,
  jpdbReviewNothing: { key: '', code: '', modifiers: [] },
  jpdbReviewSomething: { key: '', code: '', modifiers: [] },
  jpdbReviewHard: { key: '', code: '', modifiers: [] },
  jpdbReviewOkay: { key: '', code: '', modifiers: [] },
  jpdbReviewEasy: { key: '', code: '', modifiers: [] },
  jpdbReviewFail: { key: '', code: '', modifiers: [] },
  jpdbReviewPass: { key: '', code: '', modifiers: [] },
  jpdbRotateForward: { key: '', code: '', modifiers: [] },
  jpdbRotateBackward: { key: '', code: '', modifiers: [] },

  useLegacyHighlighter: false,
  skipFurigana: false,
  generatePitch: false,

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

  setSentences: false,

  hidePopupAutomatically: true,
  hidePopupDelay: 500,
  hideAfterAction: true,

  showPopupOnHover: false,
  touchscreenSupport: false,
  disableFadeAnimation: false,

  parseKey: { key: 'P', code: 'KeyP', modifiers: ['Alt'] },
  showPopupKey: { key: 'Shift', code: 'ShiftLeft', modifiers: [] },
  showAdvancedDialogKey: { key: '', code: '', modifiers: [] },
  lookupSelectionKey: { key: 'L', code: 'KeyL', modifiers: ['Alt'] },
  addToMiningKey: { key: '', code: '', modifiers: [] },
  addToBlacklistKey: { key: '', code: '', modifiers: [] },
  addToNeverForgetKey: { key: '', code: '', modifiers: [] },

  customWordCSS: '',
  customPopupCSS: '',
});
