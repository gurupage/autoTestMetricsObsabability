import { test, expect } from '@playwright/test';

// test("Calendar validations",async({page})=>
// {
 
//     const monthNumber = "6";
//     const date = "15";
//     const year = "2027";
//     const expectedList = [monthNumber,date,year];
    
//     await page.goto("https://rahulshettyacademy.com/seleniumPractise/#/offers");
//     await page.locator(".react-date-picker__inputGroup").click();
//     await page.locator(".react-calendar__navigation__label").click();
//     await page.locator(".react-calendar__navigation__label").click();
//     await page.getByText(year).click();
//     await page.locator(".react-calendar__year-view__months__month").nth(Number(monthNumber)-1).click();
//     await page.locator("//abbr[text()='"+date+"']").click();
 
//     const inputs =  page.locator('.react-date-picker__inputGroup__input')
 
//     for(let i =0; i<expectedList.length;i++)
//     {
//         const value = await inputs.nth(i).inputValue();
//         expect(value).toEqual(expectedList[i]);
 
//     }
 
 
// })

test('Calender validations', async({page}) =>{
    const month = "10";
    const date = "22";
    const year = "2025";
    const expectedlist = [month, date, year];

    await page.goto("https://rahulshettyacademy.com/seleniumPractise/#/offers");
    const deliveryDate = page.locator(".react-date-picker__inputGroup");
    await deliveryDate.click();
    await page.locator(".react-calendar__navigation__label__labelText").click();
    await page.locator(".react-calendar__navigation__label__labelText").click();
    await page.getByText(year).click();
    await page.locator(".react-calendar__year-view__months__month").nth(Number(month)-1).click();
    await page.locator("//abbr[text()='"+date+"']").click();
    // await expect(deliveryDate).locator("toHaveText(year+"/"+month+"/"+date);
    const inputs = page.locator(".react-date-picker__inputGroup__input");

    for(let i=0; i < expectedlist.length; i++)
    {
        const value = await inputs.nth(i).inputValue();
        expect(value).toEqual(expectedlist[i]);
    }
})