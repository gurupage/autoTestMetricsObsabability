const { When, Then, Given } = require('@cucumber/cucumber');
const { POManager } = require('../../pageobjects/POManager');
const { expect } = require('@playwright/test');
// const { playwright } = require('@playwright/test');
// const playwright = require('@playwright/test');
const { chromium } = require('playwright');

Given('a login to Ecommerce application with {string} and {string}', { timeout: 40 * 1000 }, async function (username, password) {
    // Write code here that turns the phrase above into concrete actions
    const products = this.page.locator(".card-body");
    const loginPage = this.poManager.getLoginPage();
    await loginPage.goTo();
    await loginPage.validLogin(username, password);

});

When('Add {string} to cart', async function (productName) {
    // Write code here that turns the phrase above into concrete actions
    this.dashboardPage = this.poManager.getDashboardPage();
    await this.dashboardPage.searchProductAddCart(productName);
    await this.dashboardPage.navigateToCart();
});

Then('Verify {string} is displayed in the cart', async function (productName) {
    // Write code here that turns the phrase above into concrete actions
    this.cartPage = this.poManager.getCartPage();
    await this.cartPage.VerifyProductIsDisplayed(productName);
    await this.cartPage.Checkout();
});

When('Enter valid details and place the order', async function () {
    // Write code here that turns the phrase above into concrete actions
    this.ordersReviewPage = this.poManager.getOrdersReviewPage();
    await this.ordersReviewPage.searchCountryAndSelect("ind", "India");
    this.orderId = await this.ordersReviewPage.SubmitAndGetOrderId();
    console.log(this.orderId);
});

Then('Verify order in present in the order history', async function () {
    // Write code here that turns the phrase above into concrete actions
    await this.dashboardPage.navigateToOrders();
    this.ordersHistoryPage = this.poManager.getOrdersHistoryPage();
    await this.ordersHistoryPage.searchOrderAndSelect(this.orderId);
    expect(this.orderId.includes(await this.ordersHistoryPage.getOrderId())).toBeTruthy();
});

Given('a login to Ecommerce2 application with {string} and {string}', async function (username, password) {
    // Write code here that turns the phrase above into concrete actions
    const userName = this.page.locator("#username");
    const signInBtn = this.page.locator("#signInBtn");
    await this.page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    console.log(await this.page.title());
    await expect(this.page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");
    await userName.fill(username);
    await this.page.locator("[type='password']").fill(password);
    await signInBtn.click();

});

Then('Verify Error message is displayed', async function () {
    // Write code here that turns the phrase above into concrete actions
    console.log(await this.page.locator("[style*='block']").textContent());
    await expect(this.page.locator("[style*='block']")).toContainText('Incorrect');
});