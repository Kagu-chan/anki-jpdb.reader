import { JPDBGrade } from '../../jpdb/types';
import { BackgroundCommand } from '../lib/background-command';

export class GradeCardCommand extends BackgroundCommand<
  [vid: number, sid: number, grade: JPDBGrade]
> {
  public readonly key = 'gradeCard';
}
