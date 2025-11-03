 const {test, expect} = require('@playwright/test');
 const {POManager} = require('../pageobjects/POManager');

 test('Client App login', async ({page})=>
 {
   const poManager = new POManager(page);
    //js file- Login js, DashboardPage
     const username = "tester123@example.com";
     const password = "Testtest1@"
     const productName = 'iphone 13 pro';
     const products = page.locator(".card-body");
     const loginPage = poManager.getLoginPage();
     await loginPage.goTo();
     await loginPage.validLogin(username,password);
     const dashboardPage = poManager.getDashboardPage();
     await dashboardPage.searchProductAddCart(productName);
     await dashboardPage.navigateToCart();

    const cartPage = poManager.getCartPage();
    await cartPage.VerifyProductIsDisplayed(productName);
    await cartPage.Checkout();

    const ordersReviewPage = poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect("ind","India");
    const orderId = await ordersReviewPage.SubmitAndGetOrderId();
   console.log(orderId);
   await dashboardPage.navigateToOrders();
   const ordersHistoryPage = poManager.getOrdersHistoryPage();
   await ordersHistoryPage.searchOrderAndSelect(orderId);
   expect(orderId.includes(await ordersHistoryPage.getOrderId())).toBeTruthy();














  


    


    //Zara Coat 4





    









 });
 

 



 

