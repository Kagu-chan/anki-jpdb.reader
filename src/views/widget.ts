import { getConfiguration } from '@shared/configuration/get-configuration';
import { appendElement } from '@shared/dom/append-element';
import { onLoaded } from '@shared/dom/on-loaded';
import { getTabs } from '@shared/extension/get-tabs';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { openView } from '@shared/extension/open-view';
import { isDisabled } from '@shared/host-meta/is-disabled';
import { ParsePageCommand } from '@shared/messages/foreground/parse-page.command';

onLoaded(async () => {
  document.getElementById('settings')?.addEventListener('click', () => {
    void openOptionsPage();
  });

  document.getElementById('changelog')?.addEventListener('click', () => {
    void openView('changelog');
  });

  const tabsFilter: Parameters<typeof chrome.tabs.query>[0] = { currentWindow: true };

  const showCurrentOnTop = await getConfiguration('showCurrentOnTop');
  const hideInactiveTabs = await getConfiguration('hideInactiveTabs');

  if (hideInactiveTabs) {
    tabsFilter.active = true;

    document.getElementById('not-parsable')!.innerText = 'Current tab parsed or disabled';
  }

  const allTabs = await getTabs(tabsFilter);
  const parsePage = new ParsePageCommand();

  let renderedTabs: chrome.tabs.Tab[] = [];

  for (const tab of allTabs) {
    if (
      tab.id &&
      !tab.url?.startsWith('about://') &&
      !tab.url?.startsWith('chrome://') &&
      !(await isDisabled(tab.url!))
    ) {
      renderedTabs.push(tab);
    }
  }

  if (showCurrentOnTop) {
    renderedTabs = renderedTabs.sort((a, b) => {
      if (a.active) {
        return -1;
      }

      if (b.active) {
        return 1;
      }

      return 0;
    });
  }

  for (const tab of renderedTabs) {
    appendElement<'a'>('.pages', {
      tag: 'a',
      class: ['outline'],
      handler: (): void => parsePage.send(tab.id!, () => window.close()),
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
