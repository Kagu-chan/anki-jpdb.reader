import { MessageSender } from '@shared/extension/types';
import { review } from '@shared/jpdb/review';
import { JPDBGrade } from '@shared/jpdb/types';
import { GradeCardCommand } from '@shared/messages/background/grade-card.command';
import { BackgroundCommandHandler } from '../lib/background-command-handler';

export class GradeCardCommandHandler extends BackgroundCommandHandler<GradeCardCommand> {
  public readonly command = GradeCardCommand;

  public async handle(
    sender: MessageSender,
    vid: number,
    sid: number,
    grade: JPDBGrade,
  ): Promise<void> {
    await review(grade, vid, sid);
  }
}
