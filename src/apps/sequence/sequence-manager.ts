import { receiveBackgroundMessage, fireToBackground } from '@shared/messages';
import { Canceled } from './canceled';
import { AbortableSequence, PreparedRequest, Sequence } from './types';

export class SequenceManager {
  private _nextSequenceId = 0;
  private _requests = new Map<number, PreparedRequest>();

  private get sequenceId(): number {
    return ++this._nextSequenceId;
  }

  constructor() {
    receiveBackgroundMessage('sequenceAborted', (sequenceId: number) =>
      this.handleBackgroundMessage(sequenceId, (request) => request.reject(new Canceled())),
    );
    receiveBackgroundMessage('sequenceError', (sequenceId: number, error: string) =>
      this.handleBackgroundMessage(sequenceId, (request) => request.reject(new Error(error))),
    );
    receiveBackgroundMessage('sequenceSuccess', (sequenceId: number, data: unknown[]) =>
      this.handleBackgroundMessage(sequenceId, (request) => request.resolve(data)),
    );
  }

  public getSequence<T>(data: T): Sequence<void, T> {
    const { sequenceId } = this;
    const promise = new Promise<void>((resolve, reject) => {
      this._requests.set(sequenceId, { resolve, reject });
    });

    return {
      sequenceId,
      promise,
      data,
    };
  }

  public getAbortableSequence<R, T>(data: T): AbortableSequence<R, T> {
    const { sequenceId } = this;
    const abortController = new AbortController();
    const promise = new Promise<R>((resolve, reject) => {
      abortController.signal.addEventListener('abort', () =>
        fireToBackground('abortRequest', sequenceId),
      );
      this._requests.set(sequenceId, { resolve, reject });
    });

    return {
      abort: () => abortController.abort(),
      sequenceId,
      promise,
      data,
    };
  }

  private handleBackgroundMessage(
    sequenceId: number,
    fn: (request: PreparedRequest) => void,
  ): void {
    const request = this._requests.get(sequenceId);

    if (!request) {
      return;
    }

    fn(request);
    this._requests.delete(sequenceId);
  }
}
