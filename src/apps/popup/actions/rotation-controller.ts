import { getConfiguration } from '@shared/configuration/get-configuration';
import { JPDBCard } from '@shared/jpdb/types';
import { RunDeckActionCommand } from '@shared/messages/background/run-deck-action.command';
import { BaseController } from './base-controller';

export class RotationController extends BaseController {
  private _jpdbRotateFlags = false;
  private _neverForget: boolean;
  private _blacklist: boolean;
  private _suspend: boolean;
  private _remove: boolean;
  private _showActions: boolean;

  public get rotateFlags(): boolean {
    return this._jpdbRotateFlags;
  }

  public get showActions(): boolean {
    return this._showActions && this.rotateFlags;
  }

  protected get states(): (string | undefined)[] {
    const states = [
      this._neverForget ? 'neverForget' : undefined,
      this._blacklist ? 'blacklist' : undefined,
      this._suspend ? 'suspend' : undefined,
    ].filter(Boolean);

    return this._remove ? [...states, undefined] : states;
  }

  public rotate(card: JPDBCard, direction: 1 | -1): void {
    if (!this.rotateFlags) {
      return;
    }

    const next = this.getNextCardState(card, direction);
    const instructions = this.getInstructions(card, next);

    this.suspendUpdateWordStates();

    const executeInstructions = (index: number): void => {
      if (index < instructions.length) {
        instructions[index].send(() => executeInstructions(index + 1));
      } else {
        this.resumeUpdateWordStates(card);
      }
    };

    executeInstructions(0);
  }

  public getNextCardState(card: JPDBCard, direction: 1 | -1): string | undefined {
    const current = this.getCurrentCardState(card);
    const currentIndex = this.states.indexOf(current);

    let nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : this.states.length - 1
        : (currentIndex + direction) % this.states.length;

    if (nextIndex < 0) {
      nextIndex = this.states.length - 1;
    }

    const nextState = this.states[nextIndex];

    return nextState;
  }

  protected getInstructions(card: JPDBCard, nextState: string | undefined): RunDeckActionCommand[] {
    const instructions: RunDeckActionCommand[] = [];

    this.states.filter(Boolean).forEach((state) => {
      instructions.push(
        new RunDeckActionCommand(
          card.vid,
          card.sid,
          state! as 'neverForget' | 'blacklist' | 'suspend',
          state === nextState ? 'add' : 'remove',
        ),
      );
    });

    return instructions;
  }

  protected getCurrentCardState(card: JPDBCard): string | undefined {
    const state = card.cardState ?? [];

    return state.includes('never-forget')
      ? 'neverForget'
      : state.includes('blacklisted')
        ? 'blacklist'
        : state.includes('suspended')
          ? 'suspend'
          : undefined;
  }

  protected async applyConfiguration(): Promise<void> {
    this._jpdbRotateFlags = await getConfiguration('jpdbRotateFlags');

    this._neverForget = await getConfiguration('jpdbCycleNeverForget');
    this._blacklist = await getConfiguration('jpdbCycleBlacklist');
    this._suspend = await getConfiguration('jpdbCycleSuspended');

    this._remove = !(await getConfiguration('jpdbRotateCycle'));

    this._showActions = await getConfiguration('showRotateActions');
  }
}
