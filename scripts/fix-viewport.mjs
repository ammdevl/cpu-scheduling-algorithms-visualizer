import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BROKEN = 'content="width=1280, initial-scale=1"';
const FIXED = 'content="width=1280"';

function walk(dir) {
  let changed = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      changed += walk(path);
    } else if (entry.name.endsWith('.html')) {
      const html = readFileSync(path, 'utf8');
      if (html.includes(BROKEN)) {
        writeFileSync(path, html.replaceAll(BROKEN, FIXED));
        changed += 1;
      }
    }
  }
  return changed;
}

const count = walk('out');
console.log(`viewport fix: rewrote ${count} html file(s)`);
