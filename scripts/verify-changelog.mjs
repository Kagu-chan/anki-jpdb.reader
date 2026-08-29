import { existsSync, readFileSync } from 'fs';
import packageJson from '../package.json' with { type: 'json' };

const { version } = packageJson;
const changelogFile = `./changelog/${version}.ts`;

if (!existsSync(changelogFile)) {
  console.error(
    `Missing changelog/${version}.ts — add a changelog entry file for this version before releasing.`,
  );
  process.exit(1);
}

const changelogIndex = readFileSync('./changelog/changelog.ts', 'utf8');
const types = readFileSync('./changelog/types.ts', 'utf8');

if (!changelogIndex.includes(`'${version}':`)) {
  console.error(
    `changelog/changelog.ts is missing the '${version}' entry — wire up the new changelog file before releasing.`,
  );
  process.exit(1);
}

if (!types.includes(`'${version}'`)) {
  console.error(
    `changelog/types.ts's Version union is missing '${version}' — add it before releasing.`,
  );
  process.exit(1);
}

console.log(`Changelog for ${version} is wired up.`);
