export abstract class Command<TArguments extends unknown[] = [], TResult = void> {
  public abstract readonly key: string;

  public readonly arguments: TArguments;

  public constructor(...args: TArguments) {
    this.arguments = args;
  }

  public abstract call<T>(afterCall?: (r: TResult) => T | Promise<T>): Promise<TResult>;
  public send<T>(afterCall?: (r: TResult) => T | Promise<T>): void {
    void this.call(afterCall);
  }
}
