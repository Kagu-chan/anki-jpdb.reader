import { addContextMenu } from '@shared/extension/add-context-menu';
import { addInstallListener, OnInstalledReason } from '@shared/extension/add-install-listener';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { ParsePageCommand } from '@shared/messages/foreground/parse-page.command';
import { ParseSelectionCommand } from '@shared/messages/foreground/parse-selection.command';
import { GradeCardCommandHandler } from './jpdb-card-actions/grade-card-command.handler';
import { RunDeckActionCommandHandler } from './jpdb-card-actions/run-deck-action-command.handler';
import { UpdateCardStateCommandHandler } from './jpdb-card-actions/update-card-state-command.handler';
import { BackgroundCommandHandlerCollection } from './lib/background-command-handler-collection';
import { installParser } from './lib/parser/install-parser';
import { LookupController } from './lookup/lookup-controller';
import { LookupTextCommandHandler } from './lookup/lookup-text-command.handler';

const parsePageCommand = new ParsePageCommand();
const parseSelectionCommand = new ParseSelectionCommand();

const lookupController = new LookupController();
const lookupTextCommandHandler = new LookupTextCommandHandler(lookupController);

const updateCardStateCommandHandler = new UpdateCardStateCommandHandler();
const gradeCardCommandHandler = new GradeCardCommandHandler();
const runDeckActionCommandHandler = new RunDeckActionCommandHandler();

const handlerCollection = new BackgroundCommandHandlerCollection(
  lookupTextCommandHandler,
  updateCardStateCommandHandler,
  gradeCardCommandHandler,
  runDeckActionCommandHandler,
);

installParser();

handlerCollection.listen();

addInstallListener(async ({ reason }) => {
  if (reason === OnInstalledReason.INSTALL) {
    await openOptionsPage();
  }

  // TODO: OnUpdate Open a new tab with the release notes
  // NOTE: OnUpdate In the future we may use this for schema updates
});

addContextMenu(
  {
    id: 'parse-page',
    title: 'Parse Page',
    contexts: ['page'],
  },
  (_, { id }) => parsePageCommand.send(id!),
);

addContextMenu(
  {
    id: 'parse-selection',
    title: 'Parse Selection',
    contexts: ['selection'],
  },
  (_, { id }) => parseSelectionCommand.send(id!),
);
