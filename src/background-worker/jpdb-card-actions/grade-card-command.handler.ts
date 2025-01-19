import { MessageSender } from '@shared/extension';
import { JPDBGrade, review } from '@shared/jpdb';
import { GradeCardCommand } from '@shared/messages';
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
