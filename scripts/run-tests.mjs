// Runs every src/**/*.test.ts with tsx's test runner.
// Node 20 does not expand the glob in `tsx --test "src/**/*.test.ts"`, so the files are listed here.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function testFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : testFiles(path);
    return entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

const files = testFiles('src').sort();
if (files.length === 0) {
  console.error('run-tests: no src/**/*.test.ts files found');
  process.exit(1);
}
const result = spawnSync('npx', ['tsx', '--test', ...files], { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
