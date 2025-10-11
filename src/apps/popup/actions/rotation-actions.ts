import { JPDBCard } from '@shared/jpdb/types';
import { KeybindManager } from '../../integration/keybind-manager';
import { Registry } from '../../integration/registry';
import { RotationController } from './rotation-controller';

/**
 * Handles keybinds for rotating flags on cards.
 */
export class RotationActions {
  private _keyManager = new KeybindManager(['jpdbRotateForward', 'jpdbRotateBackward']);
  private _card?: JPDBCard;

  constructor(private _controller: RotationController) {
    const { events } = Registry;

    events.on('jpdbRotateForward', () => this.rotateFlags(true));
    events.on('jpdbRotateBackward', () => this.rotateFlags(false));
  }

  public activate(context: HTMLElement): void {
    this._card = Registry.getCardFromElement(context);
    this._keyManager.activate();
  }

  public deactivate(): void {
    this._card = undefined;
    this._keyManager.deactivate();
  }

  private rotateFlags(forward: boolean): void {
    if (!this._card) {
      return;
    }

    this._controller.rotate(this._card, forward ? 1 : -1);
  }
}
