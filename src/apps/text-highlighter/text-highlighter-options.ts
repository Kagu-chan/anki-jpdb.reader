import { ConfigurationMonitor } from '@shared/configuration/configuration-monitor';
import { ConfigurationSchema } from '@shared/configuration/types';
import { StateCategories } from '@shared/jpdb/types';

export class TextHighlighterOptions {
  public readonly initialized = ConfigurationMonitor.watch(
    [
      'skipFurigana',
      'generatePitch',
      'topXMark',
      'topXMarkAll',
      'topXMarkCount',
      'iPlus1Mark',
      'iPlus1MarkOnlyFrequent',
      'iPlus1EvalAgainstKnown',
      'iPlus1MinSentenceLen',
      'stateCategories',
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
    | 'topXMark'
    | 'topXMarkAll'
    | 'topXMarkCount'
    | 'iPlus1Mark'
    | 'iPlus1MarkOnlyFrequent'
    | 'iPlus1EvalAgainstKnown'
    | 'iPlus1MinSentenceLen'
    | 'stateCategories'
  >;

  public get skipFurigana(): boolean {
    return this.configuration?.skipFurigana ?? false;
  }

  public get generatePitch(): boolean {
    return this.configuration?.generatePitch ?? false;
  }

  public get topXMark(): boolean {
    return this.configuration?.topXMark ?? false;
  }

  public get topXMarkAll(): boolean {
    return this.configuration?.topXMarkAll ?? false;
  }

  public get topXMarkCount(): number {
    return this.configuration?.topXMarkCount ?? Infinity;
  }

  public get iPlus1Mark(): boolean {
    return this.configuration?.iPlus1Mark ?? false;
  }

  public get iPlus1MarkOnlyFrequent(): boolean {
    return this.configuration?.iPlus1MarkOnlyFrequent ?? false;
  }

  public get iPlus1EvalAgainstKnown(): boolean {
    return this.configuration?.iPlus1EvalAgainstKnown ?? true;
  }

  public get iPlus1MinSentenceLen(): number {
    return this.configuration?.iPlus1MinSentenceLen ?? 3;
  }

  public get stateCategories(): StateCategories {
    return this.configuration?.stateCategories ?? {};
  }
}
