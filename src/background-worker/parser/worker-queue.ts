type Item = {
  fn: () => Promise<void>;
  onFail: (error: Error) => void;
  wait?: number;
};

export class WorkerQueue {
  private _stack: Item[] = [];
  private _isProcessing = false;

  public push(fn: () => Promise<void>, onFail: (error: Error) => void, wait?: number): void {
    this._stack.push({ fn, onFail, wait });

    void this.process();
  }

  private async process(): Promise<void> {
    if (this._stack.length === 0 || this._isProcessing) {
      return;
    }

    this._isProcessing = true;

    const { fn, onFail, wait } = this._stack.shift()!;

    try {
      await fn();
    } catch (error) {
      onFail(error as Error);
    }

    if (wait) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    this._isProcessing = false;

    await this.process();
  }
}
