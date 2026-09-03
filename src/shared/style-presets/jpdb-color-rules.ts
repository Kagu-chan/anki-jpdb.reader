import { ConfigurationSchema, PresetColor } from '@shared/configuration/types';
import { JPDBCardState, WordStateCategory } from '@shared/jpdb/types';

export type JpdbColorRulesConfig = Pick<
  ConfigurationSchema,
  | 'stateCategories'
  | 'jpdbColorLocked'
  | 'jpdbColorSuspended'
  | 'jpdbColorBlacklisted'
  | 'jpdbColorNeverForget'
  | 'jpdbColorNotInDeck'
  | 'jpdbColorNew'
  | 'jpdbColorLearning'
  | 'jpdbColorKnown'
  | 'jpdbColorDue'
  | 'jpdbColorFailed'
>;

/**
 * One `[selector, color]` pair per JPDB card state, in JPDB base styling mode. When
 * `excludeKnownWords` is set, states the user has mapped to the "Known" category (Settings ->
 * Text Highlighting) are left out entirely - not just the literal "Known" state - so "Plain known
 * words" also covers e.g. a "Never Forget" state mapped to Known.
 */
export const getJpdbColorRules = (
  config: JpdbColorRulesConfig,
  excludeKnownWords: boolean,
): [string, PresetColor][] => {
  const rules: [string, JPDBCardState, PresetColor][] = [
    ['.jpdb-word.locked', JPDBCardState.LOCKED, config.jpdbColorLocked],
    ['.jpdb-word.suspended', JPDBCardState.SUSPENDED, config.jpdbColorSuspended],
    ['.jpdb-word.blacklisted', JPDBCardState.BLACKLISTED, config.jpdbColorBlacklisted],
    ['.jpdb-word.never-forget', JPDBCardState.NEVER_FORGET, config.jpdbColorNeverForget],
    ['.jpdb-word.not-in-deck', JPDBCardState.NOT_IN_DECK, config.jpdbColorNotInDeck],
    ['.jpdb-word.new', JPDBCardState.NEW, config.jpdbColorNew],
    ['.jpdb-word.learning', JPDBCardState.LEARNING, config.jpdbColorLearning],
    ['.jpdb-word.known', JPDBCardState.KNOWN, config.jpdbColorKnown],
    ['.jpdb-word.due', JPDBCardState.DUE, config.jpdbColorDue],
    ['.jpdb-word.failed', JPDBCardState.FAILED, config.jpdbColorFailed],
  ];

  return rules
    .filter(
      ([, cardState]) =>
        !(excludeKnownWords && config.stateCategories[cardState] === WordStateCategory.KNOWN),
    )
    .map(([selector, , color]) => [selector, color]);
};
