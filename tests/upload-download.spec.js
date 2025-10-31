const ExcelJs = require('exceljs');
const { test, expect } = require('@playwright/test');

async function writeExcelTest(searchText, replaceText, change, filePath) {
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Sheet1');
    const output = await readExcel(worksheet, searchText);
    const cell = worksheet.getCell(output.row, output.column + change.colChange);
    cell.value = replaceText;
    await workbook.xlsx.writeFile(filePath);
}

async function readExcel(worksheet, searchText) {
    let output = { row: -1, column: -1 };
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.value === searchText) {
                output.row = rowNumber;
                output.column = colNumber;
            }
        })
    })
    return output;
}

test('Upload download excel validation', async ({ page }, testInfo) => {
    const textSearch = 'Mango';
    const updateValue = '350';

    await page.goto("https://rahulshettyacademy.com/upload-download-test/index.html");

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;
    const savedPath = testInfo.outputPath(download.suggestedFilename());
    console.log(savedPath);
    await download.saveAs(savedPath); // ここに保存される

    // Excelの書き換え
    await writeExcelTest(textSearch, updateValue, { rowChange: 0, colChange: 2 }, savedPath);

    await page.locator("#fileinput").click();
    await page.locator("#fileinput").setInputFiles(savedPath);

    const textlocator = page.getByText(textSearch);
    const desiredRow = page.getByRole('row').filter({ has: textlocator });
    await expect(desiredRow.locator("#cell-4-undefined")).toContainText(updateValue);
})
