const { chromium } = require('playwright');
const { POManager } = require('../../pageobjects/POManager');
const { Before, After, Status, BeforeStep, AfterStep } = require('@cucumber/cucumber');
const path = require('path');

Before(async function () {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    this.page = await context.newPage();
    this.poManager = new POManager(this.page);
});

BeforeStep(function () {
  // This hook will be executed before all steps in a scenario with tag @foo
});

AfterStep(async function ({result}) {
    if(result.status === Status.FAILED)
    {
        await this.page.screenshot({path: 'screenshot1.png'});
    }
});

After(function () {
  console.log("I am last");
});