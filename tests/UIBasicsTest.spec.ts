import { expect, test } from '@playwright/test';
import { request } from 'http';
// const {test} = require('@playwright/test');

test.describe.configure({ mode: 'parallel' });
test('First Playwright Test', async ({ browser }) => {

    const context = await browser.newContext();
    const page = await context.newPage();
    const userName = page.locator("#username");
    const signInBtn = page.locator("#signInBtn");
    const cardTitles = page.locator(".card-body a");

    //Section 11 API route
    page.on('request', request => console.log(request.url()));
    page.on('response', response => console.log(response.url(), response.status()));
    //Section 11 API route

    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    console.log(await page.title());
    await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");
    await userName.fill("email");
    await page.locator("[type='password']").fill("learning");
    await signInBtn.click();
    console.log(await page.locator("[style*='block']").textContent());
    await expect(page.locator("[style*='block']")).toContainText('Incorrect');
    await userName.fill("");
    await userName.fill("rahulshettyacademy");
    await signInBtn.click();
    console.log(await cardTitles.first().textContent());
    console.log(await cardTitles.nth(1).textContent());
    const allCardTitles = await cardTitles.allTextContents();
    console.log(allCardTitles);
});

test('Client App Login', async ({ browser }) => {

    const context = await browser.newContext();
    const page = await context.newPage();
    const userName = page.locator("#userEmail");
    const signInBtn = page.locator("#login");
    const cardTitles = page.locator(".card-body b");
    const products = page.locator(".card-body");
    const productName = "ZARA COAT 3";
    const email = "tester123@example.com";
    await page.goto("https://rahulshettyacademy.com/client/#/auth/login");
    console.log(await page.title());
    await expect(page).toHaveTitle("Let's Shop");
    await userName.fill(email);
    await page.locator("[type='password']").fill("Testtest1@");
    await signInBtn.click();
    // await page.waitForLoadState('networkidle');
    // console.log(await cardTitles.first().textContent());
    // console.log(await cardTitles.nth(1).textContent());
    await cardTitles.first().waitFor();
    const allCardTitles = await cardTitles.allTextContents();
    // console.log(allCardTitles);
    //Zara coat
    const count = await products.count();
    for (let i = 0; i < count; ++i) {
        if (await products.nth(i).locator("b").textContent() === productName) {
            // add to cart
            await products.nth(i).locator("text= Add To Cart").click();
            break;
        }
    }
    await page.locator("[routerlink*='cart']").click();

    // await page.locator("div li").first().waitFor();
    const cartItem = page.locator('h3', { hasText: productName });
    await expect(cartItem).toBeVisible();

    const bool = await page.locator("h3:has-text('ZARA COAT 3')").isVisible();
    expect(bool).toBeTruthy();

    // await page.pause();
    const selectBox = page.locator(".input.ddl");
    const textBox = page.locator(".input.input.txt");
    await page.locator("text=Checkout").click();
    await selectBox.nth(0).selectOption("02");
    await selectBox.nth(1).selectOption("28");
    await textBox.nth(1).fill("012");
    await textBox.nth(2).fill("SHOHEI CHIYOJIMA");
    await textBox.nth(3).fill("rahulshettyacademy");
    await page.locator("button[type*='submit']").click();
    const appliedLocator = await page.locator(".mt-1.ng-star-inserted");
    const couponApplied = await appliedLocator.textContent();
    console.log(couponApplied);
    expect(appliedLocator).toHaveText("* Coupon Applied");
    await page.locator("[placeholder*='Country']").pressSequentially("Ja", { delay: 150 });
    const dropdown = page.locator(".ta-results");
    await dropdown.first().waitFor();
    const optionsCount = await dropdown.locator("button").count();
    for (let i = 0; i < optionsCount; ++i) {
        const text = await dropdown.locator("button").nth(i).textContent();
        if (text === " Japan") {
            await dropdown.locator("button").nth(i).click();
            break;
        }
    }

    await expect(page.locator(".user__name label[type='text']")).toHaveText(email);

    await page.locator(".btnn").click();

    const thankYouForTheOrderExpectedLetter = " Thankyou for the order. ";
    const thankYouForTheOrderLocator = page.locator(".hero-primary");
    await thankYouForTheOrderLocator.waitFor();
    await expect(thankYouForTheOrderLocator).toHaveText(thankYouForTheOrderExpectedLetter);

    const orderNumberPre = await page.locator("label[class='ng-star-inserted']").textContent();
    if (!orderNumberPre) {
        throw new Error("Order Number Text not found");
    }

    // console.log(orderNumberPre);
    const orderNumberArray = orderNumberPre.split(" ");
    // console.log(orderNumberArray);
    const orderNumber = orderNumberArray[2]
    console.log(orderNumber);

    await page.locator("i[class*='fa-handshake-o']").click();
    const oderTable = page.locator("tbody tr");
    await oderTable.first().waitFor();
    const oderCount = await oderTable.count();
    console.log(oderCount);
    for (let i = 0; i < oderCount; i++) {
        const y = await oderTable.locator("th").nth(i).textContent();
        if (y === orderNumber) {
            expect(y, orderNumber).toBeTruthy();
            await oderTable.locator("td button[class*='btn btn-primary']").nth(i).first().click();
            break;
        }
    }
    const emailTitleLocator = await page.locator("div[class='email-title']");
    const emailTitle = " order summary ";
    // console.log(emailTitle);
    emailTitleLocator.waitFor();
    await expect(emailTitleLocator).toHaveText(emailTitle);

    // await page.pause();

});

test('UI Control Test', async ({ page }) => {
    // const userName = page.locator("#userEmail");
    // const signInBtn = page.locator("#login");
    const dropdown = page.locator("select.form-control");
    const blinkingText = page.locator("[href*='documents-request']");
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    await dropdown.selectOption("Consultant");
    await page.locator(".radiotextsty").last().click();
    await page.locator("#okayBtn").click();
    console.log(await page.locator(".radiotextsty").last().isChecked());
    await expect(page.locator(".radiotextsty").last()).toBeChecked();
    await page.locator("#terms").click();
    await expect(page.locator("#terms")).toBeChecked();
    await page.locator("#terms").uncheck();
    expect(await page.locator("#terms").isChecked()).toBeFalsy();
    await expect(blinkingText).toHaveAttribute('class', 'blinkingText');

});

test('Child tab handling', async ({ browser }) => {
    //For original page
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    const blinkingText = page.locator("[href*='documents-request']");
    const userName = page.locator("#username");
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        blinkingText.click(),
    ])
    const text = await newPage.locator(".red").textContent();
    if (!text) {
        throw new Error("Text not found");
    }

    const arrayText = text.split("@")
    // console.log(arrayText);
    // const arrayText2 = arrayText[1].split(" ")
    // console.log(arrayText2);
    const domain = arrayText[1].split(" ")[0]
    // console.log(domain);
    await userName.fill(domain);
    console.log(await userName.inputValue());

})