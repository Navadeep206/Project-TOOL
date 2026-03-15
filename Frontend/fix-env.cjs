const fs = require('fs');
const path = require('path');

const dir = 'src';
const searchFor = /import\.meta\.env\.VITE_API_BASE_URL(?!\s*\|\|)/g;
const replaceWith = "(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')";

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath);
        } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            if (searchFor.test(content)) {
                // reset lastIndex because test() advances it
                searchFor.lastIndex = 0;
                content = content.replace(searchFor, replaceWith);
                fs.writeFileSync(dirPath, content);
                console.log('Updated: ' + dirPath);
            }
        }
    });
}
walk(dir);
