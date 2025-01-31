import { spawn } from "child_process";
import { zip } from "zip-a-folder";
import { rimrafSync } from "rimraf";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";

import { transformManifest } from "./transform-manifest.mjs";

const fileName = 'anki-jpdb.reader';
const source = fileName;
const dist = 'packages';

const runCommand = async (command, args) => {
	await new Promise((resolve, reject) => {
		const executedCommand = spawn(command, args, {
			stdio: "inherit",
			shell: true
		});

		executedCommand.on("error", error => {
			reject(error);
		});

		executedCommand.on("exit", code => {
			if (code === 0) {
				resolve();
			} else {
				reject();
			}
		});
	});
};

const args = process.argv;
const isPack = args.includes('--pack');
const isWatch = args.includes('--watch');

const isFirefox = args.includes('firefox');
const isFirefoxAndroid = args.includes('firefox-android');
const isChrome = args.includes('chrome');

const noTarget = !isFirefox && !isFirefoxAndroid && !isChrome;

const buildFirefox = isFirefox || (isPack && noTarget);
const buildFirefoxAndroid = isFirefoxAndroid || (isPack && noTarget);
const buildChrome = isChrome || (isPack ? noTarget : !isFirefox && !isFirefoxAndroid);

const webpackArgs = ['webpack', '--config', 'scripts/webpack.mjs'];

if (isPack && isWatch) {
  console.error('Cannot pack and watch at the same time');

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

  if (buildFirefoxAndroid) {
    targets++;
    webpackArgs.push('--env', 'firefox-android');
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

console.log(`${isWatch ? 'Watching' : 'Building'} project...`, {
  Firefox: buildFirefox,
  FirefoxAndroid: buildFirefoxAndroid,
  Chrome: buildChrome,
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

if (isFirefoxAndroid || noTarget) {
  console.log('Packaging project for firefox android...');

  const firefoxAndroidManifest = transformManifest(manifest, { 'firefox-android': true });
  writeFileSync(`${source}/manifest.json`, firefoxAndroidManifest);

  await zip(source, `${dist}/${fileName}-firefox-android.xpi`);
}

if (isFirefox || noTarget) {
  console.log('Packaging project for firefox...');

  const firefoxManifest = transformManifest(manifest, { firefox: true });
  writeFileSync(`${source}/manifest.json`, firefoxManifest);

  await zip(source, `${dist}/${fileName}-firefox.xpi`);
}
