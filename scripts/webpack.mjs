import { resolve } from 'path';
import { globSync } from 'glob';
import CopyPlugin from 'copy-webpack-plugin';
import { transformManifest } from './transform-manifest.mjs';

const __dirname = import.meta.dirname;

const scripts = globSync(['src/background-worker/*.ts', 'src/apps/*.ts', 'src/views/*.ts']).reduce(
  (curr, item) => {
    const fileName = './' + item.replace(/\\/g, '/');
    const partials = fileName.split('/');
    const name = partials.pop().split('.').shift();

    return Object.assign(curr, {
      [name]: {
        import: fileName,
        filename: `js/${name}.js`,
      },
    });
  },
  {},
);

const styles = globSync(['src/styles/*.scss', 'src/views/**/*.scss']).reduce((curr, item) => {
  const fileName = './' + item.replace(/\\/g, '/');
  const partials = fileName.split('/');
  const name = partials.pop().split('.').shift();

  return Object.assign(curr, {
    [`style_${name}`]: fileName,
  });
}, {});

const cssFunctions = globSync(['src/styles/fn/**/*.scss']).reduce((curr, item) => {
  const fileName = './' + item.replace(/\\/g, '/');
  const partials = fileName.split('/');
  const name = partials.pop().split('.').shift();
  const scope = partials.pop();

  return Object.assign(curr, {
    [`cssFn.${scope}.${name}`]: fileName,
  });
}, {});

export default (env = {}) => ({
  mode: 'none',
  entry: { ...scripts, ...styles, ...cssFunctions },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    extensionAlias: {
      '.ts': ['.js', '.ts'],
      '.cts': ['.cjs', '.cts'],
      '.mts': ['.mjs', '.mts'],
    },
    alias: {
      '@shared': resolve(__dirname, '../src/shared'),
      '@styles': resolve(__dirname, '../src/styles'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
        { from: 'src/views/*.html', to: 'views/[name][ext]' },
        { from: 'src/hosts.json', to: '[name][ext]' },
        {
          from: 'src/manifest.json',
          to: '[name][ext]',
          transform: (content) => transformManifest(content, env),
        },
        { from: 'LICENSE.md', to: '[name][ext]' },
        { from: 'PRIVACY.md', to: '[name][ext]' },
      ],
    }),
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.scss$/,
        type: 'asset/resource',
        use: [
          {
            loader: 'sass-loader',
            options: {
              warnRuleAsWarning: true,
              sassOptions: { style: 'expanded' },
            },
          },
        ],
        // generator: { filename: 'css/[name].css' },
        generator: {
          filename: (path) => {
            return path.filename
              .replace('src/', '')
              .replace(/(views\/(\w+\/)*)|styles\//, 'css/')
              .replace('.scss', '.css');
          },
        },
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
    path: resolve(__dirname, '../anki-jpdb.reader'),
    clean: true,
  },
  optimization: {
    minimize: false,
  },
  devtool: env.sourceMap && 'source-map',
});
