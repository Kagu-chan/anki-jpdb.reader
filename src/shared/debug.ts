let debugEnabled: boolean | undefined = undefined;
const bufferedDebugMessages: [string, ...unknown[]][] = [];

chrome.storage.local.onChanged.addListener(
  (changes: Record<string, chrome.storage.StorageChange>): void => {
    if (changes.enableDebugMode) {
      debugEnabled = changes.enableDebugMode.newValue as boolean;
    }
  },
);
chrome.storage.local.get('enableDebugMode', (result: { enableDebugMode?: boolean }): void => {
  debugEnabled = result.enableDebugMode ?? false;

  drainBufferedDebugMessages();
});

export const debug = (message: string, ...optionalParams: unknown[]): void => {
  if (debugEnabled === undefined) {
    // Buffer messages until we know the debug state
    bufferedDebugMessages.push([message, ...optionalParams]);

    return;
  }

  if (!debugEnabled) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`[DEBUG] ${message}`, ...optionalParams);
};

const drainBufferedDebugMessages = (): void => {
  if (debugEnabled === undefined || debugEnabled === false) {
    return;
  }

  for (const [message, ...optionalParams] of bufferedDebugMessages) {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG] ${message}`, ...optionalParams);
  }

  bufferedDebugMessages.length = 0; // Clear the buffer
};
