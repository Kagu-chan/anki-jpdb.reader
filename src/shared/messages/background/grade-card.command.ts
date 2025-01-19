import { JPDBGrade } from '@shared/jpdb';
import { BackgroundCommand } from './background-command';

export class GradeCardCommand extends BackgroundCommand<
  [vid: number, sid: number, grade: JPDBGrade]
> {
  public readonly key = 'gradeCard';
}
