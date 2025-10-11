import { ConfigurationSchema } from '@shared/configuration/types';
import { JPDBCard, JPDBGrade } from '@shared/jpdb/types';
import { GradeCardCommand } from '@shared/messages/background/grade-card.command';
import { BaseController } from './base-controller';

export class GradingController extends BaseController {
  public get gradingEnabled(): boolean {
    return !this.configuration.jpdbDisableReviews;
  }

  public get showActions(): boolean {
    return this.configuration.showGradingActions && this.gradingEnabled;
  }

  public getGradingActions(): JPDBGrade[] {
    return this.configuration.jpdbUseTwoGrades
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

  protected getConfigurationKeys(): (keyof ConfigurationSchema)[] {
    return ['jpdbUseTwoGrades', 'jpdbDisableReviews', 'showGradingActions'];
  }
}
