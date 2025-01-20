import { appendElement } from '@shared/dom/append-element';
import { onLoaded } from '@shared/dom/on-loaded';
import { getTabs } from '@shared/extension/get-tabs';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { isDisabled } from '@shared/host-meta/is-disabled';
import { ParsePageCommand } from '@shared/messages/foreground/parse-page.command';

onLoaded(async () => {
  document.getElementById('settings-link')?.addEventListener('click', () => {
    void openOptionsPage();
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

    appendElement<'a'>('.container', {
      tag: 'a',
      class: ['outline', 'parse'],
      handler: (): void => parsePage.send(tab.id!, () => window.close()),
      innerText: `Parse "${tab.title ?? 'Untitled'}"`,
    });
  }
});
