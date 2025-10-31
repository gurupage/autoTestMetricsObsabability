const {test,expect} = require('@playwright/test');

let webContext;
let email;

test.beforeAll(async({browser}) =>
{
    const context = await browser.newContext();
    const page = await context.newPage();
    const userName = page.locator("#userEmail");
    email = "shohei@example.com";
    const signInBtn = page.locator("#login");
    const cardTitles = page.locator(".card-body b");

    await page.goto("https://rahulshettyacademy.com/client"); 
    // console.log(await page.title());
    // await expect(page).toHaveTitle("Let's Shop");
    await userName.fill(email);
    await page.locator("[type='password']").fill("Shohei@chiyojima1");
    await signInBtn.click();
    await cardTitles.first().waitFor();
    await context.storageState({path: 'state.json'});
    webContext = await browser.newContext({storageState:'state.json'});

    // await page.waitForLoadState('networkidle');
    // console.log(await cardTitles.first().textContent());
    // console.log(await cardTitles.nth(1).textContent());

})

test('Client App Login', async() => {

        const page = await webContext.newPage();
        await page.goto("https://rahulshettyacademy.com/client"); 
        const products = page.locator(".card-body");
        const productName = "ZARA COAT 3";
        const count = await products.count();
    
        for (let i = 0; i < count; ++i) {
            if (await products.nth(i).locator("b").textContent() === productName) {
                // add to cart
                await products.nth(i).locator("text= Add To Cart").click();
                break;
            }
        }
        await page.locator("[routerlink*='cart']").click();

        //自分でやってみよう、cart全体に対してforでマッチを確認、アサーション。
        await page.locator("div li").first().waitFor();

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
        const orderNumber = orderNumberArray[2];
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

    test('Test2', async() => {

        const page = await webContext.newPage();
        await page.goto("https://rahulshettyacademy.com/client"); 
        // await page.pause();
        const cardTitles = await page.locator(".card-body b");
        await cardTitles.first().waitFor();
        const cardTotlesTxt = await cardTitles.allTextContents();
        console.log(cardTotlesTxt);
 
});