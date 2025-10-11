import { ConfigurationMonitor } from '@shared/configuration/configuration-monitor';
import { ConfigurationSchema } from '@shared/configuration/types';

export class TextHighlighterOptions {
  public readonly initialized = ConfigurationMonitor.watch(
    [
      'skipFurigana',
      'generatePitch',
      'markTopX',
      'markTopXCount',
      'markAllTypes',
      'markIPlus1',
      'minSentenceLength',
      'markOnlyFrequent',
      'newStates',
    ],
    (values) => {
      this.configuration = values;
    },
    true,
  );

  private configuration?: Pick<
    ConfigurationSchema,
    | 'skipFurigana'
    | 'generatePitch'
    | 'markTopX'
    | 'markTopXCount'
    | 'markAllTypes'
    | 'markIPlus1'
    | 'minSentenceLength'
    | 'markOnlyFrequent'
    | 'newStates'
  >;

  public get skipFurigana(): boolean {
    return this.configuration?.skipFurigana ?? false;
  }

  public get generatePitch(): boolean {
    return this.configuration?.generatePitch ?? false;
  }

  public get markFrequency(): number | false {
    if (!this.configuration) {
      return false;
    }

    return this.configuration.markTopX ? this.configuration.markTopXCount : false;
  }

  public get markIPlus1(): boolean {
    return this.configuration?.markIPlus1 ?? false;
  }

  public get markAll(): boolean {
    return this.configuration?.markAllTypes ?? false;
  }

  public get markOnlyFrequent(): boolean {
    return this.configuration?.markOnlyFrequent ?? false;
  }

  public get minSentenceLength(): number {
    return this.configuration?.minSentenceLength ?? 3;
  }

  public get newStates(): string[] {
    return this.configuration?.newStates ?? [];
  }
}
