export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (commit) => commit.toLowerCase().startsWith('chore(deps): bump'),
    (commit) => /^v?\d+\.\d+\.\d+/.test(commit), // Ignores version commits like "v1.2.3" or "1.2.3"
    (commit) => commit.startsWith('Merge '), // Ignores merge commits
  ],
  rules: {
    'header-max-length': [2, 'always', 200],
    'type-enum': [2, 'always', ['add', 'change', 'deprecate', 'remove', 'fix', 'chore']],
    'scope-enum': [
      2,
      'always',
      [
        'dev',
        'platform',
        'browser',
        'parser',
        'text-highlighter',
        'api',
        'documentation',
        'hosts',
        'popup',
        'settings',
        'features',
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-full-stop': [2, 'always', '.'],
  },
};
