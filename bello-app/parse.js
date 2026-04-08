import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

let dataBuffer = fs.readFileSync('C:\\Users\\pfisc\\Downloads\\stitch_dashboard_de_alimentacao\\racas.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('output.txt', data.text);
}).catch(e => {
    fs.writeFileSync('output.txt', 'ERROR: ' + e.toString());
});
