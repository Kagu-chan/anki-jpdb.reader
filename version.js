const fs = require('fs');
const packageJson = require('./package.json');
const manifest = require('./src/manifest.json');
const version = packageJson.version;

manifest.version = version.replace(/-[a-z]*/, '');

console.log('Bump manifest version to', manifest.version);
fs.writeFileSync('./src/manifest.json', JSON.stringify(manifest, null, 2));
