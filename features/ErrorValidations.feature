Feature: Error validations
@Validations
Scenario: Placing the order
Given a login to Ecommerce2 application with "email" and "learning"
Then Verify Error message is displayed
# When Add "ZARA COAT 3" to cart
# Then Verify "ZARA COAT 3" is displayed in the cart
# When Enter valid details and place the order
# Then Verify order in present in the order history