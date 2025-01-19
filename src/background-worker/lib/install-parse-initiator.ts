import { addContextMenu } from '@shared/extension';
import { ParsePageCommand, ParseSelectionCommand } from '@shared/messages';

export function installParseInitiator(): void {
  const parsePage = new ParsePageCommand();
  const parseSelection = new ParseSelectionCommand();

  addContextMenu(
    {
      id: 'parse-selection',
      title: 'Parse selected text',
      contexts: ['selection'],
    },
    (_, { id: tabId }) => parseSelection.send(tabId!),
  );

  addContextMenu(
    {
      id: 'parse-page',
      title: 'Parse page',
      contexts: ['page'],
    },
    (_, { id: tabId }) => parsePage.send(tabId!),
  );
}
