import { GradeCardCommandHandler } from './jpdb-card-actions/grade-card-command.handler';
import { RunDeckActionCommandHandler } from './jpdb-card-actions/run-deck-action-command.handler';
import { UpdateCardStateCommandHandler } from './jpdb-card-actions/update-card-state-command.handler';
import { BackgroundCommandHandlerCollection } from './lib/background-command-handler-collection';
import { installInstallListeners } from './lib/install-install-listeners';
import { installParseInitiator } from './lib/install-parse-initiator';
import { installParser } from './lib/parser/install-parser';
import { LookupController } from './lookup/lookup-controller';
import { LookupTextCommandHandler } from './lookup/lookup-text-command.handler';

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

installParseInitiator();
installParser();

installInstallListeners();

handlerCollection.listen();
