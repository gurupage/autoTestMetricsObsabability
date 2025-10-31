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

// suites -> specs -> tests の3段階をたどる
for (const suite of data.suites || []) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      total += 1;
      const status = test.status; // "passed" | "failed" | "flaky"
      if (status === 'passed') passed += 1;
      else if (status === 'failed') failed += 1;
      else if (status === 'flaky') flaky += 1;

      // リトライ回数は results の長さから求める（1回実行なら1）
      if (Array.isArray(test.results) && test.results.length > 1) {
        retries += (test.results.length - 1);
      }
    }
  }
}

// ここでは「Prometheusっぽいテキスト」を出力する
// CIのログに出してもいいし、ファイルに書いてもいい
const lines = [
  `playwright_tests_total ${total}`,
  `playwright_tests_passed ${passed}`,
  `playwright_tests_failed ${failed}`,
  `playwright_tests_flaky ${flaky}`,
  `playwright_tests_retries ${retries}`,
];

// 標準出力
console.log(lines.join('\n'));

// ファイルにも残したい場合
fs.writeFileSync('test-results/metrics.prom', lines.join('\n'));
console.log('metrics written to test-results/metrics.prom');
