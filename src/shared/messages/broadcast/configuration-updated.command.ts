import { BroadcastCommand } from './broadcast-command';

export class ConfigurationUpdatedCommand extends BroadcastCommand {
  public readonly key = 'configurationUpdated';
}
