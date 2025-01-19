export abstract class Command<TArguments extends unknown[] = []> {
  public abstract readonly key: string;

  public readonly arguments: TArguments;

  public constructor(...args: TArguments) {
    this.arguments = args;
  }
}
