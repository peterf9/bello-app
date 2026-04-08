const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('C:\\Users\\pfisc\\Downloads\\stitch_dashboard_de_alimentacao\\racas.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('output.txt', data.text);
}).catch(e => {
    fs.writeFileSync('output.txt', 'ERROR: ' + e.toString());
});
