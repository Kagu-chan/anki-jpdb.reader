import { getConfiguration } from '@shared/configuration/get-configuration';
import { injectStyle } from '@shared/extension/inject-style';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { MessageSender } from '@shared/extension/types';
import { JPDBToken } from '@shared/jpdb/types';
import { SequenceAbortedCommand } from '@shared/messages/foreground/sequence-aborted.command';
import { SequenceErrorCommand } from '@shared/messages/foreground/sequence-error.command';
import { SequenceSuccessCommand } from '@shared/messages/foreground/sequence-success.command';
import { ToastCommand } from '@shared/messages/foreground/toast.command';
import { receiveTabMessage } from '@shared/messages/receiving/receive-tab-message';
import { queueRequest } from '../queue-request';
import { Parser } from './parser';
import { Batch, Handle } from './parser.types';

const BATCH_SIZE = 16384;
const JPDB_TIMEOUT = 200;

const pendingParagraphs = new Map<number, Handle>();

const queueParagraph = (
  sequenceId: number,
  sender: MessageSender,
  text: string,
): Promise<unknown> =>
  new Promise<JPDBToken[]>((resolve, reject) =>
    pendingParagraphs.set(sequenceId, {
      resolve,
      reject,
      text,
      length: new TextEncoder().encode(text).length + 7,
    }),
  )
    .then((tokens) => new SequenceSuccessCommand(sequenceId, tokens).call(sender.tab!.id!))
    .catch((e: Error) => new SequenceErrorCommand(sequenceId, e.message).call(sender.tab!.id!))
    .finally(() => pendingParagraphs.delete(sequenceId));

const createParagraphBatches = (): Batch[] => {
  const batches: Batch[] = [];

  let currentBatch: Batch = { strings: [], handles: [] };
  let length = 0;

  for (const [seq, paragraph] of pendingParagraphs) {
    length += paragraph.length;

    if (length > BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = { strings: [], handles: [] };
      length = paragraph.length;
    }

    currentBatch.strings.push(paragraph.text);
    currentBatch.handles.push(paragraph);

    pendingParagraphs.delete(seq);
  }

  if (currentBatch.strings.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};

export const installParser = (): void => {
  receiveTabMessage('parse', async (sender, data): Promise<void> => {
    const jpdbApiKey = await getConfiguration('jpdbApiToken', false);
    const customWordCSS = await getConfiguration('customWordCSS', true);

    if (!jpdbApiKey) {
      await new ToastCommand(
        'error',
        'JPDB API key is not set. Please set it in the extension settings.',
      ).call(sender.tab!.id!);
      await openOptionsPage();

      return;
    }

    await injectStyle(sender.tab!.id!, 'word', customWordCSS);

    // Queue all paragraphs for parsing - those can then be packed into a batch
    data.forEach(([sequenceId, text]) => void queueParagraph(sequenceId, sender, text));

    // Pack paragraphs into batches to reduce the amount of API calls.
    // Also, this improves the parsing due to the context
    const batches = createParagraphBatches();

    if (batches.length) {
      // Each batch now contains a set of paragraphs that can be parsed in one go
      // Those get parsed, then remapped to its original sequence and resolved there
      for (const batch of batches) {
        queueRequest((): Promise<void> => {
          const parser = new Parser(batch);

          return parser.parse();
        }, JPDB_TIMEOUT).catch((e: Error) => {
          for (const handle of batch.handles) {
            handle.reject(e);
          }
        });
      }
    }
  });

  receiveTabMessage('abortRequest', async (sender, sequence): Promise<void> => {
    pendingParagraphs.delete(sequence);

    await new SequenceAbortedCommand(sequence).call(sender.tab!.id!);
  });
};
