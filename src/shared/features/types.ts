export interface FeatureImplementation {
  apply(): void;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  host: string | string[];
  allFrames: boolean;
}
