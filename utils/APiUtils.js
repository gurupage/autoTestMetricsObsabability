class APiUtils
{

    constructor(apiCpntext,loginPayload)
    {
        this.apiCpntext = apiCpntext;
        this.loginPayload = loginPayload;
    }

    async getToken()
    {
        const loginResonse = await this.apiCpntext.post("https://rahulshettyacademy.com/api/ecom/auth/login",
        {
            data: this.loginPayload
        })
        // expect(loginResonse.ok()).toBeTruthy();
        const loginResponseJson = await loginResonse.json();
        const token = loginResponseJson.token;
        console.log(token);
        return token;
    }

    async createOrder(orderPayload)
    {
        let response = {};
        response.token = await this.getToken();
        const orderResponse = await this.apiCpntext.post("https://rahulshettyacademy.com/api/ecom/order/create-order",
        {
            data: orderPayload,
            headers: {
                'Authorization':response.token,
                'content-type':'application/json'
            },
        })
        const orderResponseJson = await orderResponse.json();
        console.log(orderResponseJson);
        const orderId = orderResponseJson.orders[0];
        console.log(orderId);
        response.orderId = orderId;
        return response;
    }
}

module.exports = {APiUtils};