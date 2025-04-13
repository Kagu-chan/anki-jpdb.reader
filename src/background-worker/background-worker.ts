import { getConfiguration } from '@shared/configuration/get-configuration';
import { addContextMenu } from '@shared/extension/add-context-menu';
import { addInstallListener, OnInstalledReason } from '@shared/extension/add-install-listener';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { openView } from '@shared/extension/open-view';
import { ParsePageCommand } from '@shared/messages/foreground/parse-page.command';
import { ParseSelectionCommand } from '@shared/messages/foreground/parse-selection.command';
import { GradeCardCommandHandler } from './jpdb-card-actions/grade-card-command.handler';
import { RunDeckActionCommandHandler } from './jpdb-card-actions/run-deck-action-command.handler';
import { UpdateCardStateCommandHandler } from './jpdb-card-actions/update-card-state-command.handler';
import { BackgroundCommandHandlerCollection } from './lib/background-command-handler-collection';
import { LookupController } from './lookup/lookup-controller';
import { LookupTextCommandHandler } from './lookup/lookup-text-command.handler';
import { AbortRequestCommandHandler } from './parser/abort-request-command.handler';
import { ParseCommandHandler } from './parser/parse-command.handler';
import { ParseController } from './parser/parse.controller';

const parsePageCommand = new ParsePageCommand();
const parseSelectionCommand = new ParseSelectionCommand();

const lookupController = new LookupController();
const lookupTextCommandHandler = new LookupTextCommandHandler(lookupController);

const parseController = new ParseController();
const parseCommandHandler = new ParseCommandHandler(parseController);
const abortRequestCommandHandler = new AbortRequestCommandHandler(parseController);

const updateCardStateCommandHandler = new UpdateCardStateCommandHandler();
const gradeCardCommandHandler = new GradeCardCommandHandler();
const runDeckActionCommandHandler = new RunDeckActionCommandHandler();

const handlerCollection = new BackgroundCommandHandlerCollection(
  lookupTextCommandHandler,
  parseCommandHandler,
  abortRequestCommandHandler,
  updateCardStateCommandHandler,
  gradeCardCommandHandler,
  runDeckActionCommandHandler,
);

handlerCollection.listen();

addInstallListener(async ({ reason }) => {
  if (reason === OnInstalledReason.INSTALL) {
    await openOptionsPage();
  }

  if (reason === OnInstalledReason.UPDATE) {
    // NOTE: OnUpdate In the future we may use this for schema updates

    const skipReleaseNotes = await getConfiguration('skipReleaseNotes', false);

    if (skipReleaseNotes) {
      return;
    }

    await openView('changelog');
  }
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
