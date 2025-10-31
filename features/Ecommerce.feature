Feature: Ecommerce validations
@Regression
Scenario: Placing the order
Given a login to Ecommerce application with "shohei@example.com" and "Shohei@chiyojima1"
When Add "ZARA COAT 3" to cart
Then Verify "ZARA COAT 3" is displayed in the cart
When Enter valid details and place the order
Then Verify order in present in the order history