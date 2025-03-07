export const transformManifest = (content, env) => {
  const manifest = JSON.parse(content.toString());

  if (env.WEBPACK_WATCH) {
    manifest.name = `${manifest.name} (Development)`;
  }

  if (env.firefox) {
    delete manifest.minimum_chrome_version;

    Object.assign(manifest, {
      background: {
        scripts: [manifest.background.service_worker],
      },
      browser_specific_settings: {
        gecko: {
          id: '{67e602c3-7324-4b00-85cd-b652eb47b0f9}',
          strict_min_version: '126.0',
        },
      },
    });
  }

  return JSON.stringify(manifest, null, 2);
};
