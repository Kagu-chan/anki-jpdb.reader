import { addInstallListener, OnInstalledReason, openOptionsPage } from '@shared/extension';

export const installInstallListeners = (): void => {
  addInstallListener(async ({ reason }): Promise<void> => {
    if (reason === OnInstalledReason.INSTALL) {
      await openOptionsPage();

      return;
    }

    if (reason === OnInstalledReason.UPDATE) {
      // NOP - currently no action is needed - we may use this for schema updates in the future
    }
  });
};
