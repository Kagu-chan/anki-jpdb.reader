import { addContextMenu } from '@shared/extension/add-context-menu';
import { openNewTab } from '@shared/extension/open-new-tab';

export class LookupController {
  constructor() {
    addContextMenu(
      {
        id: 'lookup-selection',
        title: 'Lookup selected text',
        contexts: ['selection'],
      },
      (info) => this.lookupText(info.selectionText),
    );
  }

  public lookupText(text: string | undefined): void {
    if (!text?.length) {
      return;
    }

    const urlEncoded = encodeURIComponent(text);
    const url = `https://jpdb.io/search?q=${urlEncoded}&lang=english#a`;

    void openNewTab(url);
  }
}
