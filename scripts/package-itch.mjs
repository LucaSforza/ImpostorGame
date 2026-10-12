import { copyFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const output = path.join(root, 'dist-itch');
const archive = path.join(root, 'dist-itch.zip');
const { stdout: revisionOutput } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: root });
const revision = revisionOutput.trim();

await copyFile(path.join(root, 'LICENSE'), path.join(output, 'LICENSE'));
await writeFile(path.join(output, 'SOURCE.md'), [
  '# Source code',
  '',
  'This distribution is built from Pocket Circle source code.',
  `Build revision: ${revision}`,
  `Corresponding source: https://github.com/LucaSforza/ImpostorGame/tree/${revision}`,
  'Build from a clean committed checkout before publishing; include any local changes in the source offer.',
  'License: GNU Affero General Public License, version 3 or later (see LICENSE).',
  '',
].join('\n'));
await rm(archive, { force: true });
try {
  await execFileAsync('zip', ['-X', '-r', '-9', archive, '.'], { cwd: output });
} catch (error) {
  throw new Error('Could not create dist-itch.zip; install the system zip utility and retry.', { cause: error });
}
console.log(`Created ${path.relative(root, archive)}`);
