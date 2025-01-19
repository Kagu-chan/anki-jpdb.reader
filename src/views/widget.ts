import { appendElement, onLoaded } from '@shared/dom';
import { getTabs, openOptionsPage } from '@shared/extension';
import { isDisabled } from '@shared/host-meta';
import { ParsePageCommand } from '@shared/messages';

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
