import { getURL } from './get-url';

export const openView = (view: string): Promise<chrome.tabs.Tab> =>
  chrome.tabs.create({ url: getURL(`views/${view}.html`) });
