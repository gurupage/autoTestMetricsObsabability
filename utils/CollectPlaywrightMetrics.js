// scripts/collect-playwright-metrics.js
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2] || 'test-results/results.json';
const raw = fs.readFileSync(path.resolve(jsonPath), 'utf-8');
const data = JSON.parse(raw);

let total = 0;
let passed = 0;
let failed = 0;
let flaky = 0;
let retries = 0;

for (const suite of data.suites || []) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      total += 1;
      const status = test.status;
      if (status === 'passed') passed += 1;
      else if (status === 'failed') failed += 1;
      else if (status === 'flaky') flaky += 1;

      if (Array.isArray(test.results) && test.results.length > 1) {
        retries += test.results.length - 1;
      }
    }
  }
}

// ── ここがポイント ──
// 1行ずつ全部自分で書く（テンプレでもOK）
// 改行は \n 固定で書く
const lines = [
  '# HELP playwright_tests_total Total Playwright tests',
  '# TYPE playwright_tests_total gauge',
  `playwright_tests_total ${total}`,
  '# HELP playwright_tests_passed Passed Playwright tests',
  '# TYPE playwright_tests_passed gauge',
  `playwright_tests_passed ${passed}`,
  '# HELP playwright_tests_failed Failed Playwright tests',
  '# TYPE playwright_tests_failed gauge',
  `playwright_tests_failed ${failed}`,
  '# HELP playwright_tests_flaky Flaky Playwright tests',
  '# TYPE playwright_tests_flaky gauge',
  `playwright_tests_flaky ${flaky}`,
  '# HELP playwright_tests_retries Retries in Playwright tests',
  '# TYPE playwright_tests_retries gauge',
  `playwright_tests_retries ${retries}`,
];

// Linuxで読まれることを前提に、明示的に \n で join
const content = lines.join('\n') + '\n';

// 出力先は CI のアーティファクト側でもいいし、最終的に bind mount する場所でもいい
const outPath = path.resolve('test-results', 'metrics.prom');
fs.writeFileSync(outPath, content, { encoding: 'utf8' });
console.log(`metrics written to ${outPath}`);
