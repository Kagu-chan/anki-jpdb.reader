let listeners: Set<(details: chrome.runtime.InstalledDetails) => unknown>;

export const addInstallListener = <T>(
  cb: (details: chrome.runtime.InstalledDetails) => T | Promise<T>,
): void => {
  if (!listeners) {
    listeners = new Set();

    chrome.runtime.onInstalled.addListener((details) => {
      for (const listener of listeners) {
        void listener(details);
      }
    });
  }

  listeners.add(cb);
};

export const OnInstalledReason = chrome.runtime.OnInstalledReason;
