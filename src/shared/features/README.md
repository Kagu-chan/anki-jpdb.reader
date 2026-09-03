# Features (implementation notes)

The Features system lets a small, opt-in behavior be toggled for a specific site from Settings → Features, without adding a dedicated setting for it. Unlike [Custom meta](../../../docs/custom-meta.md), which is about *parsing* a page, a Feature can run arbitrary code once enabled for a matching URL.

## How it works

* [`types.ts`](./types.ts) - `Feature` is the metadata shown in Settings (id, name, description, which host(s) it applies to, whether it also runs in iframes); `FeatureImplementation` is the code that runs when it's active.
* [`features.ts`](./features.ts) - the `FEATURES` array of registered features. The Settings → Features checklist renders one checkbox per entry. While `FEATURES` is empty, the `#features` section in `settings.html` carries a static `hidden` attribute, since an empty checklist has nothing to show.
* [`get-features.ts`](../../apps/features/get-features.ts) - reads the user's enabled feature ids from settings, matches each one's `host` against the current page URL, and instantiates the matching `FeatureImplementation`s. Its caller runs `.apply()` on whatever comes back.

## Adding a feature

1. Add a `Feature` entry to `FEATURES` (`features.ts`) with a unique `id`, a user-facing `name`/`description`, the `host` pattern(s) it should run on, and whether `allFrames` should be `true`.
2. Implement a `FeatureImplementation` class (typically under `src/apps/features/`) whose `apply()` does the actual work - injecting CSS, patching the DOM, etc.
3. Register the id in the lookup map inside `getFeatures` (`src/apps/features/get-features.ts`), pointing it at the implementation class.
4. Remove the `hidden` attribute from the `#features` section in `src/views/settings.html`, if this is the first entry added back to `FEATURES`.

## Removing a feature

Delete its `FEATURES` entry, its implementation file, and its lookup-map entry in `get-features.ts`. If `FEATURES` becomes empty, add the `hidden` attribute back to the `#features` section in `src/views/settings.html`.

### Reference: the old Crunchyroll feature

Kept here as the last worked example of the shape a feature takes (removed once Crunchyroll started forcing hardsubs, making subtitle removal moot).

`features.ts`:

```ts
export const CRUNCHYROLL: Feature = {
  id: 'crunchyroll.com',
  name: 'Crunchyroll',
  description: 'Force removes Crunchyroll subtitles',
  host: '*://static.crunchyroll.com/*',
  allFrames: true,
};

export const FEATURES: Feature[] = [CRUNCHYROLL];
```

`src/apps/features/crunchyroll-com.feature.ts`:

```ts
export class CrunchyrollFeature implements FeatureImplementation {
  public apply(): void {
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
```

`src/apps/features/get-features.ts` (lookup map entry):

```ts
const features: Record<string, [Feature, new () => FeatureImplementation]> = {
  [CRUNCHYROLL.id]: [CRUNCHYROLL, CrunchyrollFeature],
};
```
