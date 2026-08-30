import { readFileSync, writeFileSync } from 'fs';
import packageJson from '../package.json' with { type: 'json' };
import manifestJson from '../src/manifest.json' with { type: 'json' };

const AMO_DOWNLOAD_BASE_URL = 'https://addons.mozilla.org/firefox/downloads/file/';
const AMO_FILE_ID = '4554049';
const AMO_FILENAME_PREFIX = 'anki_jpdb_reader-';

const { version } = packageJson;
const cleanVersion = version.replace(/-[a-z]*/, '');

manifestJson.version = cleanVersion;

console.log('Bump manifest version to', manifestJson.version);
writeFileSync('./src/manifest.json', JSON.stringify(manifestJson, null, 2));

const downloadFileName = `${AMO_FILENAME_PREFIX}${cleanVersion}.xpi`;
const readme = readFileSync('./README.md', 'utf8');
const updatedReadme = readme.replaceAll(/anki_jpdb_reader-[\d.]+\.xpi/g, downloadFileName);

writeFileSync('./README.md', updatedReadme);
console.log('Updated Firefox direct-download link to', `${AMO_DOWNLOAD_BASE_URL}${AMO_FILE_ID}/${downloadFileName}`);
