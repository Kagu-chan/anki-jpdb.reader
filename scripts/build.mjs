import { spawn } from 'child_process';
import { zip } from 'zip-a-folder';
import { rimrafSync } from 'rimraf';
import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import { transformManifest } from './transform-manifest.mjs';

const NOTE_FOR_REVIEWERS = `# Notes for reviewers

## Building

Environment:

\`\`\`
os Windows 11
node 22.13.1
npm 10.9.2
\`\`\`

\`\`\`
# Install dependencies
npm i

# Build production Firefox version of the extension to packages/anki-jpdb.reader-firefox.xpi
npm run build firefox
\`\`\``;

const fileName = 'anki-jpdb.reader';
const source = fileName;
const dist = 'packages';

const runCommand = async (command, args) => {
  await new Promise((resolve, reject) => {
    const executedCommand = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    executedCommand.on('error', (error) => {
      reject(error);
    });

    executedCommand.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

const args = process.argv;
const isFirefoxSubmission = args.includes('--ff-submission');
const isPack = args.includes('--pack');
const isWatch = args.includes('--watch');

const isFirefox = args.includes('firefox');
const isChrome = args.includes('chrome') || args.includes('chromium');

const noTarget = !isFirefox && !isChrome;

const buildFirefox = isFirefox || (isPack && noTarget);
const buildChrome = isChrome || (isPack ? noTarget : !isFirefox);

const webpackArgs = ['webpack', '--config', 'scripts/webpack.mjs'];

if (isWatch && (isPack || isFirefoxSubmission)) {
  console.error('Cannot watch and pack at the same time');

  process.exit(1);
}

if (isWatch) {
  webpackArgs.push('--watch');
}

if (!isPack) {
  let targets = 0;

  if (buildFirefox) {
    targets++;
    webpackArgs.push('--env', 'firefox');
  }

  if (buildChrome) {
    targets++;
    webpackArgs.push('--env', 'chrome');
  }

  if (targets > 1) {
    console.error('Cannot build for multiple targets at the same time');

    process.exit(1);
  }
}

console.log('Cleaning project...');
rimrafSync(dist);
rimrafSync('submission');

console.log(`${isWatch ? 'Watching' : 'Building'} project...`, {
  Chrome: buildChrome,
  Firefox: buildFirefox,
});

await runCommand('npx', webpackArgs);

if (isWatch) {
  process.exit(0);
}
console.log('Project built successfully!');

if (!isPack) {
  process.exit(0);
}

console.log('Creating dist directory...');
mkdirSync(dist);

console.log('Packaging project...');
copyFileSync(`${source}/LICENSE.md`, `${dist}/LICENSE.md`);

const manifest = readFileSync(`${source}/manifest.json`, 'utf8');

if (isChrome || noTarget) {
  console.log('Packaging project for chrome...');
  await zip(source, `${dist}/${fileName}-chromium.zip`);
}

if (isFirefox || noTarget) {
  console.log('Packaging project for firefox...');

  const firefoxManifest = transformManifest(manifest, { firefox: true });
  writeFileSync(`${source}/manifest.json`, firefoxManifest);

  await zip(source, `${dist}/${fileName}-firefox.xpi`);
  await createReleaseNotes();
}

if (isFirefoxSubmission) {
  console.log('Packaging project for firefox submission...');

  mkdirSync(`submission`);

  ['src', 'assets', 'scripts'].forEach((dir) => {
    cpSync(dir, `submission/${dir}`, { recursive: true });
  });

  ['package.json', 'package-lock.json', 'LICENSE.md', 'PRIVACY.md'].forEach((file) => {
    copyFileSync(file, `submission/${file}`);
  });

  writeFileSync('submission/README.md', NOTE_FOR_REVIEWERS);

  await zip('submission', `${dist}/${fileName}-firefox-submission.zip`);
}

function createReleaseNotes() {
  const changeLog = readFileSync('./CHANGELOG.md', 'utf8');
  const lines = changeLog.split('\n');
  const releaseNotes = [];
  let start = false;

  while (lines.length) {
    const line = lines.shift();

    if (line.startsWith('## ')) {
      if (!start) {
        start = true;
        continue;
      } else {
        break;
      }
    }

    if (line.trim() === '') {
      continue;
    }

    // Remove [[#123]] links and [Foo] categories
    const [cleanLine, _] = line.split('[');

    releaseNotes.push(cleanLine.trim());
  }

  const releaseNotesText = releaseNotes.join('\n');

  writeFileSync(`${dist}/CURRENT_VERSION.md`, releaseNotesText);

  console.log('Release notes for current version created');
}
