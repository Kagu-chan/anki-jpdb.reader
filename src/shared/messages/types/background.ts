import { MessageSender } from '../../extension';
import { JPDBGrade } from '../../jpdb/types';

/**
 * Defines events emitted from the browser to the extension
 */
export interface BackgroundEvents {
  parse: [[data: [sequenceId: number, text: string][]], void];
  lookupText: [[text: string], void];
  abortRequest: [[sequence: number], Promise<void>];
  updateCardState: [[vid: number, sid: number], void];
  runDeckAction: [
    [
      vid: number,
      sid: number,
      key: 'mining' | 'blacklist' | 'neverForget',
      action: 'add' | 'remove',
    ],
    void,
  ];
  gradeCard: [[vid: number, sid: number, grade: JPDBGrade], void];
}
export type BackgroundEventArgs<T extends keyof BackgroundEvents> = BackgroundEvents[T][0];
export type BackgroundEventResult<T extends keyof BackgroundEvents> = BackgroundEvents[T][1];
export type BackgroundEventFunction<T extends keyof BackgroundEvents = keyof BackgroundEvents> = (
  sender: MessageSender,
  ...args: BackgroundEventArgs<T>
) => BackgroundEventResult<T>;
