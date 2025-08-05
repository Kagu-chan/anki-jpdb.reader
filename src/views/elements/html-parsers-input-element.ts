import { DEFAULT_HOSTS } from '@shared/host-meta/default-hosts';
import { PredefinedHostMeta } from '@shared/host-meta/types';
import { CheckboxListInput } from './lib/checkbox-list.input';

export class HTMLParsersInputElement extends CheckboxListInput<PredefinedHostMeta> {
  protected allowInspect = true;
  protected invertList = true;

  protected getRows(): PredefinedHostMeta[] {
    return DEFAULT_HOSTS.filter((host) => host.optOut);
  }
}
