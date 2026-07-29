const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/usham/Desktop/Projects/KR-Music/web/src';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('http://localhost:5000')) {
    console.log(`Replacing in: ${filePath}`);
    content = content.replace(/http:\/\/localhost:5000/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(directory);
console.log('Replacement complete.');
