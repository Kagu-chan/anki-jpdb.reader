import { FEATURES } from '@shared/features/features';
import { Feature } from '@shared/features/types';
import { CheckboxListInput } from './lib/checkbox-list.input';

export class HTMLFeaturesInputElement extends CheckboxListInput<Feature> {
  protected allowInspect = false;
  protected invertList = false;
  protected dense = false;

  protected getRows(): Feature[] {
    return FEATURES;
  }
}
