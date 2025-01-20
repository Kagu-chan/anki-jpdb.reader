import { JPDBCardState } from '../../jpdb/types';
import { BroadcastCommand } from '../lib/broadcast-command';

export class CardStateUpdatedCommand extends BroadcastCommand<
  [vid: number, sid: number, cardstate: JPDBCardState[]]
> {
  public readonly key = 'cardStateUpdated';
}
