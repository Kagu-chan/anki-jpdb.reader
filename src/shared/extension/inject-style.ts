const installedStyles = new Map<string, { file: string; raw?: string }>();

chrome.tabs.onRemoved.addListener((tabId) => {
  installedStyles.forEach((config, key) => {
    if (key.startsWith(`${tabId}-`)) {
      installedStyles.delete(key);
    }
  });
});

export const injectStyle = async (tabId: number, file: string, raw?: string): Promise<void> => {
  const key = `${tabId}-${file}`;

  if (installedStyles.has(key)) {
    const config = installedStyles.get(key);
    const remove = (
      cfg:
        | Pick<chrome.scripting.CSSInjection, 'files'>
        | Pick<chrome.scripting.CSSInjection, 'css'>,
    ): Promise<void> =>
      chrome.scripting.removeCSS({ target: { tabId, allFrames: true }, ...cfg }).catch(() => {
        /* noop */
      });

    await remove({ files: [config!.file] });

    if (config?.raw?.length) {
      await remove({ css: config.raw });
    }
  }

  await chrome.scripting.insertCSS({
    target: { tabId, allFrames: true },
    files: [`css/${file}.css`],
  });

  if (raw?.length) {
    await chrome.scripting.insertCSS({
      target: { tabId, allFrames: true },
      css: raw,
    });
  }

  installedStyles.set(key, { file, raw });
};
