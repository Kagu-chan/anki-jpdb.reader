import { ConfigurationSchema } from '@shared/configuration/types';
import { JPDBCard, JPDBCardState } from '@shared/jpdb/types';
import { RunDeckActionCommand } from '@shared/messages/background/run-deck-action.command';
import { BaseController } from './base-controller';

export class RotationController extends BaseController {
  public get rotateFlags(): boolean {
    return this.configuration.jpdbRotateFlags;
  }

  public get showActions(): boolean {
    return this.configuration.showRotateActions && this.rotateFlags;
  }

  protected get remove(): boolean {
    return !this.configuration.jpdbRotateCycle;
  }

  protected get states(): (string | undefined)[] {
    const states = [
      this.configuration.jpdbCycleNeverForget ? 'neverForget' : undefined,
      this.configuration.jpdbCycleBlacklist ? 'blacklist' : undefined,
      this.configuration.jpdbCycleSuspended ? 'suspend' : undefined,
    ].filter(Boolean);

    return this.remove ? [...states, undefined] : states;
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

    return state.includes(JPDBCardState.NEVER_FORGET)
      ? 'neverForget'
      : state.includes(JPDBCardState.BLACKLISTED)
        ? 'blacklist'
        : state.includes(JPDBCardState.SUSPENDED)
          ? 'suspend'
          : undefined;
  }

  protected getConfigurationKeys(): (keyof ConfigurationSchema)[] {
    return [
      'jpdbRotateFlags',
      'jpdbCycleNeverForget',
      'jpdbCycleBlacklist',
      'jpdbCycleSuspended',
      'jpdbRotateCycle',
      'showRotateActions',
    ];
  }
}
