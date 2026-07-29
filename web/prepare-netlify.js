const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../backend/public');
const destDir = path.join(__dirname, 'public/static');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Copying static assets from backend...');
copyRecursiveSync(srcDir, destDir);

// Copy generated Popular Hits cover if it exists in the brain folder
const brainCoverPath = 'C:/Users/usham/.gemini/antigravity-ide/brain/b776814c-a4d2-4f62-adea-4d30ce39930f/popular_hits_1781201382146.png';
const backendCoverPath = path.join(__dirname, '../backend/public/images/popular_hits.jpg');
const webCoverPath = path.join(__dirname, 'public/static/images/popular_hits.jpg');

if (fs.existsSync(brainCoverPath)) {
  console.log('Copying generated Popular Hits cover to assets...');
  fs.copyFileSync(brainCoverPath, backendCoverPath);
  fs.copyFileSync(brainCoverPath, webCoverPath);
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('http://localhost:5000')) {
    console.log(`Replacing in: ${filePath}`);
    content = content.replace(/http:\/\/localhost:5000/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

console.log('Replacing hardcoded localhost URLs...');
walkDir(path.join(__dirname, 'src'));
console.log('Ready for Netlify build!');
