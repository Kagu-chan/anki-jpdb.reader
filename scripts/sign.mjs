import { readFileSync } from 'fs';
import { spawn } from 'child_process';

// Load .env if present
try {
  const env = readFileSync('.env', 'utf8');

  for (const line of env.split('\n')) {
    const match = line.match(/^([^#\s][^=]*)=(.*)$/);

    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch {
  // No .env file — rely on environment variables already being set
}

const { JWT_ISSUER, JWT_SECRET } = process.env;

if (!JWT_ISSUER || !JWT_SECRET) {
  console.error('Error: JWT_ISSUER and JWT_SECRET must be set in .env or the environment.');
  process.exit(1);
}

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true });

    child.on('exit', (code) => (code === 0 ? resolve() : reject(code)));
    child.on('error', reject);
  });

try {
  await run('node', ['scripts/build.mjs', '--pack', 'firefox']);
  await run('npx', [
    'web-ext',
    'sign',
    '--source-dir',
    'anki-jpdb.reader',
    '--artifacts-dir',
    'packages',
    '--channel',
    'unlisted',
    '--api-key',
    JWT_ISSUER,
    '--api-secret',
    JWT_SECRET,
  ]);
} catch (code) {
  process.exit(typeof code === 'number' ? code : 1);
}
