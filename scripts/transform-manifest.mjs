export const transformManifest = (content, env) => {
  const manifest = JSON.parse(content.toString());

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

  if (env['firefox-android']) {
    Object.assign(manifest, {
      gecko: {
        id: '{748a7778-a751-4a23-8eb8-bb3390bf2164}',
      },
      gecko_android: {}
    })
  }

  return JSON.stringify(manifest, null, 2);
};
