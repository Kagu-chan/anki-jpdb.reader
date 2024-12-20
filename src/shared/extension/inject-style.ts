const installedStyles = new Set<string>();

export const injectStyle = async (tabId: number, file: string, raw?: string): Promise<void> => {
  const key = `${tabId}-${file}`;

  if (installedStyles.has(key)) {
    return;
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
};
