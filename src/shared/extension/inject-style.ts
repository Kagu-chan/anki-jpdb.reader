const tabs = new Map<number, { file?: string; raw?: string }>();

chrome.tabs.onRemoved.addListener((tabId) => {
  tabs.delete(tabId);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabs.delete(tabId);
  }
});

const getPath = (file: string): string => `css/${file}.css`;
const insert = (
  tabId: number,
  cfg:
    | {
        css: string;
        files?: undefined;
      }
    | {
        css?: undefined;
        files: string[];
      },
): Promise<void> =>
  chrome.scripting.insertCSS({
    target: { tabId, allFrames: true },
    ...cfg,
  });

const remove = (
  tabId: number,
  cfg:
    | {
        css: string;
        files?: undefined;
      }
    | {
        css?: undefined;
        files: string[];
      },
): Promise<void> =>
  chrome.scripting
    .removeCSS({
      target: { tabId, allFrames: true },
      ...cfg,
    })
    .catch(() => {
      /* noop */
    });

const replaceFile = async (
  tabId: number,
  oldFile: string | undefined,
  newFile: string | undefined,
): Promise<void> => {
  if (oldFile) {
    // Remove the old file if it exists
    await remove(tabId, { files: [oldFile] });
  }

  if (newFile) {
    // Insert the new file if it exists
    await insert(tabId, { files: [newFile] });
  }
};

const replaceRaw = async (
  tabId: number,
  oldRaw: string | undefined,
  newRaw: string | undefined,
): Promise<void> => {
  if (oldRaw) {
    // Remove the old raw CSS if it exists
    await remove(tabId, { css: oldRaw });
  }

  if (newRaw) {
    // Insert the new raw CSS if it exists
    await insert(tabId, { css: newRaw });
  }
};

export const injectStyle = async (tabId: number, file?: string, raw?: string): Promise<void> => {
  const currentConfig = tabs.get(tabId) || {};
  const filePath = file?.length ? getPath(file) : undefined;

  // If nothing changed, ignore the request
  if (currentConfig.raw === raw && currentConfig.file === filePath) {
    return;
  }

  // If the file changed, update the tabs file configuration
  if (currentConfig.file !== filePath) {
    await replaceFile(tabId, currentConfig.file, filePath);
  }

  // If the css changed, update the tabs raw configuration
  if (currentConfig.raw !== raw) {
    await replaceRaw(tabId, currentConfig.raw, raw);
  }

  // Update the tabs configuration
  tabs.set(tabId, { file: filePath, raw });
};
