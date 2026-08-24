import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BROKEN = 'width=1280, initial-scale=1';
const FIXED = 'width=1280';
const EXTENSIONS = new Set(['.html', '.js', '.txt']);

function walk(dir) {
  let changed = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      changed += walk(path);
    } else if (EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      const content = readFileSync(path, 'utf8');
      if (content.includes(BROKEN)) {
        writeFileSync(path, content.replaceAll(BROKEN, FIXED));
        changed += 1;
      }
    }
  }
  return changed;
}

const count = walk('out');
console.log(`viewport fix: scrubbed ${count} file(s)`);
