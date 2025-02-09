import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const run = (cmd, args) => {
  return new Promise((resolve, reject) => {
    const ls = spawn(cmd, args);
    const out = [];

    ls.stdout.on('data', (data) => {
      out.push(data);
    });

    ls.stderr.on('data', (data) => {
      console.error(data);
    });

    ls.on('close', (code) => {
      if (code === 0) {
        resolve(out.join('').trim());
      } else {
        reject();
      }
    });
  });
}

const tag = await run("git", ["describe", "--tags", "--abbrev=0"]);
const log = await run("git", ["log", "--pretty=format:%h%x09%p%x09%an%x09%s", `${tag}..@`]);
const relevant = log.split('\n').filter(Boolean).filter((line => !line.includes('Merge remote-tracking')));
const parsed = relevant.map(line => {
  const [hash, p, author, original] = line.split('\t');
  const prId = original.match(/\(#(\d+)\)$/)?.[1];
  const message = original.replace(/ ?\(#(\d+)\)$/, '');
  const parent = p.split(' ')[0];
  const refParent = p.split(' ')[1];

  return { hash, parent, refParent, author, prId, message };
});
const filtered = parsed.filter(({ hash }) => !parsed.some(({ refParent }) => hash === refParent));
const items = filtered.map(({ hash, author, prId, message }) => ([
  `<a class="hash" href="https://github.com/Kagu-chan/anki-jpdb.reader/commit/${hash}">${hash}</a>`,
  `<span class="message">${message}</span>`,
  `<span class="author">${author}</span>`,
  prId ? `<a class="pr" href="https://github.com/Kagu-chan/anki-jpdb.reader/pull/${prId}">(#${prId})</a>` : undefined
].filter(Boolean).join('\n\t'))).map((l) => `<li>\n\t${l}\n</li>`).join('\n');

writeFileSync('changelog.html', `<ul>\n${items}\n</ul>`);
console.log(items);
