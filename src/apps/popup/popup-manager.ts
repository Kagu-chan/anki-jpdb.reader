import { getConfiguration } from '@shared/configuration/get-configuration';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { KeybindManager } from '../integration/keybind-manager';
import { Registry } from '../integration/registry';
import { GradingActions } from './grading-actions';
import { MiningActions } from './mining-actions';
import { Popup } from './popup';

export class PopupManager {
  private _keyManager = new KeybindManager(['showPopupKey', 'showAdvancedDialogKey']);
  private _miningActions = new MiningActions();
  private _gradingActions = new GradingActions(this._miningActions);
  private _popup = new Popup();

  private _showPopupOnHover: boolean;
  private _currentHover?: HTMLElement;

  constructor() {
    onBroadcastMessage(
      'configurationUpdated',
      async () => {
        this._showPopupOnHover = await getConfiguration('showPopupOnHover', true);
      },
      true,
    );

    Registry.events.on('showPopupKey', () => this.handlePopup());
    Registry.events.on('showAdvancedDialogKey', () => this.handleAdvancedDialog());
  }

  /**
   * Register a node for keybinds and the popup itself. Shows the popup if configured to do so.
   *
   * @param {MouseEvent} event The mouse event containing the target node
   * @returns {void}
   */
  public enter(event: MouseEvent): void {
    const { target } = event;

    if (!target) {
      return;
    }

    this._currentHover = target as HTMLElement;

    this._keyManager.activate();
    this._miningActions.activate(this._currentHover);
    this._gradingActions.activate(this._currentHover);

    if (this._showPopupOnHover) {
      this.handlePopup();
    }
  }

  /**
   * Leave the current context. Deactivates keybinds. If the popup currently open, it will be hidden after a short delay
   *
   * @returns {void}
   */
  public leave(): void {
    this._currentHover = undefined;

    this._keyManager.deactivate();
    this._miningActions.deactivate();
    this._gradingActions.deactivate();

    this._popup.initHide();
  }

  /**
   * Event handler is reached if an element is hovered and the keybind for popup is pressed.
   * Also called if the popup is configured to show on hover and the mouse is moved over an element.
   *
   * @returns
   */
  private handlePopup(): void {
    if (!this._currentHover) {
      return;
    }

    // TODO: Implement touchscreen support
    this._popup.show(this._currentHover);
  }

  private handleAdvancedDialog(): void {
    // TODO: Show the advanced dialog
  }
}
