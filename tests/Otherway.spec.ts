import {expect, test} from '@playwright/test';
// const {test} = require('@playwright/test');

test('Client App Login', async ({browser})=> {

    const context = await browser.newContext();
    const page = await context.newPage();
    // const userName = page.locator("#userEmail");
    const userNameTextbox = page.getByPlaceholder("email@example.com");
    const passwordTextbox = page.getByPlaceholder("enter your passsword");
    // const signInBtn = page.locator("#login");
    const signInBtn = page.getByRole('button', {name: 'Login'});
    const cardTitles = page.locator(".card-body b");
    const products = page.locator(".card-body");
    const productName = "ADIDAS ORIGINAL";
    const email = "shohei@example.com";
    const password = "Shohei@chiyojima1";
    await page.goto("https://rahulshettyacademy.com/client/#/auth/login"); 
    console.log(await page.title());
    await expect(page).toHaveTitle("Let's Shop");
    await userNameTextbox.fill(email);
    // await page.locator("[type='password']").fill("Shohei@chiyojima1");
    await passwordTextbox.fill(password);
    await signInBtn.click();
    // await page.waitForLoadState('networkidle');
    // console.log(await cardTitles.first().textContent());
    // console.log(await cardTitles.nth(1).textContent());
    await cardTitles.first().waitFor();
    const allCardTitles = await cardTitles.allTextContents();
    // console.log(allCardTitles);

    await page.locator(".card-body").filter({hasText: productName})
    .getByRole("button", {name: ' Add To Cart'}).click();

    // //Zara coat
    // const count = await products.count();
    // for(let i = 0; i < count; ++i)
    // {
    //     if(await products.nth(i).locator("b").textContent() === productName)
    //     {
    //         // add to cart
    //         await products.nth(i).locator("text= Add To Cart").click();
    //         break;
    //     }
    // }

    // await page.locator("[routerlink*='cart']").click();
    await page.getByRole("listitem").getByRole('button', {name: 'Cart'}).click();
    
    // await page.locator("div li").first().waitFor();
    const cartItem = page.locator('h3', { hasText: productName });
    await expect(cartItem).toBeVisible();

    // const bool = await page.locator("h3:has-text('ZARA COAT 3')").isVisible();
    const bool = await page.getByRole('listitem').getByText(productName).isVisible();
    expect(bool).toBeTruthy();

    // await page.pause();
    const selectBox = page.locator(".input.ddl");
    const textBox = page.locator(".input.input.txt");
    // await page.locator("text=Checkout").click();
    await page.getByRole('button', {name: 'Checkout'}).click();
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
    // await page.locator("[placeholder*='Country']").pressSequentially("Ja", {delay: 150});
    await page.getByPlaceholder("Select Country").pressSequentially("Ja", {delay: 150});
    await page.getByRole('button', {name: 'Japan'}).click();

    // const dropdown = page.locator(".ta-results");
    // await dropdown.first().waitFor();
    // const optionsCount = await dropdown.locator("button").count();
    // for(let i = 0; i < optionsCount; ++i)
    // {
    //     const text = await dropdown.locator("button").nth(i).textContent();
    //     if(text === " Japan")
    //     {
    //         await dropdown.locator("button").nth(i).click();
    //         break;
    //     }
    // }

    await expect(page.locator(".user__name label[type='text']")).toHaveText(email);

    // await page.locator(".btnn").click();
    await page.getByText("Place Order ").click();

    const thankYouForTheOrderExpectedLetter = " Thankyou for the order. ";
    const thankYouForTheOrderLocator = page.locator(".hero-primary");
    await thankYouForTheOrderLocator.waitFor();
    // await expect(thankYouForTheOrderLocator).toHaveText(thankYouForTheOrderExpectedLetter);
    await expect(page.getByText(" Thankyou for the order. ")).toBeVisible();

    const orderNumberPre = await page.locator("label[class='ng-star-inserted']").textContent();
    if(!orderNumberPre){
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
    for(let i = 0; i < oderCount; i++)
    {
        const y = await oderTable.locator("th").nth(i).textContent();
        if(y === orderNumber)
        {
            expect(y,orderNumber).toBeTruthy();
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