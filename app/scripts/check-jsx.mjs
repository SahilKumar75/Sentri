import { parse } from '@babel/parser';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['App.jsx', 'index.js', 'src'];
const extensions = new Set(['.js', '.jsx']);
const files = [];

function collect(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) {
      collect(join(path, entry));
    }
    return;
  }

  const extension = path.slice(path.lastIndexOf('.'));
  if (extensions.has(extension)) {
    files.push(path);
  }
}

for (const root of roots) {
  collect(root);
}

for (const file of files) {
  parse(readFileSync(file, 'utf8'), {
    sourceType: 'module',
    plugins: ['jsx'],
  });
}

console.log(`Checked ${files.length} JavaScript files.`);
