const fs = require('fs');
const text = fs.readFileSync('./racasText.txt', 'utf-8');
const lines = text.split('\n');

const breeds = [];
for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.includes('Download do Padrão em PDF') && i >= 3) {
        let originStr = lines[i-1] ? lines[i-1].trim() : "Desconhecido";
        let origin = originStr.replace('', '').trim();
        
        let breedLineIndex = i - 4;
        // Sometimes padding or spacing makes FCI the line i-2
        if (lines[i-2] && lines[i-2].includes('Padrão FCI')) {
           breedLineIndex = i - 3;
        } else if (lines[i-3] && lines[i-3].includes('Padrão FCI')) {
           breedLineIndex = i - 4;
        }

        if (lines[breedLineIndex]) {
            let breedStr = lines[breedLineIndex].trim();
            // fix common pdf kerning issues from this parser
            breedStr = breedStr.replace(/T\s+errier/ig, 'Terrier');
            breedStr = breedStr.replace(/T\s+checoslovaco/ig, 'Tchecoslovaco');
            breedStr = breedStr.replace(/\s{2,}/g, ' ');
            
            // basic cleanup of the fontawesome icon if it leaked
            breedStr = breedStr.replace('', '').trim();
            
            breeds.push({ breed: breedStr, origin: origin });
        }
    }
}
const unique = [];
const seen = new Set();
for (let b of breeds) {
   if (!seen.has(b.breed) && b.breed.length > 2 && !b.breed.includes('-------')) {
       seen.add(b.breed);
       unique.push(b);
   }
}
// Sort by breed name alphabetically
unique.sort((a,b) => a.breed.localeCompare(b.breed));

fs.writeFileSync('./src/utils/breeds.json', JSON.stringify(unique, null, 2));
console.log('Breeds extracted successfully: ' + unique.length);
