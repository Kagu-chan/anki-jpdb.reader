import { BroadcastCommand } from '../lib/broadcast-command';

export class ConfigurationUpdatedCommand extends BroadcastCommand {
  public readonly key = 'configurationUpdated';
}
