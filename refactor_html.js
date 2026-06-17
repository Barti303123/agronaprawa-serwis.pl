const fs = require('fs');
const path = require('path');

const dir = '/Users/bartoszwawrzyniak/.gemini/antigravity/scratch/agronaprawa-serwis.pl';
const files = ['index.html', 'sklep.html', 'produkt.html', 'kontakt.html', 'o-nas.html', 'zwroty.html', 'polityka-prywatnosci.html'];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove user and basket icons, add hamburger
    content = content.replace(
        /<div class="header-icons">[\s\S]*?<\/div>/,
        `<div class="header-icons">\n                        <i class="fa-solid fa-bars menu-toggle"></i>\n                    </div>`
    );

    // Remove double header tags
    content = content.replace(/<\/header>\s*<\/header>/g, '</header>');

    // Update footer year
    content = content.replace(/&copy;\s*202[0-9]/g, '&copy; 2026');

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
