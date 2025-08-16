import { getConfiguration } from '@shared/configuration/get-configuration';
import { JPDBCard, JPDBGrade } from '@shared/jpdb/types';
import { GradeCardCommand } from '@shared/messages/background/grade-card.command';
import { BaseController } from './base-controller';

export class GradingController extends BaseController {
  private _disableReviews: boolean;
  private _showActions: boolean;
  private _useTwoPointGrading: boolean;

  public get gradingEnabled(): boolean {
    return !this._disableReviews;
  }

  public get showActions(): boolean {
    return this._showActions && this.gradingEnabled;
  }

  public getGradingActions(): JPDBGrade[] {
    return this._useTwoPointGrading
      ? ['fail', 'pass']
      : ['nothing', 'something', 'hard', 'okay', 'easy'];
  }

  public gradeCard(card: JPDBCard, grade: JPDBGrade): void {
    if (!this.gradingEnabled || !this.getGradingActions().includes(grade)) {
      return;
    }

    const { vid, sid } = card;

    new GradeCardCommand(vid, sid, grade).send(() => this.updateCardState(card));
  }

  protected async applyConfiguration(): Promise<void> {
    this._useTwoPointGrading = await getConfiguration('jpdbUseTwoGrades');
    this._disableReviews = await getConfiguration('jpdbDisableReviews');
    this._showActions = await getConfiguration('showGradingActions');
  }
}
