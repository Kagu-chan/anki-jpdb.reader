import { BackgroundCommand } from '../lib/background-command';

export class FetchDecksCommand extends BackgroundCommand<[]> {
  public readonly key = 'fetchDecks';
}
