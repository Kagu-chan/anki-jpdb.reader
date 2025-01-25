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

  for (const tab of await getTabs({ currentWindow: true })) {
    const parsePage = new ParsePageCommand();
    const url = tab.url!;

    if (!tab.id || url.startsWith('about://') || url.startsWith('chrome://')) {
      continue;
    }

    if (await isDisabled(url)) {
      continue;
    }

    appendElement<'a'>('.pages', {
      tag: 'a',
      class: ['outline'],
      handler: (): void => parsePage.send(tab.id!, () => window.close()),
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
