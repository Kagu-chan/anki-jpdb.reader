import { ConfigurationMonitor } from '@shared/configuration/configuration-monitor';
import { ConfigurationSchema } from '@shared/configuration/types';
import { JPDBCard } from '@shared/jpdb/types';
import { UpdateCardStateCommand } from '@shared/messages/background/update-card-state.command';

export abstract class BaseController {
  public abstract showActions: boolean;
  protected configuration: ConfigurationSchema;

  protected static _suspendUpdateWordStates = false;

  constructor() {
    this.setup();
  }

  public suspendUpdateWordStates(): void {
    BaseController._suspendUpdateWordStates = true;
  }

  public resumeUpdateWordStates(card: JPDBCard): void {
    BaseController._suspendUpdateWordStates = false;

    this.updateCardState(card);
  }

  public updateCardState(card: JPDBCard): void {
    const { vid, sid } = card;

    if (BaseController._suspendUpdateWordStates) {
      return;
    }

    new UpdateCardStateCommand(vid, sid).send();
  }

  protected setup(): void {
    ConfigurationMonitor.watch(this.getConfigurationKeys(), (values) =>
      this.applyConfiguration(values),
    );
  }

  protected applyConfiguration(configuration: ConfigurationSchema): void {
    this.configuration = configuration;
  }

  protected abstract getConfigurationKeys(): (keyof ConfigurationSchema)[];
}
