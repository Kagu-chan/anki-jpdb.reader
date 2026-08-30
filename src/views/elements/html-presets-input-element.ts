import { getFullConfiguration } from '@shared/configuration/get-configuration';
import { STATIC_PRESETS } from '@shared/style-presets/static-presets';
import { StylePreset } from '@shared/style-presets/types';
import { CheckboxListInput } from './lib/checkbox-list.input';

export class HTMLPresetsInputElement extends CheckboxListInput<StylePreset> {
  protected allowInspect = true;
  protected invertList = false;
  protected dense = true;

  protected getRows(): StylePreset[] {
    return STATIC_PRESETS;
  }

  protected async getInspectContent(item: StylePreset): Promise<string> {
    const config = await getFullConfiguration();

    return item.css(config);
  }
}
