import { exec } from 'child_process';
import { unlinkSync, writeFileSync } from 'fs';
import { changelog } from '../changelog/changelog.js';

const execute = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const CMD = 'git log -1 --format=%ai v';
const MD = [];
const HTML = [
  '<link rel="stylesheet" media="screen" href="../css/changelog.css" />',
  '<h2>Changelog</h2>',
];

let newest = true;
for (const key of Object.keys(changelog).reverse()) {
  let DATE = new Date().toISOString().split('T')[0].replaceAll('-', '.');

  if (!newest) {
    DATE = (await execute(CMD + key)).split(' ')[0].replaceAll('-', '.');
  }

  newest = false;

  const items = changelog[key];
  const itemsSorted = items.sort((a, b) => {
    if (a.type !== b.type) {
      const order = ['fix', 'change', 'add', 'remove', 'deprecate', 'chore'];

      return order.indexOf(a.type) - order.indexOf(b.type);
    }

    // items have a issue key:
    // issue: number | [number, ...number[]] | 'N/A'
    // If the issue is a number, sort ascending
    // If the issue is an array, sort by the first element ascending
    // If the issue is 'N/A', sort to the end
    // If both issues are the same value (number or first element of array, or both 'N/A'), sort by description
    const aIssue = Array.isArray(a.issue) ? a.issue[0] : a.issue;
    const bIssue = Array.isArray(b.issue) ? b.issue[0] : b.issue;
    if (aIssue === bIssue) {
      return a.description.localeCompare(b.description);
    }
    if (aIssue === 'N/A') {
      return 1;
    }
    if (bIssue === 'N/A') {
      return -1;
    }

    return aIssue - bIssue;
  });

  MD.push(`## ${key} (${DATE})`);
  HTML.push(`<h5>${key} (${DATE})</h5>`);
  HTML.push('<ul>');

  itemsSorted.forEach((item) => {
    const { type, description, issue, category } = item;

    let linkMD = '';
    if (issue !== 'N/A') {
      if (Array.isArray(issue)) {
        linkMD = issue
          .map(
            (num) =>
              ` [#${num}](https://github.com/Kagu-chan/anki-jpdb.reader/issues/${num})`
          )
          .join('');
      } else {
        linkMD = ` [#${issue}](https://github.com/Kagu-chan/anki-jpdb.reader/issues/${issue})`;
      }
    }
    const catMD = Array.isArray(category) ? category.join(', ') : category;
    const lineMD = `- ${type}: ${description}${linkMD} [${catMD}]`;

    let linkTextHtml = '';
    if (issue !== 'N/A') {
      if (Array.isArray(issue)) {
        linkTextHtml =
          ' ' +
          issue
            .map(
              (num) =>
                `<a href="https://github.com/Kagu-chan/anki-jpdb.reader/issues/${num}" target="_blank">#${num}</a>`
            )
            .join(' ');
      } else {
        linkTextHtml = ` <a href="https://github.com/Kagu-chan/anki-jpdb.reader/issues/${issue}" target="_blank">#${issue}</a>`;
      }
    }
    if (linkTextHtml) linkTextHtml = ` [${linkTextHtml}]`;

    const catHtml = (Array.isArray(category) ? category : [category])
      .map((c) => `<label class="category outline">${c}</label>`)
      .join('');
    const lineHTML = `<li><label class="type outline ${type}">${type}</label><span class="description">${description}</span>${linkTextHtml}${catHtml}</li>`;
    HTML.push(lineHTML);

    MD.push(lineMD);
  });
  HTML.push('</ul>');
  MD.push('\n');
}

// write MD to CHANGELOG.md
const md = MD.join('\n');
writeFileSync('./CHANGELOG.md', md);
console.log('CHANGELOG.md created');
// write HTML to CHANGELOG.html
const html = HTML.join('\n');
writeFileSync('./src/views/changelog.html', html);
console.log('CHANGELOG.html created');

unlinkSync('./changelog/changelog.js');
unlinkSync('./changelog/types.js');

Object.keys(changelog).forEach((key) => {
  unlinkSync(`./changelog/${key}.js`);
});
