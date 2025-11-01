// collect-playwright-metrics.js
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2] || 'test-results/results.json';
const raw = fs.readFileSync(path.resolve(jsonPath), 'utf-8');
const data = JSON.parse(raw);

let total = 0;
let expected = 0;
let unexpected = 0;
let flaky = 0;
let skipped = 0;
let retries = 0;

// ★ 追加: 実行時間の合計（msで持ってあとで秒にする）
let totalDurationMs = 0;

for (const suite of data.suites || []) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      total += 1;

      const outcome = test.status;

      if (outcome === 'expected') {
        expected += 1;
      } else if (outcome === 'unexpected') {
        unexpected += 1;
      } else if (outcome === 'flaky') {
        flaky += 1;
      } else if (outcome === 'skipped') {
        skipped += 1;
      }

      // リトライ回数
      if (Array.isArray(test.results) && test.results.length > 1) {
        retries += test.results.length - 1;
      }

      // ★ 各resultのduration(ms)を足す
      if (Array.isArray(test.results)) {
        for (const r of test.results) {
          if (typeof r.duration === 'number') {
            totalDurationMs += r.duration;
          }
        }
      }
    }
  }
}

// ms → 秒にしておく（Prometheusは秒が慣習）
const totalDurationSec = totalDurationMs / 1000;

const lines = [
  '# HELP playwright_tests_total Total Playwright tests',
  '# TYPE playwright_tests_total gauge',
  `playwright_tests_total ${total}`,
  '# HELP playwright_tests_expected Playwright tests with outcome=expected',
  '# TYPE playwright_tests_expected gauge',
  `playwright_tests_expected ${expected}`,
  '# HELP playwright_tests_unexpected Playwright tests with outcome=unexpected',
  '# TYPE playwright_tests_unexpected gauge',
  `playwright_tests_unexpected ${unexpected}`,
  '# HELP playwright_tests_flaky Playwright tests with outcome=flaky',
  '# TYPE playwright_tests_flaky gauge',
  `playwright_tests_flaky ${flaky}`,
  '# HELP playwright_tests_skipped Playwright tests with outcome=skipped',
  '# TYPE playwright_tests_skipped gauge',
  `playwright_tests_skipped ${skipped}`,
  '# HELP playwright_tests_retries Retries in Playwright tests',
  '# TYPE playwright_tests_retries gauge',
  `playwright_tests_retries ${retries}`,

  // ★ 新規追加: 実行時間（秒）
  '# HELP playwright_tests_duration_seconds Total duration of all Playwright test runs (including retries)',
  '# TYPE playwright_tests_duration_seconds gauge',
  `playwright_tests_duration_seconds ${totalDurationSec}`,
];

const outDir = path.resolve('test-results');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'metrics.prom');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log(`metrics written to ${outPath}`);
