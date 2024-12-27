import { getConfiguration } from '@shared/configuration';
import { onBroadcastMessage } from '@shared/messages';
import { IntegrationScript } from '../integration-script';
import { KeybindManager } from '../keybind-manager';
import { GradingActions } from './grading-actions';
import { MiningActions } from './mining-actions';
import { Popup } from './popup';

export class PopupManager extends IntegrationScript {
  private static _instance: PopupManager;

  public static get instance(): PopupManager {
    if (!this._instance) {
      this._instance = new PopupManager();
    }

    return this._instance;
  }

  private _keyManager: KeybindManager;
  private _miningActions: MiningActions;
  private _gradingActions: GradingActions;

  private _showPopupOnHover: boolean;
  private _touchscreenSupport: boolean;

  private _popup = new Popup();

  private _currentHover?: HTMLElement;
  private _currentHoverPosition?: { x: number; y: number };

  private constructor() {
    super();

    onBroadcastMessage(
      'configurationUpdated',
      async () => {
        this._showPopupOnHover = await getConfiguration('showPopupOnHover');
        this._touchscreenSupport = await getConfiguration('touchscreenSupport');
      },
      true,
    );

    this._keyManager = new KeybindManager(['showPopupKey', 'showAdvancedDialogKey']);
    this._miningActions = new MiningActions();
    this._gradingActions = new GradingActions(this._miningActions);

    this.on('showPopupKey', () => this.handlePopup());
    this.on('showAdvancedDialogKey', () => this.handleAdvancedDialog());
  }

  /**
   * Initialize the PopupManager without using the instance
   *
   * This is useful to do promise based setup in the background while we wait for other things to finish
   */
  public static initialize(): void {
    // Touch the instance to initialize it
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    PopupManager.instance;
  }

  /**
   * Register a node for keybinds and the popup itself. Shows the popup if configured to do so.
   *
   * @param {MouseEvent} event The mouse event containing the target node
   * @returns {void}
   */
  public enter(event: MouseEvent): void {
    const { target, x, y } = event;

    if (!target) {
      return;
    }

    this._currentHover = target as HTMLElement;
    this._currentHoverPosition = { x, y };

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
    this._currentHoverPosition = undefined;

    this._keyManager.deactivate();
    this._miningActions.deactivate();
    this._gradingActions.deactivate();
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

    this._popup.show(this._currentHover);
  }

  private handleAdvancedDialog(): void {
    // TODO: Show the advanced dialog
  }
}
