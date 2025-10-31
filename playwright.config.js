// import { defineConfig, devices } from '@playwright/test';
// import { trace } from 'console';
const { defineConfig, devices } = require('@playwright/test');
const { trace } = require('console');

const config = ({
  testDir: './tests',
  retries: 2,
  workers: 4,
  timeout: 40 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    // ['junit', { outputFile: 'results.xml' }],
    ['allure-playwright']
  ],
  use: {
    browserName: 'chromium', //chromium
    headless: false,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry', //off, on
    // ...devices['iPhone 15'],
  },
});
module.exports = config