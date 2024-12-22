import { getConfiguration } from '@shared/configuration';
import { onBroadcastMessage } from '@shared/messages';
import { IntegrationScript } from '../integration-script';
import { KeybindManager } from '../keybind-manager';
import { GradingActions } from './grading-actions';
import { MiningActions } from './mining-actions';

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

  private _currentContext?: HTMLElement;
  private _showPopupOnHover = false;

  private constructor() {
    super();

    void this.setup();
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
    const target = event.target as HTMLElement;

    if (this._currentContext === target) {
      return;
    }

    if (!target?.ajbContext) {
      return;
    }

    this._currentContext = target;

    this._keyManager.activate();
    this._miningActions.activate(this._currentContext);
    this._gradingActions.activate(this._currentContext);

    if (this._showPopupOnHover) {
      this.showPopup();
    }
  }

  /**
   * Leave the current context. Deactivates keybinds. If the popup currently open, it will be hidden after a short delay
   *
   * @returns {void}
   */
  public leave(): void {
    this._currentContext = undefined;

    this._keyManager.deactivate();
    this._miningActions.deactivate();
    this._gradingActions.deactivate();

    // TODO: Hide Popup
    // TODO: Start timeout to hide popup
  }

  private async setup(): Promise<void> {
    this._showPopupOnHover = await getConfiguration('showPopupOnHover');

    this._keyManager = new KeybindManager(['showPopupKey', 'showAdvancedDialogKey']);
    this._miningActions = new MiningActions();
    this._gradingActions = new GradingActions(this._miningActions);

    this.on('showPopupKey', () => {
      if (this._showPopupOnHover) {
        return;
      }

      this.showPopup();
    });
    this.on('showAdvancedDialogKey', () => this.showAdvancedDialog());

    onBroadcastMessage('configurationUpdated', async () => {
      this._showPopupOnHover = await getConfiguration('showPopupOnHover');
    });
  }

  private showPopup(): void {
    // TODO: Cancel the timeout if it is running
    // TODO: Show the poup
    // eslint-disable-next-line no-console
    console.log('showPopup');
  }

  private showAdvancedDialog(): void {
    // TODO: Show the advanced dialog
  }
}
