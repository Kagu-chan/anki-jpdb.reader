import { getConfiguration } from './get-configuration';
import { CURRENT_SCHEMA_VERSION } from './schema-version';
import { setConfiguration } from './set-configuration';

// One entry per schema version - the function migrates a stored configuration *to* that version.
const MIGRATIONS: Record<number, () => Promise<void>> = {
  2: async () => {
    const stylePresets = await getConfiguration('stylePresets');

    if (!stylePresets.includes('underline-words-on-hover')) {
      await setConfiguration('stylePresets', [...stylePresets, 'underline-words-on-hover']);
    }
  },
};

/**
 * Runs on every extension update. `schemaVersion` was never actually persisted before this
 * existed, so an absent stored value means "some pre-migration-system install" and is treated as
 * version 1, not as already being on the latest version.
 */
export const migrateConfiguration = async (): Promise<void> => {
  const stored = await chrome.storage.local.get('schemaVersion');
  const schemaVersion = stored.schemaVersion ? parseInt(stored.schemaVersion as string, 10) : 1;

  for (let version = schemaVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
    await MIGRATIONS[version]?.();
  }

  await setConfiguration('schemaVersion', CURRENT_SCHEMA_VERSION);
};
