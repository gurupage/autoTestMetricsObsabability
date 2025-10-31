import { test, expect } from '@playwright/test';

test('Popup validation', async({page}) => 
{
    await page.goto("https://rahulshettyacademy.com/AutomationPractice/");
    await expect(page.locator("#displayed-text")).toBeVisible();
    await page.locator("#hide-textbox").click();
    await expect(page.locator("#displayed-text")).toBeHidden();
    page.pause();
    page.on('dialog', dialog => dialog.accept());
    await page.locator("#confirmbtn").click();
    await page.locator("#mousehover").hover();

    const framesPage = page.frameLocator("#courses-iframe");
    if(!framesPage){
        throw new Error("Page not found");
    }

    await framesPage.locator("li a[href*='lifetime-access']:visible").click();
    
    const  HappySubscibers = await framesPage.locator(".text h2").textContent();
    if(!HappySubscibers){
        throw new Error("text not found");
    }
    console.log(HappySubscibers);
    const array = HappySubscibers.split(' ');
    console.log(array);
    const SubscriberNumber = array[1]
    console.log(SubscriberNumber);


})