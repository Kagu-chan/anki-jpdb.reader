import { getHostMeta } from '@shared/host-meta/get-host-meta';
import { HostMeta } from '@shared/host-meta/types';

export class HostEvaluator {
  private _isMainFrame = window === window.top;

  private _targetedTriggerMeta: HostMeta | undefined;
  private _targetedAutomaticMeta: HostMeta[];

  private _defaultTriggerMeta: HostMeta | undefined;
  private _defaultAutomaticMeta: HostMeta[];

  private _host: string;

  public get relevantMeta(): HostMeta[] {
    const result: HostMeta[] = [];

    if (this._targetedTriggerMeta) {
      result.push(this._targetedTriggerMeta);
    }

    if (this._targetedAutomaticMeta.length) {
      result.push(...this._targetedAutomaticMeta);
    }

    if (!result.length && this._defaultTriggerMeta) {
      result.push(this._defaultTriggerMeta);
    }

    result.push(...this._defaultAutomaticMeta);

    const seen = new Set<string>();

    return result.filter((meta) => {
      const id = ('id' in meta && meta.id) || JSON.stringify(meta);

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    });
  }

  public get canBeTriggered(): boolean {
    if (this._targetedTriggerMeta?.disabled || this._targetedAutomaticMeta.length) {
      return false;
    }

    return !!this.relevantMeta.length;
  }

  public get rejectionReason(): HostMeta {
    return this._targetedTriggerMeta!;
  }

  constructor() {
    this._host = window.location.href;
  }

  public async load(): Promise<HostEvaluator> {
    this._targetedTriggerMeta = await getHostMeta(
      this._host,
      'targetedTrigger',
      ({ auto, host, allFrames }) =>
        !auto && host !== '<all_urls>' && (allFrames || this._isMainFrame),
    );
    this._targetedAutomaticMeta = await getHostMeta(
      this._host,
      'targetedAutomatic',
      ({ auto, host, allFrames }) =>
        auto && host !== '<all_urls>' && (allFrames || this._isMainFrame),
      true,
    );

    this._defaultTriggerMeta = await getHostMeta(
      this._host,
      'defaultTrigger',
      ({ auto, host, allFrames }) =>
        auto === false && host === '<all_urls>' && (allFrames || this._isMainFrame),
    );
    this._defaultAutomaticMeta = await getHostMeta(
      this._host,
      'defaultAutomatic',
      ({ auto, host, allFrames }) =>
        auto && host === '<all_urls>' && (allFrames || this._isMainFrame),
      true,
    );

    return this;
  }
}
