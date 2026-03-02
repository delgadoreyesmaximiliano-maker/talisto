const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/MaxDe/.gemini/antigravity/brain/2315e462-e160-4a50-ad28-cdced4148049/.system_generated/steps/136/output.txt', 'utf8'));

const darkScreens = (data.screens || []).filter(s => s.title && s.title.includes('Dark Elegance'));
console.log(`Found ${darkScreens.length} matching screens:`);
darkScreens.forEach(s => {
    console.log(`- ${s.title}: ${s.name}`);
});
