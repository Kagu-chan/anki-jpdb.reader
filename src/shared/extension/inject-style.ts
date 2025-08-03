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

export const injectStyle = async (tabId: number, file?: string, raw?: string): Promise<void> => {
  const currentConfig = tabs.get(tabId) || {};
  const filePath = file?.length ? getPath(file) : undefined;
  const awaits: Promise<void>[] = [];

  // If nothing changed, ignore the request
  if (currentConfig.raw === raw && currentConfig.file === filePath) {
    return;
  }

  // If the file changed, update the tabs file configuration
  if (currentConfig.file !== filePath) {
    const remProm = currentConfig.file
      ? remove(tabId, { files: [currentConfig.file] })
      : Promise.resolve();
    const addProm = filePath ? remProm.then(() => insert(tabId, { files: [filePath] })) : remProm;

    awaits.push(addProm);
  }

  // If the css changed, update the tabs raw configuration
  if (currentConfig.raw !== raw) {
    const remProm = currentConfig.raw?.length
      ? remove(tabId, { css: currentConfig.raw })
      : Promise.resolve();
    const addProm = raw?.length ? remProm.then(() => insert(tabId, { css: raw })) : remProm;

    awaits.push(addProm);
  }

  await Promise.all(awaits);

  // Update the tabs configuration
  tabs.set(tabId, { file: filePath, raw });
};
