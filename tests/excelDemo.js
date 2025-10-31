const ExcelJs = require('exceljs');

async function wrightExcel(searchText, replaceText,change,filePath) {

    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Sheet1');
    const output = await readExcel(worksheet,searchText,change);
    const cell = worksheet.getCell(output.row+change.rowChange, output.column+change.colChange);
    cell.value = replaceText;
    await workbook.xlsx.writeFile(filePath);

}

async function readExcel(worksheet,searchText) {
    let output = { row: -1, column: -1 };
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            // console.log(cell.value);
            if (cell.value === searchText) {
                output.row = rowNumber;
                output.column = colNumber;
            }
        })
    })
    return output;
}

wrightExcel("Mango",350,{rowChange:0,colChange:2},"C:/Users/gurup/Downloads/download.xlsx");