const {test,expect,request} = require('@playwright/test');
const { APiUtils } = require('../utils/APiUtils');

const loginPayload = {userEmail:"shohei@example.com",userPassword:"Shohei@chiyojima1"};
const orderPayload = {orders:[{country:"Albania",productOrderedId:"68a961719320a140fe1ca57c"}]};

// let token;
// let orderId;
let response;

test.beforeAll(async()=>
{
    const apiCpntext = await request.newContext();
    const apiUtils = new APiUtils(apiCpntext, loginPayload);
    response = await apiUtils.createOrder(orderPayload);
    // const loginResonse = await apiCpntext.post("https://rahulshettyacademy.com/api/ecom/auth/login",
    //     {
    //         data: loginPayload
    //     })
    // expect(loginResonse.ok()).toBeTruthy();
    // const loginResponseJson = await loginResonse.json();
    // token = loginResponseJson.token;
    // console.log(token);

    //Order API
    // const orderResponse = await apiCpntext.post("https://rahulshettyacademy.com/api/ecom/order/create-order",
    // {
    //     data: orderPayload,
    //     headers: {
    //         'Authorization':token,
    //         'content-type':'application/json'
    //     },
    // })
    // const orderResponseJson = await orderResponse.json();
    // console.log(orderResponseJson);
    // orderId = orderResponseJson.orders[0];
    // console.log(orderId);

});


test('Web API Part1', async ({page})=> {
    // const context = await browser.newContext();
    // const page = await context.newPage();

    // const apiUtils = new APIUtils(apiCpntext,loginPayload);
    // const orderId = createOrder(orderPayload);

    await page.addInitScript(value => {
        window.localStorage.setItem('token', value);
    }, response.token);

    // const userName = page.locator("#userEmail");
    // const signInBtn = page.locator("#login");
    // const cardTitles = page.locator(".card-body b");
    // const products = page.locator(".card-body");
    // const productName = "ZARA COAT 3";
    // const email = "shohei@example.com";
    await page.goto("https://rahulshettyacademy.com/client"); 

    // console.log(await page.title());
    // await expect(page).toHaveTitle("Let's Shop");
    // await userName.fill(email);
    // await page.locator("[type='password']").fill("Shohei@chiyojima1");
    // await signInBtn.click();

    // await page.waitForLoadState('networkidle');
    // console.log(await cardTitles.first().textContent());
    // console.log(await cardTitles.nth(1).textContent());
    // await cardTitles.first().waitFor();
    // const allCardTitles = await cardTitles.allTextContents();
    // // console.log(allCardTitles);
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

    // //自分でやってみよう、cart全体に対してforでマッチを確認、アサーション。
    // await page.locator("div li").first().waitFor();

    // const bool = await page.locator("h3:has-text('ZARA COAT 3')").isVisible();
    // expect(bool).toBeTruthy();

    // // await page.pause();
    // const selectBox = page.locator(".input.ddl");
    // const textBox = page.locator(".input.input.txt");
    // await page.locator("text=Checkout").click();
    // await selectBox.nth(0).selectOption("02");
    // await selectBox.nth(1).selectOption("28");
    // await textBox.nth(1).fill("012");
    // await textBox.nth(2).fill("SHOHEI CHIYOJIMA");
    // await textBox.nth(3).fill("rahulshettyacademy");
    // await page.locator("button[type*='submit']").click();

    // const appliedLocator = await page.locator(".mt-1.ng-star-inserted");
    // const couponApplied = await appliedLocator.textContent();
    // console.log(couponApplied);
    // expect(appliedLocator).toHaveText("* Coupon Applied");
    // await page.locator("[placeholder*='Country']").pressSequentially("Ja", {delay: 150});
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

    // await expect(page.locator(".user__name label[type='text']")).toHaveText(email);

    // await page.locator(".btnn").click();

    // const thankYouForTheOrderExpectedLetter = " Thankyou for the order. ";
    // const thankYouForTheOrderLocator = page.locator(".hero-primary");
    // await thankYouForTheOrderLocator.waitFor();
    // await expect(thankYouForTheOrderLocator).toHaveText(thankYouForTheOrderExpectedLetter);

    // const orderNumberPre = await page.locator("label[class='ng-star-inserted']").textContent();
    // if(!orderNumberPre){
    //     throw new Error("Order Number Text not found");
    // }

    // console.log(orderNumberPre);
    // const orderNumberArray = orderNumberPre.split(" ");
    // console.log(orderNumberArray);
    // const orderNumber = orderNumberArray[2]
    // console.log(orderNumber);

    await page.locator("button[routerlink*='myorders']").click();
    await page.locator("tbody").waitFor();
    const rows = page.locator("tbody tr");
   
   for (let i = 0; i < await rows.count(); ++i) {
      const rowOrderId = await rows.nth(i).locator("th").textContent();
      if (response.orderId.includes(rowOrderId)) {
         await rows.nth(i).locator("button").first().click();
         break;
      }
   }
   const orderIdDetails = await page.locator(".col-text").textContent();
   expect(response.orderId.includes(orderIdDetails)).toBeTruthy();

    // await page.pause();

});

//Verify if order created is showing in history page
// Precondition - create order -