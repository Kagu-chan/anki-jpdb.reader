import { spawn } from 'child_process';

const { JWT_ISSUER, JWT_SECRET } = process.env;

if (!JWT_ISSUER || !JWT_SECRET) {
  console.error('Error: JWT_ISSUER and JWT_SECRET must be set in the environment.');
  process.exit(1);
}

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true });

    child.on('exit', (code) => (code === 0 ? resolve() : reject(code)));
    child.on('error', reject);
  });

try {
  await run('node', ['scripts/build.mjs', '--pack', '--ff-submission']);
  await run('npx', ['web-ext', 'lint', '--source-dir', 'anki-jpdb.reader']);
  await run('npx', [
    'web-ext',
    'sign',
    '--source-dir',
    'anki-jpdb.reader',
    '--artifacts-dir',
    'packages',
    '--channel',
    'listed',
    '--amo-metadata',
    'packages/amo-metadata.json',
    '--upload-source-code',
    'packages/anki-jpdb.reader-firefox-submission.zip',
    '--approval-timeout',
    '0',
    '--api-key',
    JWT_ISSUER,
    '--api-secret',
    JWT_SECRET,
  ]);
} catch (code) {
  process.exit(typeof code === 'number' ? code : 1);
}
