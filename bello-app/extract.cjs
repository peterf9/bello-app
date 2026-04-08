const fs = require("fs");
const PDFParser = require("pdf2json");

let pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync('./racasText.txt', pdfParser.getRawTextContent());
    console.log("PDF parsed successfully into racasText.txt");
});

console.log("Loading PDF...");
pdfParser.loadPDF("C:\\Users\\pfisc\\Downloads\\stitch_dashboard_de_alimentacao\\racas.pdf");
