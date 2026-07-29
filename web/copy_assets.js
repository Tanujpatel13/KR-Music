const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/usham/Desktop/Projects/KR-Music/backend/public';
const destDir = 'c:/Users/usham/Desktop/Projects/KR-Music/web/public/static';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

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

console.log('Files copied successfully.');
