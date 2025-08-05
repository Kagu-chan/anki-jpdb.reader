import { FeatureImplementation } from '@shared/features/types';

export class CrunchyrollFeature implements FeatureImplementation {
  public apply(): void {
    // Inject CSS to hide the #velocity-canvas (the subtitles) and [data-testid="vilos-settings_texttrack_submenu"] (the subtitles menu) element
    const style = document.createElement('style');

    style.textContent = `
      #velocity-canvas {
        display: none !important;
      }

      [data-testid="vilos-settings_texttrack_submenu"] {
        display: none !important;
      }
    `;
    document.head.append(style);
  }
}
