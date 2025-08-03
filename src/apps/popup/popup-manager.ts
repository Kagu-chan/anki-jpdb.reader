import { getConfiguration } from '@shared/configuration/get-configuration';
import { onBroadcastMessage } from '@shared/messages/receiving/on-broadcast-message';
import { KeybindManager } from '../integration/keybind-manager';
import { Registry } from '../integration/registry';
import { GradingActions } from './actions/grading-actions';
import { GradingController } from './actions/grading-controller';
import { MiningActions } from './actions/mining-actions';
import { MiningController } from './actions/mining-controller';
import { RotationActions } from './actions/rotation-actions';
import { RotationController } from './actions/rotation-controller';
import { Popup } from './popup';

export class PopupManager {
  private _keyManager = new KeybindManager(['showPopupKey', 'showAdvancedDialogKey']);

  private _miningController = new MiningController();
  private _rotationController = new RotationController();
  private _gradingController = new GradingController();

  private _miningActions = new MiningActions(this._miningController);
  private _rotationActions = new RotationActions(this._rotationController);
  private _gradingActions = new GradingActions(this._gradingController);

  private _popup = new Popup(
    this._miningController,
    this._rotationController,
    this._gradingController,
  );

  private _showPopupOnHover: boolean;
  private _touchscreenSupport: boolean;
  private _currentHover?: HTMLElement;
  private _currentSentence?: string;

  private _observer = new MutationObserver((m) => {
    // the parent of the currently hovered object is monitored.
    // We want to hide the popup if the currently hovered object is removed from the DOM
    if (m[0].removedNodes.length > 0 && m[0].removedNodes[0] === this._currentHover) {
      this._popup.hide();
    }
  });

  constructor() {
    onBroadcastMessage(
      'configurationUpdated',
      async () => {
        this._showPopupOnHover = await getConfiguration('showPopupOnHover', true);
        this._touchscreenSupport = await getConfiguration('touchscreenSupport', false);
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
  public enter(event: MouseEvent, sentence?: string): void {
    const { target } = event;

    if (!target) {
      return;
    }

    this._currentHover = target as HTMLElement;
    this._currentSentence = sentence;

    this._keyManager.activate();
    this._miningActions.activate(this._currentHover, sentence);
    this._rotationActions.activate(this._currentHover);
    this._gradingActions.activate(this._currentHover);

    if (this._showPopupOnHover) {
      this.handlePopup();
    }
  }

  public touch(event: MouseEvent, sentence?: string): void {
    let target: HTMLElement | null = event.target as HTMLElement;

    if (!target?.classList?.contains('jpdb-word')) {
      target = target?.closest('.jpdb-word');
    }

    if (!this._touchscreenSupport || !target || Registry.skipTouchEvents) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this._currentHover = target;
    this._currentSentence = sentence;

    this._keyManager.activate();
    this._miningActions.activate(this._currentHover, sentence);
    this._rotationActions.activate(this._currentHover);
    this._gradingActions.activate(this._currentHover);

    this.handlePopup();
  }

  /**
   * Leave the current context. Deactivates keybinds. If the popup currently open, it will be hidden after a short delay
   *
   * @returns {void}
   */
  public leave(): void {
    this._currentHover = undefined;
    this._currentSentence = undefined;

    this._keyManager.deactivate();
    this._miningActions.deactivate();
    this._rotationActions.deactivate();
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

    this._popup.show(this._currentHover, this._currentSentence);

    if (this._currentHover.parentElement) {
      this._observer.observe(this._currentHover.parentElement, { childList: true });
    }
  }

  private handleAdvancedDialog(): void {
    // TODO: Show the advanced dialog
  }
}
