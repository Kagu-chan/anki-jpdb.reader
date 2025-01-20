import { displayToast } from '@shared/dom/display-toast';
import { Registry } from '../integration/registry';
import { TriggerParser } from './trigger.parser';

export class NoParser extends TriggerParser {
  protected parsePage(): void {
    this.reject();
  }

  protected parseSelection(): void {
    this.reject();
  }

  protected reject(): void {
    if (!Registry.isMainFrame) {
      return;
    }

    displayToast('error', 'This page has been disabled for manual parsing.');
  }
}
