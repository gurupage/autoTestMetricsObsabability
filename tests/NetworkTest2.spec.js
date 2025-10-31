const { test, expect, request } = require('@playwright/test');

test('Security test', async ({ page }) => {

    const userName = page.locator("#userEmail");
    const email = "shohei@example.com";
    const signInBtn = page.locator("#login");
    const cardTitles = page.locator(".card-body b");

    await page.goto("https://rahulshettyacademy.com/client");
    await userName.fill(email);
    await page.locator("[type='password']").fill("Shohei@chiyojima1");
    await signInBtn.click();
    await cardTitles.first().waitFor();
    await page.locator("button[routerlink*='myorders']").click();

    //login reach orders page
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*",
        async route => route.continue({ url: "https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=621661f884b053f6765465b6" })
    )
    await page.locator("button:has-text('View')").last().click();
    // await page.pause();
    await expect(page.locator("p").last()).toHaveText("You are not authorize to view this order");
})