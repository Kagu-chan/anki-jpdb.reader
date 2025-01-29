const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const glob = require('glob');

const scripts = glob.globSync(['src/background-worker/*.ts', 'src/apps/*.ts', 'src/views/*.ts']).reduce((curr, item) => {
  const fileName = './' + item.replace(/\\/g, '/');
  const partials = fileName.split('/');
  const name = partials.pop().split('.').shift();

  return Object.assign(curr, {
    [name]: {
      import: fileName,
      filename: `js/${name}.js`,
    },
  });
}, {});

const styles = glob.globSync([
  'src/styles/*.scss',
  'src/views/**/*.scss',
]).reduce((curr, item) => {
  const fileName = './' + item.replace(/\\/g, '/');
  const partials = fileName.split('/');
  const name = partials.pop().split('.').shift();

  return Object.assign(curr, {
    [`style_${name}`]: fileName,
  });
}, {});

const transformManifest = (content, env) => {
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

  return JSON.stringify(manifest, null, 2);
};

module.exports = {
  async config(env) {
    return {
      mode: env,
      entry: { ...scripts, ...styles },
      resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        extensionAlias: {
          '.ts': ['.js', '.ts'],
          '.cts': ['.cjs', '.cts'],
          '.mts': ['.mjs', '.mts'],
        },
        alias: {
          '@shared': path.resolve(__dirname, 'src/shared'),
          '@styles': path.resolve(__dirname, 'src/styles'),
        },
      },
      plugins: [
        new CopyPlugin({
          patterns: [
            { from: 'assets', to: 'assets' },
            { from: 'src/views/*.html', to: 'views/[name][ext]' },
            { from: 'src/hosts.json', to: '[name][ext]' },
            { from: 'src/manifest.json', to: '[name][ext]', transform: (content) => transformManifest(content, env) },
            { from: '*.md', to: '[name][ext]' },
          ],
        }),
        env.production && new ZipPlugin({
          filename: `anki-jpdb.reader`,
          extension: env.firefox ? 'xpi' : 'zip'
        })
      ].filter(Boolean),
      module: {
        rules: [
          {
            test: /\.scss$/,
            type: 'asset/resource',
            use: [{
              loader: 'sass-loader',
              options: {
                sassOptions: { style: 'expanded' },
              }
            }],
            generator: { filename: 'css/[name].css' },
          },
          {
            test: /.([cm]?ts|tsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
      output: {
        path: path.resolve(__dirname, 'anki-jpdb.reader'),
        clean: true,
      },
      optimization: {
        minimize: false,
      }
    };
  },
};
