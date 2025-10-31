const { test, expect, request } = require('@playwright/test');
const { APiUtils } = require('../utils/APiUtils');

const loginPayload = { userEmail: "shohei@example.com", userPassword: "Shohei@chiyojima1" };
const orderPayload = { orders: [{ country: "Albania", productOrderedId: "68a961719320a140fe1ca57c" }] };
const fakePayloadOrders = { data: [], message: "No Orders" };

let response;
test.beforeAll(async () => {
    const apiCpntext = await request.newContext();
    const apiUtils = new APiUtils(apiCpntext, loginPayload);
    response = await apiUtils.createOrder(orderPayload);

});

test('Web API Part1', async ({ page }) => {
    await page.addInitScript(value => {
        window.localStorage.setItem('token', value);
    }, response.token);

    await page.goto("https://rahulshettyacademy.com/client");
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",
        async route => {
            const response = await page.request.fetch(route.request())
            let body = JSON.stringify(fakePayloadOrders);
            route.fulfill(
                {
                    response,
                    body
                }
            )
            //intercepting response - API response -> {playwright fakeresponse} ->brouser -> render data on front

        }
    )
    await page.locator("button[routerlink*='myorders']").click();
    await page.waitForResponse("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*");
    // await page.pause();
    // await page.locator("tbody").waitFor();
    // const rows = page.locator("tbody tr");
    console.log(await page.locator(".mt-4").textContent());

});
