import { readStorage } from '../extension/read-storage';
import { FilterKeys } from '../types';
import { DEFAULT_CONFIGURATION } from './default-configuration';
import {
  ConfigurationBooleanKeys,
  ConfigurationNumberKeys,
  ConfigurationObjectKeys,
} from './keys.types';
import { ConfigurationSchema, Keybind } from './types';

const NUMBER_KEYS: ConfigurationNumberKeys = ['schemaVersion', 'hidePopupDelay'];
const BOOLEAN_KEYS: ConfigurationBooleanKeys = [
  'jpdbAddToForq',
  'jpdbUseTwoGrades',
  'jpdbDisableReviews',
  'jpdbRotateFlags',
  'jpdbRotateCycle',
  'enableAnkiIntegration',
  'showPopupOnHover',
  'hidePopupAutomatically',
  'hideAfterAction',
  'touchscreenSupport',
  'disableFadeAnimation',
  'useLegacyHighlighter',
  'skipFurigana',
  'generatePitch',
  'skipReleaseNotes',
  'setSentences',
  'showCurrentOnTop',
];
const OBJECT_KEYS: ConfigurationObjectKeys = [
  'jpdbReviewNothing',
  'jpdbReviewSomething',
  'jpdbReviewHard',
  'jpdbReviewOkay',
  'jpdbReviewEasy',
  'jpdbReviewFail',
  'jpdbReviewPass',
  'jpdbRotateForward',
  'jpdbRotateBackward',
  'ankiMiningConfig',
  'ankiBlacklistConfig',
  'ankiNeverForgetConfig',
  'ankiReadonlyConfigs',
  'parseKey',
  'showPopupKey',
  'showAdvancedDialogKey',
  'lookupSelectionKey',
  'addToMiningKey',
  'addToBlacklistKey',
  'addToNeverForgetKey',
];

export const getConfiguration = async <K extends keyof ConfigurationSchema>(
  key: K,
  fetchDefault: boolean,
): Promise<ConfigurationSchema[K]> => {
  const defaultValue = fetchDefault ? DEFAULT_CONFIGURATION[key] : undefined;
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const value: string = await readStorage(key, defaultValue?.toString());

  if (NUMBER_KEYS.includes(key as FilterKeys<ConfigurationSchema, number>)) {
    return parseInt(value, 10) as ConfigurationSchema[K];
  }

  if (BOOLEAN_KEYS.includes(key as FilterKeys<ConfigurationSchema, boolean>)) {
    return (value === 'true') as ConfigurationSchema[K];
  }

  if (OBJECT_KEYS.includes(key as FilterKeys<ConfigurationSchema, Keybind>)) {
    try {
      return JSON.parse(value) as ConfigurationSchema[K];
    } catch {
      // Catch broken persisted values and return the default value
      return defaultValue! as ConfigurationSchema[K];
    }
  }

  return value as ConfigurationSchema[K];
};
