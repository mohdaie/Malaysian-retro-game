import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export async function buildPwa(root = 'dist', template = 'sw.js') {
  const files = [];
  const walk = async (directory = '') => {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory ? `${directory}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path);
      else if (!['sw.js', 'manifest.webmanifest', '.nojekyll'].includes(path) && !/\.(md|txt)$/i.test(path)) files.push(path);
    }
  };
  await walk();
  files.sort();
  const source = await readFile(template, 'utf8');
  const hash = createHash('sha256').update(source);
  for (const path of files) hash.update(path).update(await readFile(join(root, path)));
  const release = hash.digest('hex').slice(0, 20);
  const worker = source.replace("const RELEASE = 'development';", `const RELEASE = '${release}';`)
    .replace('const PRECACHE = [];', `const PRECACHE = ${JSON.stringify(files)};`);
  await writeFile(join(root, 'sw.js'), worker);
  return { release, files };
}
