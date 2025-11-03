// CollectPlaywrightMetrics.js
// ジョブ単位の最終結果ベースで「実行回数カウンタ」を出力（retryは含めない）

const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2] || 'test-results/results.json';
const raw = fs.readFileSync(path.resolve(jsonPath), 'utf-8');
const data = JSON.parse(raw);

// ===== 既存の全体集計（gauge）は従来どおり =====
let total = 0;
let expected = 0;
let unexpected = 0;
let flaky = 0;
let skipped = 0;
let totalDurationMs = 0;

const perTestLines = [];

function esc(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

// 失敗理由の分類（現行ロジック踏襲）
function classifyError(msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('timeouterror') || m.includes('timeout ') || m.includes('goto') || m.includes('navigation')) return 'timeout';
  if (m.includes('locator.') || m.includes('strict mode violation') || m.includes('element is not attached')) return 'locator';
  if (m.includes('assert') || m.includes('expect(') || m.includes('to be ') || m.includes('toequal')) return 'assertion';
  if (m.includes('net::err_') || m.includes('econnreset') || m.includes('enotfound') || m.includes('connection refused')) return 'network';
  return 'unknown';
}

// ===== 新規：カウンタ永続化（retry除外の実行回数用） =====
// 保存先（ジョブ間で累積）
const countersPath = path.resolve('test-results/metrics_counters.json');
// 既存カウンタの読み込み（なければ空）
let counters = {};
try {
  if (fs.existsSync(countersPath)) {
    counters = JSON.parse(fs.readFileSync(countersPath, 'utf-8'));
  }
} catch (e) {
  counters = {};
}

// カウンタの初期化ヘルパ
function ensureCounter(testKey) {
  if (!counters[testKey]) {
    counters[testKey] = {
      run_total: 0,          // 実行回数（最終結果ベース、retry除外）
      passed_total: 0,       // 最終結果 expected
      failed_total: 0,       // 最終結果 unexpected
      flaky_total: 0,        // 最終結果 flaky
      skipped_total: 0       // 最終結果 skipped
    };
  }
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

      // duration集計（retryは時間合算だけに影響、回数カウンタには影響させない）
      let testDurationMs = 0;
      let errorReason = 'none';
      if (Array.isArray(test.results)) {
        for (const r of test.results) {
          if (typeof r.duration === 'number') {
            testDurationMs += r.duration;
            totalDurationMs += r.duration;
          }
        }
        const failedResult = test.results.find(r => r.status === 'failed' || r.status === 'timedOut');
        if (failedResult && failedResult.error && failedResult.error.message) {
          errorReason = classifyError(failedResult.error.message);
        } else if (outcome === 'unexpected') {
          errorReason = 'unknown';
        }
      }

      const testKey = `${suite.file || suite.title}::${spec.title}`;
      const label = esc(testKey);
      const errorLabel = esc(errorReason);

      // ===== retry除外の実行回数カウンタをインクリメント（最終結果で +1）=====
      ensureCounter(testKey);
      counters[testKey].run_total += 1;
      if (outcome === 'expected') counters[testKey].passed_total += 1;
      else if (outcome === 'unexpected') counters[testKey].failed_total += 1;
      else if (outcome === 'flaky') counters[testKey].flaky_total += 1;
      else if (outcome === 'skipped') counters[testKey].skipped_total += 1;

      // 既存の gauge 出力（互換維持）
      let statusNum = 0;
      if (outcome === 'expected') statusNum = 0;
      else if (outcome === 'unexpected') statusNum = 1;
      else if (outcome === 'flaky') statusNum = 2;
      else if (outcome === 'skipped') statusNum = 3;

      perTestLines.push(
        `playwright_test_run_status{test="${label}",error_reason="${errorLabel}"} ${statusNum}`
      );
      perTestLines.push(
        `playwright_test_run_flaky{test="${label}"} ${outcome === 'flaky' ? 1 : 0}`
      );
      // ※ retry個数のgaugeは要らないため出力しない
      perTestLines.push(
        `playwright_test_run_duration_seconds{test="${label}"} ${testDurationMs / 1000}`
      );
    }
  }
}

// カウンタを保存（ジョブ間で累積）
try {
  const outDir = path.resolve('test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(countersPath, JSON.stringify(counters, null, 2), 'utf-8');
} catch (e) {
  console.error('failed to persist counters:', e);
}

const totalDurationSec = totalDurationMs / 1000;

// ===== metrics.prom を組み立て（gauge + counter）=====
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
  '# HELP playwright_tests_duration_seconds Total duration of all Playwright test runs (including retries)',
  '# TYPE playwright_tests_duration_seconds gauge',
  `playwright_tests_duration_seconds ${totalDurationSec}`,
  '',
  '# HELP playwright_test_run_status Status per test (0=ok,1=unexpected,2=flaky,3=skipped), with error_reason label',
  '# TYPE playwright_test_run_status gauge',
  '# HELP playwright_test_run_flaky Whether this test was flaky (1) in this run',
  '# TYPE playwright_test_run_flaky gauge',
  '# HELP playwright_test_run_duration_seconds Duration of this test in seconds (sum of retries)',
  '# TYPE playwright_test_run_duration_seconds gauge',
  ...perTestLines,
  '',
  // ===== 新規：retry除外の実行回数カウンタ群 =====
  '# HELP playwright_test_run_total Total number of test executions per CI job (excluding retries)',
  '# TYPE playwright_test_run_total counter',
  '# HELP playwright_test_run_passed_total Passed outcomes per CI job (excluding retries)',
  '# TYPE playwright_test_run_passed_total counter',
  '# HELP playwright_test_run_failed_total Failed outcomes per CI job (excluding retries)',
  '# TYPE playwright_test_run_failed_total counter',
  '# HELP playwright_test_run_flaky_total Flaky outcomes per CI job (excluding retries)',
  '# TYPE playwright_test_run_flaky_total counter',
  '# HELP playwright_test_run_skipped_total Skipped outcomes per CI job (excluding retries)',
  '# TYPE playwright_test_run_skipped_total counter'
];

// テストごとのカウンタ行を追加
for (const [testKey, c] of Object.entries(counters)) {
  const label = esc(testKey);
  lines.push(`playwright_test_run_total{test="${label}"} ${c.run_total}`);
  lines.push(`playwright_test_run_passed_total{test="${label}"} ${c.passed_total}`);
  lines.push(`playwright_test_run_failed_total{test="${label}"} ${c.failed_total}`);
  lines.push(`playwright_test_run_flaky_total{test="${label}"} ${c.flaky_total}`);
  lines.push(`playwright_test_run_skipped_total{test="${label}"} ${c.skipped_total}`);
}

// 出力
const outDir = path.resolve('test-results');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'metrics.prom');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8'); // 末尾改行あり
console.log(`metrics written to ${outPath}`);
