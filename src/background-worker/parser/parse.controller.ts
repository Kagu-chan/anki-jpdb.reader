import { MessageSender } from '@shared/extension/types';
import { JPDBToken } from '@shared/jpdb/types';
import { SequenceErrorCommand } from '@shared/messages/foreground/sequence-error.command';
import { SequenceSuccessCommand } from '@shared/messages/foreground/sequence-success.command';
import { Parser } from './parser';
import { Batch, Handle } from './parser.types';
import { WorkerQueue } from './worker-queue';

export class ParseController {
  private BATCH_SIZE = 16384;
  private JPDB_TIMEOUT = 200;

  private _pendingParagraphs = new Map<number, Handle>();
  private _workerQueue = new WorkerQueue();

  public abortSequence(sequence: number): void {
    this._pendingParagraphs.delete(sequence);
  }

  public parseSequences(sender: MessageSender, data: [sequenceId: number, text: string][]): void {
    data.forEach(([sequenceId, text]) => this.queueParagraph(sequenceId, sender, text));

    this.queueBatches(this.getParagraphBatches());
  }

  private queueParagraph(sequenceId: number, sender: MessageSender, text: string): void {
    const promise = new Promise<JPDBToken[]>((resolve, reject) => {
      this._pendingParagraphs.set(sequenceId, {
        resolve,
        reject,
        text,
        length: new TextEncoder().encode(text).length + 7,
      });
    });

    promise
      .then((tokens) => this.succeedSequence(sequenceId, tokens, sender))
      .catch((e: Error) => this.failSequence(sequenceId, e, sender))
      .finally(() => this._pendingParagraphs.delete(sequenceId));
  }

  private succeedSequence(sequenceId: number, tokens: JPDBToken[], sender: MessageSender): void {
    new SequenceSuccessCommand(sequenceId, tokens).send(sender.tab!.id!);
  }

  private failSequence(sequenceId: number, error: Error, sender: MessageSender): void {
    new SequenceErrorCommand(sequenceId, error.message).send(sender.tab!.id!);
  }

  private getParagraphBatches(): Batch[] {
    const batches: Batch[] = [];

    let currentBatch: Batch = { strings: [], handles: [] };
    let length = 0;

    for (const [seq, paragraph] of this._pendingParagraphs) {
      length += paragraph.length;

      if (length > this.BATCH_SIZE) {
        batches.push(currentBatch);
        currentBatch = { strings: [], handles: [] };
        length = paragraph.length;
      }

      currentBatch.strings.push(paragraph.text);
      currentBatch.handles.push(paragraph);

      this._pendingParagraphs.delete(seq);
    }

    if (currentBatch.strings.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  private queueBatches(batches: Batch[]): void {
    for (const batch of batches) {
      this._workerQueue.push(
        () => new Parser(batch).parse(),
        (e) => batch.handles.forEach((handle) => handle.reject(e)),
        this.JPDB_TIMEOUT,
      );
    }
  }
}
