import { writeFileSync } from 'fs';
import packageJson from '../package.json' with { type: 'json' };
import manifestJson from '../src/manifest.json' with { type: 'json' };

const { version } = packageJson;

manifestJson.version = version.replace(/-[a-z]*/, '');

console.log('Bump manifest version to', manifestJson.version);
writeFileSync('./src/manifest.json', JSON.stringify(manifestJson, null, 2));
