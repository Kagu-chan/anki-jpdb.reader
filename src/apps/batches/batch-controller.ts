import { displayToast } from '@shared/dom';
import { JPDBToken } from '@shared/jpdb';
import { sendToBackground } from '@shared/messages';
import { Registry } from '../integration/registry';
import { Canceled } from '../sequence/canceled';
import { AbortableSequence } from '../sequence/types';
import { applyTokens } from './apply-tokens';
import { getParagraphs } from './get-paragraphs';
import { Paragraph } from './types';

export class BatchController {
  private _pendingBatches = new Map<Node, AbortableSequence<JPDBToken[], Paragraph>[]>();

  public registerNodes(
    nodes: (Element | Node)[],
    filter?: (node: Element | Node) => boolean,
    onEmpty?: (node: Element | Node) => void,
  ): void {
    nodes.forEach((node) => this.registerNode(node, filter, onEmpty));
  }

  public registerNode(
    node: Element | Node,
    filter?: (node: Element | Node) => boolean,
    onEmpty?: (node: Element | Node) => void,
  ): void {
    if (this._pendingBatches.has(node)) {
      return;
    }

    const paragraphs = getParagraphs(node, filter);

    if (!paragraphs.length) {
      return onEmpty?.(node);
    }

    this.prepareNode(node, paragraphs);
  }

  public dismissNode(node: Node): void {
    this._pendingBatches.get(node)?.forEach((batch) => batch.abort());
    this._pendingBatches.delete(node);
  }

  public parseBatches(): void {
    const batches = Array.from(this._pendingBatches.values());
    const sequences = batches.flatMap((b) => b);
    const sequenceData = sequences.map(
      (s) => [s.sequenceId, s.data.map((f) => f.node.data).join('')] as [number, string],
    );

    void sendToBackground('parse', sequenceData);

    this._pendingBatches.clear();
  }

  private prepareNode(node: Element | Node, paragraphs: Paragraph[]): void {
    const batches = paragraphs.map((paragraph) =>
      Registry.sequenceManager.getAbortableSequence<JPDBToken[], Paragraph>(paragraph),
    );

    this._pendingBatches.set(node, batches);
    this.prepareBatches(node);
  }

  private prepareBatches(node: HTMLElement | Node): void {
    const batches = this._pendingBatches.get(node)!;

    batches.forEach((batch) => {
      void batch.promise
        .then((value) => {
          applyTokens(batch.data, value);
        })
        .catch((error) => {
          if (error instanceof Canceled) {
            return;
          }

          // eslint-disable-next-line no-console
          console.error(error);

          displayToast('error', 'An error occurred while parsing the text');
        });
    });
  }
}
