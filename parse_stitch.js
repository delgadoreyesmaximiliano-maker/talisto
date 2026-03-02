const fs = require('fs');
try {
    const html = fs.readFileSync('C:/Users/MaxDe/OneDrive/Escritorio/proyecto/stitch_screen.html', 'utf8');
    fs.mkdirSync('C:/Users/MaxDe/.gemini/antigravity/brain/2315e462-e160-4a50-ad28-cdced4148049', { recursive: true });
    fs.writeFileSync('C:/Users/MaxDe/.gemini/antigravity/brain/2315e462-e160-4a50-ad28-cdced4148049/stitch_design.html', html);
    console.log('Saved html to artifact dir: ' + html.length + ' bytes');
} catch (e) {
    console.error(e);
}
