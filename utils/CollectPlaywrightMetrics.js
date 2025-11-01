// collect-playwright-metrics.js (per-test + error reason)
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2] || 'test-results/results.json';
const raw = fs.readFileSync(path.resolve(jsonPath), 'utf-8');
const data = JSON.parse(raw);

// 全体集計
let total = 0;
let expected = 0;
let unexpected = 0;
let flaky = 0;
let skipped = 0;
let retries = 0;
let totalDurationMs = 0;

// テストごとのメトリクス行を貯める
const perTestLines = [];

function esc(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

// ★ 失敗理由の分類ロジック
function classifyError(msg = '') {
  const m = msg.toLowerCase();

  if (m.includes('timeouterror') || m.includes('timeout ') || m.includes('goto') || m.includes('navigation')) {
    return 'timeout';
  }
  if (m.includes('locator.') || m.includes('strict mode violation') || m.includes('element is not attached')) {
    return 'locator';
  }
  if (m.includes('assert') || m.includes('expect(') || m.includes('to be ') || m.includes('toequal')) {
    return 'assertion';
  }
  if (m.includes('net::err_') || m.includes('econnreset') || m.includes('enotfound') || m.includes('connection refused')) {
    return 'network';
  }
  return 'unknown';
}

for (const suite of data.suites || []) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      total += 1;
      const outcome = test.status; // expected / unexpected / flaky / skipped

      if (outcome === 'expected') expected += 1;
      else if (outcome === 'unexpected') unexpected += 1;
      else if (outcome === 'flaky') flaky += 1;
      else if (outcome === 'skipped') skipped += 1;

      // リトライ数とduration集計
      let testRetries = 0;
      let testDurationMs = 0;
      let errorReason = 'none';

      if (Array.isArray(test.results)) {
        if (test.results.length > 1) {
          testRetries = test.results.length - 1;
        }
        for (const r of test.results) {
          if (typeof r.duration === 'number') {
            testDurationMs += r.duration;
            totalDurationMs += r.duration;
          }
        }

        // ★ 最初に失敗したresultからメッセージを拾う（あるいは最後の失敗でもよい）
        const failedResult = test.results.find(r => r.status === 'failed' || r.status === 'timedOut');
        if (failedResult && failedResult.error && failedResult.error.message) {
          errorReason = classifyError(failedResult.error.message);
        } else if (outcome === 'unexpected') {
          // outcomeがunexpectedなのにresultにfailedが無いことはあまりないが、保険
          errorReason = 'unknown';
        }
      }

      const testKey = `${suite.file || suite.title}::${spec.title}`;
      const label = esc(testKey);
      const errorLabel = esc(errorReason);

      let statusNum = 0;
      if (outcome === 'expected') statusNum = 0;
      else if (outcome === 'unexpected') statusNum = 1;
      else if (outcome === 'flaky') statusNum = 2;
      else if (outcome === 'skipped') statusNum = 3;

      // ここで error_reason を含める
      perTestLines.push(
        `playwright_test_run_status{test="${label}",error_reason="${errorLabel}"} ${statusNum}`
      );
      perTestLines.push(
        `playwright_test_run_flaky{test="${label}"} ${outcome === 'flaky' ? 1 : 0}`
      );
      perTestLines.push(
        `playwright_test_run_retries{test="${label}"} ${testRetries}`
      );
      perTestLines.push(
        `playwright_test_run_duration_seconds{test="${label}"} ${testDurationMs / 1000}`
      );
    }
  }
}

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
  '# HELP playwright_tests_duration_seconds Total duration of all Playwright test runs (including retries)',
  '# TYPE playwright_tests_duration_seconds gauge',
  `playwright_tests_duration_seconds ${totalDurationSec}`,
  '',
  '# HELP playwright_test_run_status Status per test (0=ok,1=unexpected,2=flaky,3=skipped), with error_reason label',
  '# TYPE playwright_test_run_status gauge',
  '# HELP playwright_test_run_flaky Whether this test was flaky (1) in this run',
  '# TYPE playwright_test_run_flaky gauge',
  '# HELP playwright_test_run_retries Retries used by this test in this run',
  '# TYPE playwright_test_run_retries gauge',
  '# HELP playwright_test_run_duration_seconds Duration of this test in seconds (sum of retries)',
  '# TYPE playwright_test_run_duration_seconds gauge',
  ...perTestLines,
];

const outDir = path.resolve('test-results');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'metrics.prom');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log(`metrics written to ${outPath}`);
