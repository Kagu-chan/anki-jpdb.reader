import { getConfiguration } from '@shared/configuration/get-configuration';
import { Feature, FeatureImplementation } from '@shared/features/types';
import { matchUrl } from '@shared/match-url';

export async function getFeatures(): Promise<FeatureImplementation[]> {
  const isMainFrame = window === window.top;
  const enabledFeatures = await getConfiguration('enabledFeatures');
  const features: Record<string, [Feature, new () => FeatureImplementation]> = {};
  const active: FeatureImplementation[] = [];

  for (const featureId of enabledFeatures) {
    const feature = features[featureId];

    if (!feature) {
      continue;
    }

    const [featureDef, featureClass] = feature;

    if (!featureDef.allFrames && !isMainFrame) {
      continue;
    }

    const hostDef = featureDef.host;
    const host = Array.isArray(hostDef) ? hostDef : [hostDef];

    const isActive = feature && host.some((h) => matchUrl(h, window.location.href));

    if (isActive) {
      active.push(new featureClass());
    }
  }

  return active;
}
