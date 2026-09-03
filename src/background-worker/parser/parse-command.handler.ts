import { ConfigurationMonitor } from '@shared/configuration/configuration-monitor';
import { getConfiguration } from '@shared/configuration/get-configuration';
import { injectStyle } from '@shared/extension/inject-style';
import { openOptionsPage } from '@shared/extension/open-options-page';
import { MessageSender } from '@shared/extension/types';
import { ParseCommand } from '@shared/messages/background/parse.command';
import { ToastCommand } from '@shared/messages/foreground/toast.command';
import { computeWordCss } from '@shared/style-presets/compute-word-css';
import { BackgroundCommandHandler } from '../lib/background-command-handler';
import { ParseController } from './parse.controller';

export class ParseCommandHandler extends BackgroundCommandHandler<ParseCommand> {
  public readonly command = ParseCommand;

  private _failToast = new ToastCommand(
    'error',
    'JPDB API key is not set. Please set it in the extension settings.',
  );

  constructor(private _parseController: ParseController) {
    super();
  }

  public async handle(
    sender: MessageSender,
    data: [sequenceId: number, text: string][],
  ): Promise<void> {
    const jpdbApiKey = await getConfiguration('jpdbApiToken');

    if (!jpdbApiKey?.length) {
      await this._failToast.call(sender.tab!.id!);
      await openOptionsPage();

      return;
    }

    ConfigurationMonitor.watch(
      [
        'topXMark',
        'frequentColor',
        'iPlus1Mark',
        'iPlusOneColor',
        'customWordCSS',
        'enableStylePresets',
        'stylePresets',
        'stateCategories',
        'baseStylingMode',
        'baseColor',
        'jpdbColorLocked',
        'jpdbColorSuspended',
        'jpdbColorBlacklisted',
        'jpdbColorNeverForget',
        'jpdbColorNotInDeck',
        'jpdbColorNew',
        'jpdbColorLearning',
        'jpdbColorKnown',
        'jpdbColorDue',
        'jpdbColorFailed',
        'categoryColorUnmined',
        'categoryColorNew',
        'categoryColorLearning',
        'categoryColorKnown',
        'highlightMisparsed',
        'misparsedColor',
        'highlightPitchAccent',
        'pitchColorHeiban',
        'pitchColorAtamadaka',
        'pitchColorNakadaka',
        'pitchColorOdaka',
        'pitchColorKifuku',
        'furiganaUnminedWords',
        'furiganaNewWords',
        'furiganaLearningWords',
        'furiganaKnownWords',
        'furiganaUnrelatedWords',
        'skipFurigana',
      ],
      async (config) => {
        await injectStyle(sender.tab!.id!, 'word', computeWordCss(config));
      },
    );

    this._parseController.parseSequences(sender, data);
  }
}
