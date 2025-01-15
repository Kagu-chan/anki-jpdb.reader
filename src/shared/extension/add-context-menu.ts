import { addInstallListener } from './add-install-listener';

let handlers: Map<
  string,
  (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>
>;

export const addContextMenu = (
  options: chrome.contextMenus.CreateProperties,
  handler: (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void | Promise<void>,
): void => {
  if (!handlers) {
    handlers = new Map();

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      const id = info.menuItemId as string;
      const handler = handlers.get(id);

      if (!tab || !handler) {
        return;
      }

      void handler(info, tab);
    });
  }

  const { id } = options;

  if (!id || handlers.has(id)) {
    return;
  }

  handlers.set(id, handler);

  addInstallListener(() => chrome.contextMenus.create(options));
};
