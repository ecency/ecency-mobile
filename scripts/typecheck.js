/* eslint-disable no-console */
/**
 * Typecheck gate with a per-file error baseline.
 *
 * The repo has ~5k pre-existing tsc errors (tsc-baseline.json), so a plain
 * `tsc --noEmit` cannot gate CI yet. This script fails only on regressions:
 * a file with more errors than its baseline entry, or errors in a file that
 * has no baseline entry.
 *
 *   node scripts/typecheck.js            compare against tsc-baseline.json
 *   node scripts/typecheck.js --update   regenerate tsc-baseline.json
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
/* eslint-enable @typescript-eslint/no-var-requires */

const repoRoot = path.join(__dirname, '..');
const baselinePath = path.join(repoRoot, 'tsc-baseline.json');
const update = process.argv.includes('--update');

const tsc = spawnSync(
  process.execPath,
  [
    path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--noEmit',
    '-p',
    'tsconfig.json',
  ],
  { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
);

if (tsc.error) {
  console.error('failed to run tsc:', tsc.error.message);
  process.exit(1);
}

const output = `${tsc.stdout || ''}${tsc.stderr || ''}`;
const errorLine = /^(.+?)\(\d+,\d+\): error TS\d+: /;
const globalErrorLine = /^error TS\d+: /;

const byFile = {};
const linesByFile = {};
const globalErrors = [];
output.split('\n').forEach((line) => {
  const match = line.match(errorLine);
  if (match) {
    const file = match[1];
    if (file.endsWith('.json')) {
      // config-level diagnostics (e.g. TS5098 on tsconfig.json) must never be baselined
      globalErrors.push(line);
      return;
    }
    byFile[file] = (byFile[file] || 0) + 1;
    (linesByFile[file] = linesByFile[file] || []).push(line);
  } else if (globalErrorLine.test(line)) {
    globalErrors.push(line);
  }
});

const total = Object.values(byFile).reduce((sum, count) => sum + count, 0);

if (tsc.signal) {
  console.error(`tsc was killed by signal ${tsc.signal}; output tail:\n`);
  console.error(output.split('\n').slice(-20).join('\n'));
  process.exit(1);
}

if (globalErrors.length) {
  console.error('tsc reported project-level errors (never baselined):\n');
  globalErrors.forEach((line) => console.error(`  ${line}`));
  process.exit(1);
}

if (tsc.status !== 0 && total === 0) {
  console.error(`tsc exited with code ${tsc.status} without reporting diagnostics; output tail:\n`);
  console.error(output.split('\n').slice(-20).join('\n'));
  process.exit(1);
}

if (update) {
  const files = {};
  Object.keys(byFile)
    .sort()
    .forEach((file) => {
      files[file] = byFile[file];
    });
  fs.writeFileSync(baselinePath, `${JSON.stringify({ total, files }, null, 2)}\n`);
  console.log(`baseline updated: ${total} errors in ${Object.keys(files).length} files`);
  process.exit(0);
}

if (!fs.existsSync(baselinePath)) {
  console.error(`missing ${path.basename(baselinePath)}, run: yarn typecheck:update-baseline`);
  process.exit(1);
}
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

const regressions = Object.keys(byFile)
  .filter((file) => byFile[file] > (baseline.files[file] || 0))
  .sort();

if (regressions.length) {
  console.error('Typecheck failed: new errors versus tsc-baseline.json.\n');
  const maxLines = 20;
  regressions.forEach((file) => {
    console.error(`${file}: ${byFile[file]} errors (baseline ${baseline.files[file] || 0})`);
    linesByFile[file].slice(0, maxLines).forEach((line) => console.error(`  ${line}`));
    if (linesByFile[file].length > maxLines) {
      console.error(`  ... and ${linesByFile[file].length - maxLines} more in this file`);
    }
    console.error('');
  });
  console.error(
    'Fix the new errors, or if errors legitimately moved between files\n' +
      '(e.g. a shared type changed), run: yarn typecheck:update-baseline',
  );
  process.exit(1);
}

const improved = Object.keys(baseline.files).filter(
  (file) => (byFile[file] || 0) < baseline.files[file],
);
console.log(`typecheck ok: ${total} errors (baseline ${baseline.total})`);
if (improved.length) {
  console.log(
    `${improved.length} file(s) now have fewer errors than baselined, ` +
      'run `yarn typecheck:update-baseline` to ratchet the baseline down.',
  );
}
/* eslint-enable no-console */
