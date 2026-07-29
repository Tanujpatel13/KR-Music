const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = path.join(__dirname, '..', 'public');
const audioDir = path.join(publicDir, 'audio');
const imagesDir = path.join(publicDir, 'images');

// Ensure directories exist
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

const assets = [
  // Audio Files (Stanford CCRMA High-Speed MP3 files)
  {
    url: 'https://ccrma.stanford.edu/~jos/mp3/pno-cs.mp3',
    dest: path.join(audioDir, 'kesariya.mp3')
  },
  {
    url: 'https://ccrma.stanford.edu/~jos/mp3/gtr-jazz-spec.mp3',
    dest: path.join(audioDir, 'tum_hi_ho.mp3')
  },
  {
    url: 'https://ccrma.stanford.edu/~jos/mp3/harpejji-gliss.mp3',
    dest: path.join(audioDir, 'srivalli.mp3')
  },
  {
    url: 'https://ccrma.stanford.edu/~jos/mp3/md-4004.mp3',
    dest: path.join(audioDir, 'samayama.mp3')
  },
  {
    url: 'https://ccrma.stanford.edu/~jos/mp3/md-4006.mp3',
    dest: path.join(audioDir, 'sirivennela.mp3')
  },
  // Images (High-quality cover art)
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
    dest: path.join(imagesDir, 'kesariya.jpg')
  },
  {
    url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300',
    dest: path.join(imagesDir, 'tum_hi_ho.jpg')
  },
  {
    url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300',
    dest: path.join(imagesDir, 'srivalli.jpg')
  },
  {
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
    dest: path.join(imagesDir, 'samayama.jpg')
  },
  {
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    dest: path.join(imagesDir, 'sirivennela.jpg')
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Follow HTTP redirects (301 or 302)
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP Status ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded to: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete local temp file
      reject(err);
    });
  });
}

async function startDownloads() {
  console.log('Downloading music and cover assets locally to prevent streaming buffering...');
  for (const asset of assets) {
    try {
      await downloadFile(asset.url, asset.dest);
    } catch (err) {
      console.error(`Error downloading asset:`, err.message);
    }
  }
  console.log('All downloads completed successfully!');
}

startDownloads();
