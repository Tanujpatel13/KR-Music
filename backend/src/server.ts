import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import Controllers
import * as authController from './controllers/auth.controller';
import * as songController from './controllers/song.controller';
import * as playlistController from './controllers/playlist.controller';
import * as searchController from './controllers/search.controller';
import * as paymentController from './controllers/payment.controller';
import * as adminController from './controllers/admin.controller';
import * as userController from './controllers/user.controller';
import * as aiController from './controllers/ai.controller';


// Import Middlewares
import { authenticateJWT, requireAdmin } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io for realtime collaborative listening and playlist updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: true,
  credentials: true,
}));


// Stripe webhook endpoint must receive raw buffer, not JSON
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

app.use(express.json());
app.use(cookieParser());
app.use('/static', express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));
app.use('/local-songs', express.static(path.join(process.cwd(), '..', 'Songs'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));
app.use('/local-images', express.static(path.join(process.cwd(), '..', 'images'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// SOCKET.IO REALTIME EVENTS
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join collaborative playlist room
  socket.on('join-playlist-room', (playlistId) => {
    socket.join(`playlist:${playlistId}`);
    console.log(`User ${socket.id} joined room playlist:${playlistId}`);
  });

  // Notify other collaborative users when playlist changes
  socket.on('playlist-updated', ({ playlistId, songId, action }) => {
    socket.to(`playlist:${playlistId}`).emit('playlist-changed', { songId, action });
  });

  // Listen-along (real-time state sharing)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sync-playback', ({ roomId, songId, isPlaying, progress }) => {
    socket.to(roomId).emit('playback-synced', { songId, isPlaying, progress });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ROUTING APIs

// 1. Auth Routing
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/refresh', authController.refreshToken);
app.post('/api/auth/logout', authController.logout);
app.post('/api/auth/social', authController.socialLogin);

// 2. Songs & Music Playback Routing
app.get('/api/songs/home', songController.getHomeFeed);
app.get('/api/songs/yt-stream/:videoId', songController.streamYoutubeVideo);
app.post('/api/songs/:songId/play', authenticateJWT, songController.playSong);
app.post('/api/songs/:songId/history', authenticateJWT, songController.updateHistoryDuration);
app.post('/api/songs/:songId/favorite', authenticateJWT, songController.toggleFavorite);
app.get('/api/songs/:songId/lyrics', authenticateJWT, songController.getLyrics);

// 3. Playlists Routing
app.get('/api/playlists/public', playlistController.getPublicPlaylists);
app.post('/api/playlists', authenticateJWT, playlistController.createPlaylist);
app.get('/api/playlists/me', authenticateJWT, playlistController.getUserPlaylists);
app.get('/api/playlists/:id/songs', playlistController.getPlaylistSongs);  // paginated songs
app.get('/api/playlists/:id', playlistController.getPlaylistById);
app.put('/api/playlists/:id', authenticateJWT, playlistController.updatePlaylist);
app.delete('/api/playlists/:id', authenticateJWT, playlistController.deletePlaylist);
app.post('/api/playlists/:playlistId/songs', authenticateJWT, playlistController.addSongToPlaylist);
app.delete('/api/playlists/:playlistId/songs/:songId', authenticateJWT, playlistController.removeSongFromPlaylist);

// 4. Advanced Search Routing
app.get('/api/search', searchController.search);

// 5. Payment Subscriptions Routing
app.post('/api/payments/checkout', authenticateJWT, paymentController.createCheckoutSession);
app.post('/api/payments/mock-activate', authenticateJWT, paymentController.devMockPremium);

// 6. Admin Panel Routing
app.get('/api/admin/stats', authenticateJWT, requireAdmin, adminController.getDashboardStats);
app.post('/api/admin/songs', authenticateJWT, requireAdmin, adminController.adminUploadSong);
app.delete('/api/admin/users/:id', authenticateJWT, requireAdmin, adminController.deleteUser);

// 7. User Profiles, Recommendations, Follows & Jamendo routing
app.get('/api/users/profile', authenticateJWT, userController.getProfile);
app.put('/api/users/profile', authenticateJWT, userController.updateProfile);
app.get('/api/recommendations', authenticateJWT, userController.getRecommendations);
app.get('/api/songs/external', userController.getExternalSongs);
app.post('/api/social/follow', authenticateJWT, userController.toggleFollow);

// 8. OpenRouter Gemma AI Chatbot Routing
app.post('/api/ai/chat', aiController.handleAiChat);


// Fallback status check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Self-healing local asset downloader (with redirect following and protocol switching)
const downloadFile = (url: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const client = url.startsWith('https') ? https : http;
      
      const requestOptions = {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };

      client.get(requestOptions, (response) => {
        // Follow HTTP redirects (301 or 302)
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            let absoluteUrl = redirectUrl;
            if (!redirectUrl.startsWith('http')) {
              absoluteUrl = `${parsedUrl.origin}${redirectUrl}`;
            }
            downloadFile(absoluteUrl, dest).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP Status ${response.statusCode} for URL: ${url}`));
          return;
        }

        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const ensureAssets = async () => {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const audioDir = path.join(publicDir, 'audio');
    const imagesDir = path.join(publicDir, 'images');

    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

    // Clean up any incorrect placeholder files from previous seed runs
    const orangeMirchiPlaceholderFiles = [
      'ola_olaala.mp3', 'rooba_rooba.mp3', 'chilipiga.mp3', 'nenu_nuvvantu.mp3',
      'hello_rammante.mp3', 'o_range.mp3', 'nakosam_nuvu.mp3',
      'mirchi_theme.mp3', 'yahoon_yahoon.mp3', 'pandagala_digivachavu.mp3', 'darlingey.mp3'
    ];
    for (const filename of orangeMirchiPlaceholderFiles) {
      const filepath = path.join(audioDir, filename);
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size === 4363648) {
          try {
            fs.unlinkSync(filepath);
            console.log(`Deleted incorrect placeholder file: ${filename}`);
          } catch (e: any) {
            console.error(`Failed to delete incorrect placeholder file ${filename}:`, e.message);
          }
        }
      }
    }

    // Clean up any old corrupted/truncated placeholders or those using the old github raw sample size
    const sizesToClean = [7373059, 311296, 3763008];
    const filesToClean = [
      'kesariya.mp3', 'tum_hi_ho.mp3', 'mirchi_theme.mp3', 'yahoon_yahoon.mp3', 
      'pandagala_digivachavu.mp3', 'darlingey.mp3', 'nee_kanti_chupullo.mp3'
    ];
    for (const filename of filesToClean) {
      const filepath = path.join(audioDir, filename);
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (sizesToClean.includes(stats.size)) {
          try {
            fs.unlinkSync(filepath);
            console.log(`Deleted old/corrupted placeholder file: ${filename}`);
          } catch (e: any) {
            console.error(`Failed to delete old/corrupted placeholder file ${filename}:`, e.message);
          }
        }
      }
    }

    const PLACEHOLDER_AUDIO_URL = 'https://ccrma.stanford.edu/~jos/mp3/pno-cs.mp3';

    const assets = [
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'kesariya.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'tum_hi_ho.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'srivalli.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'samayama.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'sirivennela.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'ola_olaala.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'rooba_rooba.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'chilipiga.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'nenu_nuvvantu.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'hello_rammante.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'o_range.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'nakosam_nuvu.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'mirchi_theme.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'yahoon_yahoon.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'pandagala_digivachavu.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'darlingey.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'nee_kanti_chupullo.mp3') },
      { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', dest: path.join(imagesDir, 'kesariya.jpg') },
      { url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300', dest: path.join(imagesDir, 'tum_hi_ho.jpg') },
      { url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300', dest: path.join(imagesDir, 'srivalli.jpg') },
      { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300', dest: path.join(imagesDir, 'samayama.jpg') },
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', dest: path.join(imagesDir, 'sirivennela.jpg') },
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/c5/Darling_%282010_film%29_poster.jpg', dest: path.join(imagesDir, 'darling.jpg') },
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/c2/Majili_poster.jpg', dest: path.join(imagesDir, 'majili.jpg') },
      { url: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Arjun_2004_poster.jpg', dest: path.join(imagesDir, 'arjun.jpg') },
      { url: 'https://upload.wikimedia.org/wikipedia/en/d/d1/Baahubali_Soundtrack.jpg', dest: path.join(imagesDir, 'bahubali.jpg') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'okka_mata.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'aey_pilla.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'dum_dumare.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'o_cheli.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'madhura_madhuratara.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'madhura_madhura.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'madhura_madhure_meenakshi.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'raa_raa.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'ra_ra_rajakumara.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'dhivara.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'mamathala_thalli.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'mamatala_talli.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'manohari.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'sivuni_aana.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'pachha_bottasi.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'pacha_bottasi.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'jeeva_nadhi.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'jeva_nadhi.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'nippule_swasaga.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'nippulaa_swasaga.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'dhivara_english.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'dheevara_english.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'chikiri_chikiri.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'hellallallo.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'massa_massa.mp3') },
      { url: PLACEHOLDER_AUDIO_URL, dest: path.join(audioDir, 'rai_rai_raa_raa.mp3') },
      { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', dest: path.join(imagesDir, 'peddi.jpg') }
    ];

    for (const asset of assets) {
      const fileExists = fs.existsSync(asset.dest);
      let isCorrupted = false;

      if (fileExists) {
        const stats = fs.statSync(asset.dest);
        const minSize = asset.dest.endsWith('.mp3') ? 50000 : 1000;
        if (stats.isDirectory() || stats.size < minSize) {
          isCorrupted = true;
          try {
            if (stats.isDirectory()) {
              fs.rmSync(asset.dest, { recursive: true, force: true });
            } else {
              fs.unlinkSync(asset.dest);
            }
          } catch (e) {}
        }
      }

      if (!fileExists || isCorrupted) {
        console.log(`Downloading missing local asset: ${path.basename(asset.dest)}...`);
        try {
          await downloadFile(asset.url, asset.dest);
        } catch (err: any) {
          console.error(`Error downloading local asset:`, err.message);
        }
      }
    }
  } catch (err: any) {
    console.error('Error during assets verification:', err.message);
  }
};

const copyGeneratedCovers = () => {
  const assets: any[] = [];
  const destDir = path.join(process.cwd(), 'public', 'images');
  for (const asset of assets) {
    if (fs.existsSync(asset.src)) {
      try {
        fs.copyFileSync(asset.src, path.join(destDir, asset.dest));
        console.log(`Successfully copied generated cover: ${asset.dest}`);
      } catch (e: any) {
        console.error(`Failed to copy generated cover ${asset.dest}:`, e.message);
      }
    }
  }
};

const copyMovieCovers = () => {
  const localImagesDir = path.join(process.cwd(), '..', 'images');
  const assets = [
    { src: path.join(localImagesDir, 'ea maya chesave.jpg'), dest: 'ye_maaya_chesave.jpg' },
    { src: path.join(localImagesDir, 'ea maya chesave.jpg'), dest: 'ea_maya_chesave.jpg' },
    { src: path.join(localImagesDir, 'rangastalam.jpg'), dest: 'rangasthalam.jpg' },
    { src: path.join(localImagesDir, 'rangastalam.jpg'), dest: 'rangastalam.jpg' },
    { src: path.join(localImagesDir, 'Arya-jpeg-300x300.jpg'), dest: 'arya.jpg' },
    { src: path.join(localImagesDir, 'ala-vaikuntapuramlo-songs.jpg'), dest: 'ala_vaikunthapurramuloo.jpg' },
    { src: path.join(localImagesDir, 'ala-vaikuntapuramlo-songs.jpg'), dest: 'ala_vaikuntapuramlo.jpg' },
    { src: path.join(localImagesDir, 'Geetha-Govindam-2018.jpg'), dest: 'geetha_govindham.jpg' },
    { src: path.join(localImagesDir, 'Geetha-Govindam-2018.jpg'), dest: 'geetha_govindam.jpg' },
    { src: path.join(localImagesDir, 'Orange-2010jpeg-300x300.jpg'), dest: 'orange.jpg' },
    { src: path.join(localImagesDir, 'Mirchi-jpeg-300x300.jpg'), dest: 'mirchi.jpg' },
    { src: path.join(localImagesDir, 'Son-Of-Sathyamurthy-2015jpeg-300x300.jpg'), dest: 'son_of_satyamurthy.jpg' },
    { src: path.join(localImagesDir, 'Son-Of-Sathyamurthy-2015jpeg-300x300.jpg'), dest: 'son_of_sathyamurthy.jpg' },
    { src: path.join(localImagesDir, 'maghadera.jpg'), dest: 'magadheera.jpg' },
    { src: path.join(localImagesDir, 'maghadera.jpg'), dest: 'maghadera.jpg' },
    { src: path.join(localImagesDir, 'hi nanna.jpg'), dest: 'hi_nanna.jpg' },
    { src: path.join(localImagesDir, 'shyam singh roy.jpg'), dest: 'shyam_singha_roy.jpg' },
    { src: path.join(localImagesDir, 'shyam singh roy.jpg'), dest: 'shyam_singh_roy.jpg' },
    { src: path.join(localImagesDir, 'Mahanathi.jpg'), dest: 'mahanati.jpg' },
    { src: path.join(localImagesDir, 'Mahanathi.jpg'), dest: 'mahanathi.jpg' },
    { src: path.join(localImagesDir, 'pushpa.jpg'), dest: 'pushpa.jpg' },
    { src: path.join(localImagesDir, 'Vunnadhi-Okate-Zindagi-2017jpeg-300x300.jpg'), dest: 'vunnadhi_okate_zindagi.jpg' },
    { src: path.join(localImagesDir, 'Vunnadhi-Okate-Zindagi-2017jpeg-300x300.jpg'), dest: 'vunnadi_okate_zindagi.jpg' },
    { src: path.join(localImagesDir, 'V-2020-jpeg.jpg'), dest: 'v.jpg' },
    { src: path.join(localImagesDir, 'darling-gv-prakash-kumar.webp'), dest: 'darling.jpg' },
    { src: path.join(localImagesDir, 'Arjun-2004-jpeg-300x300.jpg'), dest: 'arjun.jpg' },
    { src: path.join(localImagesDir, 'Arjun-2004-jpeg-300x300.jpg'), dest: 'Arjun.jpg' },
    { src: path.join(localImagesDir, 'bahubali.jpg'), dest: 'bahubali.jpg' },
    { src: path.join(localImagesDir, 'bahubali.jpg'), dest: 'baahubali.jpg' },
    { src: path.join(localImagesDir, 'majili image.jpg'), dest: 'majili.jpg' },
    { src: path.join(localImagesDir, 'majili image.jpg'), dest: 'Majili.jpg' },
    { src: path.join(localImagesDir, 'peddi.jpg'), dest: 'peddi.jpg' }
  ];
  const destDir = path.join(process.cwd(), 'public', 'images');
  
  // Copy Darling cover from Downloads if available
  const downloadsDir = 'c:\\Users\\usham\\Downloads';
  const darlingDestPath = path.join(destDir, 'darling.jpg');
  if (!fs.existsSync(darlingDestPath)) {
    const downloadJpg = path.join(downloadsDir, 'download.jpg');
    const downloadJpeg = path.join(downloadsDir, 'download.jpeg');
    let srcImage = '';
    if (fs.existsSync(downloadJpg)) srcImage = downloadJpg;
    else if (fs.existsSync(downloadJpeg)) srcImage = downloadJpeg;

    if (srcImage) {
      try {
        fs.copyFileSync(srcImage, darlingDestPath);
        fs.copyFileSync(srcImage, path.join(localImagesDir, 'darling.jpg'));
        console.log(`Successfully copied Darling cover from Downloads: ${path.basename(srcImage)}`);
      } catch (e: any) {
        console.error(`Failed to copy Darling cover from downloads:`, e.message);
      }
    }
  }

  // Copy Majili cover from Downloads if available - Always Overwrite to enable visual updates
  // Robust scanner: find the absolute newest download* image file in Downloads (which handles download.jpg, download.jpeg, download (1).jpg, etc. properly)
  const majiliDestPath = path.join(destDir, 'majili.jpg');
  const majiliDestPathUpper = path.join(destDir, 'Majili.jpg');
  let srcImage = '';
  try {
    if (fs.existsSync(downloadsDir)) {
      const files = fs.readdirSync(downloadsDir);
      let latestTime = 0;
      for (const file of files) {
        const lowerFile = file.toLowerCase();
        if (lowerFile.startsWith('download') && (lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg') || lowerFile.endsWith('.png') || lowerFile.endsWith('.webp'))) {
          const filePath = path.join(downloadsDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs > latestTime) {
            latestTime = stats.mtimeMs;
            srcImage = filePath;
          }
        }
      }
    }
  } catch (e: any) {
    console.error(`Failed to scan Downloads directory for latest Majili cover:`, e.message);
  }

  if (srcImage) {
    try {
      fs.copyFileSync(srcImage, majiliDestPath);
      fs.copyFileSync(srcImage, majiliDestPathUpper);
      fs.copyFileSync(srcImage, path.join(localImagesDir, 'majili.jpg'));
      fs.copyFileSync(srcImage, path.join(localImagesDir, 'Majili.jpg'));
      console.log(`Successfully copied and overwrote Majili cover from Downloads with latest file: ${path.basename(srcImage)}`);
    } catch (e: any) {
      console.error(`Failed to copy/overwrite Majili cover from downloads:`, e.message);
    }
  }


  for (const asset of assets) {
    if (fs.existsSync(asset.src)) {
      try {
        fs.copyFileSync(asset.src, path.join(destDir, asset.dest));
        console.log(`Successfully copied movie cover: ${asset.dest}`);
      } catch (e: any) {
        console.error(`Failed to copy movie cover ${asset.dest}:`, e.message);
      }
    } else {
      console.log(`Warning: Cover source file not found: ${asset.src}`);
    }
  }
};

const processMovieSongs = async () => {
  const songsDir = path.join(process.cwd(), '..', 'Songs');
  const destDir = path.join(process.cwd(), 'public', 'audio');
  
  if (!fs.existsSync(songsDir)) {
    console.log(`Songs directory not found at: ${songsDir}`);
    return;
  }

  // Copy Mirchi songs from Downloads to Songs folder if they exist
  const downloadsDir = 'c:\\Users\\usham\\Downloads';
  const mirchiDownloads = [
    { srcName: '1-Barbie Girl-SenSongsMp3.Co.mp3', destName: '1-Barbie Girl-SenSongsMp3.Co.mp3' },
    { srcName: '2-Darlingey-SenSongsMp3.Co.mp3', destName: '2-Darlingey-SenSongsMp3.Co.mp3' },
    { srcName: '3-Idhedho Bagundhe-SenSongsMp3.Co.mp3', destName: '3-Idhedho Bagundhe-SenSongsMp3.Co.mp3' },
    { srcName: '4-Mirchi-SenSongsMp3.Co.mp3', destName: '4-Mirchi-SenSongsMp3.Co.mp3' },
    { srcName: '5-Nee Choopula-SenSongsMp3.Co.mp3', destName: '5-Nee Choopula-SenSongsMp3.Co.mp3' },
    { srcName: '6-Pandagala-SenSongsMp3.Co.mp3', destName: '6-Pandagala-SenSongsMp3.Co.mp3' },
    { srcName: '7-Yahoon Yahoon-SenSongsMp3.Co.mp3', destName: '7-Yahoon Yahoon-SenSongsMp3.Co.mp3' },
  ];
  
  // Copy Darling songs from Downloads to Songs folder if they exist
  const darlingDownloads = [
    { srcName: 'Inka Edo-SenSongsMp3.Co.mp3', destName: 'Inka Edo-SenSongsMp3.Co.mp3' },
    { srcName: 'Neeve-SenSongsMp3.Co.mp3', destName: 'Neeve-SenSongsMp3.Co.mp3' },
    { srcName: 'Hosahore-SenSongsMp3.Co.mp3', destName: 'Hosahore-SenSongsMp3.Co.mp3' },
    { srcName: 'Priyathama Priyathama - SenSongsmp3.Co.mp3', destName: 'Priyathama Priyathama - SenSongsmp3.Co.mp3' },
    { srcName: 'One Boy One Girl - SenSongsmp3.Co.mp3', destName: 'One Boy One Girl - SenSongsmp3.Co.mp3' },
    { srcName: 'Bulle-SenSongsMp3.Co.mp3', destName: 'Bulle-SenSongsMp3.Co.mp3' },
  ];

  // Copy Majili songs from Downloads to Songs folder if they exist
  const majiliDownloads = [
    { srcName: 'Ye Manishike Majiliyo - SenSongsmp3.Co.mp3', destName: 'Ye Manishike Majiliyo - SenSongsmp3.Co.mp3' },
    { srcName: 'Yedetthu Mallele - SenSongsmp3.Co.mp3', destName: 'Yedetthu Mallele - SenSongsmp3.Co.mp3' },
    { srcName: 'Maayya Maayya - SenSongsmp3.Co.mp3', destName: 'Maayya Maayya - SenSongsmp3.Co.mp3' },
    { srcName: 'One & Two & Three - SenSongsMp3.Co.mp3', destName: 'One & Two & Three - SenSongsMp3.Co.mp3' },
    { srcName: 'Naa Gundello - SenSongsmp3.Co.mp3', destName: 'Naa Gundello - SenSongsmp3.Co.mp3' },
    { srcName: 'Priyathama Priyathama - SenSongsmp3.Co.mp3', destName: 'Priyathama Priyathama - SenSongsmp3.Co.mp3' },
  ];


  if (fs.existsSync(downloadsDir)) {
    for (const mapping of mirchiDownloads) {
      const srcPath = path.join(downloadsDir, mapping.srcName);
      const destPath = path.join(songsDir, mapping.destName);
      if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Auto-copied from Downloads to Songs: ${mapping.destName}`);
        } catch (e: any) {
          console.error(`Failed to copy ${mapping.srcName} from Downloads to Songs:`, e.message);
        }
      }
    }

    for (const mapping of darlingDownloads) {
      const srcPath = path.join(downloadsDir, mapping.srcName);
      const destPath = path.join(songsDir, mapping.destName);
      if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Auto-copied from Downloads to Songs: ${mapping.destName}`);
        } catch (e: any) {
          console.error(`Failed to copy ${mapping.srcName} from Downloads to Songs:`, e.message);
        }
      }
    }

    for (const mapping of majiliDownloads) {
      const srcPath = path.join(downloadsDir, mapping.srcName);
      const destPath = path.join(songsDir, mapping.destName);
      if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Auto-copied from Downloads to Songs: ${mapping.destName}`);
        } catch (e: any) {
          console.error(`Failed to copy ${mapping.srcName} from Downloads to Songs:`, e.message);
        }
      }
    }
  }



  const files = fs.readdirSync(songsDir);

  for (const file of files) {
    const filePath = path.join(songsDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) continue;

    if (file.endsWith('.mp3')) {
      let matchedName = '';
      const lowerFile = file.toLowerCase();

      // Magadheera
      if (lowerFile.includes('panchadara') || lowerFile.includes('panchadhara')) {
        matchedName = 'panchadara_bomma.mp3';
      } else if (lowerFile.includes('dheera')) {
        matchedName = 'dheera_dheera.mp3';
      } else if (lowerFile.includes('kanti') || lowerFile.includes('nee kanti') || lowerFile.includes('chupullo')) {
        matchedName = 'nee_kanti_chupullo.mp3';
      } else if (lowerFile.includes('jorsey')) {
        matchedName = 'jorsey.mp3';
      } else if (lowerFile.includes('bangaru')) {
        matchedName = 'bangaru_kodipetta.mp3';
      } else if (lowerFile.includes('rolling')) {
        matchedName = 'rolling_title_music.mp3';
      } else if (lowerFile.includes('nakosam') || lowerFile.includes('naakosam')) {
        matchedName = 'nakosam_nuvu.mp3';
      }
      // Geetha Govindam
      else if (lowerFile.includes('inkem')) {
        matchedName = 'inkem_inkem.mp3';
      } else if (lowerFile.includes('kanureppala')) {
        matchedName = 'kanureppala_kaalam.mp3';
      } else if (lowerFile.includes('tanemandhe')) {
        matchedName = 'tanemandhe_tanemandhe.mp3';
      } else if (lowerFile.includes('vachindamma')) {
        matchedName = 'vachindamma.mp3';
      } else if (lowerFile.includes('what the f') && !lowerFile.includes('what the life')) {
        matchedName = 'what_the_f.mp3';
      } else if (lowerFile.includes('what the life')) {
        matchedName = 'what_the_life.mp3';
      } else if (lowerFile.includes('yenti')) {
        matchedName = 'yenti_yenti.mp3';
      }
      // Ye Maaya Chesave
      else if (lowerFile.includes('aaromale')) {
        matchedName = 'aaromale.mp3';
      } else if (lowerFile.includes('ee hridayam')) {
        matchedName = 'ee_hridayam.mp3';
      } else if (lowerFile.includes('kundanapu')) {
        matchedName = 'kundanapu_bomma.mp3';
      } else if (lowerFile.includes('manasaa')) {
        matchedName = 'manasaa.mp3';
      } else if (lowerFile.includes('swaasye')) {
        matchedName = 'swaasye.mp3';
      } else if (lowerFile.includes('vintunnavaa')) {
        matchedName = 'vintunnavaa.mp3';
      }
      // Rangasthalam
      else if (lowerFile.includes('gattununtaava')) {
        matchedName = 'aa_gattununtaava.mp3';
      } else if (lowerFile.includes('jigelu')) {
        matchedName = 'jigelu_rani.mp3';
      } else if (lowerFile.includes('orayyo')) {
        matchedName = 'orayyo.mp3';
      } else if (lowerFile.includes('ranga ranga') || lowerFile.includes('rangasthalaana')) {
        matchedName = 'ranga_ranga.mp3';
      } else if (lowerFile.includes('rangamma')) {
        matchedName = 'rangamma_mangamma.mp3';
      } else if (lowerFile.includes('yentha sakkagunnave')) {
        matchedName = 'yentha_sakkagunnave.mp3';
      }
      // Arya
      else if (lowerFile.includes('amalapuram')) {
        matchedName = 'aa_ante_amalapuram.mp3';
      } else if (lowerFile.includes('feel my love')) {
        matchedName = 'feel_my_love.mp3';
      } else if (lowerFile.includes('nuvvunte')) {
        matchedName = 'nuvvunte.mp3';
      } else if (lowerFile.includes('brotheru')) {
        matchedName = 'o_my_brotheru.mp3';
      } else if (lowerFile.includes('you rock my world')) {
        matchedName = 'you_rock_my_world.mp3';
      } else if (lowerFile.includes('thakadimithom')) {
        matchedName = 'thakadimithom.mp3';
      }
      // Ala Vaikunthapurramuloo
      else if (lowerFile.includes('buttabomma')) {
        matchedName = 'buttabomma.mp3';
      } else if (lowerFile.includes('daddy')) {
        matchedName = 'omg_daddy.mp3';
      } else if (lowerFile.includes('ramula')) {
        matchedName = 'ramuloo_ramula.mp3';
      } else if (lowerFile.includes('samajavaragamana')) {
        if (lowerFile.includes('female')) {
          matchedName = 'samajavaragamana_female.mp3';
        } else {
          matchedName = 'samajavaragamana.mp3';
        }
      } else if (lowerFile.includes('sittharala')) {
        matchedName = 'sittharala_sirapadu.mp3';
      } else if (lowerFile.includes('ala vaikunthapurramuloo')) {
        matchedName = 'ala_vaikunthapurramuloo_theme.mp3';
      }
      // Hi Nanna
      else if (lowerFile.includes('samayama')) {
        matchedName = 'samayama.mp3';
      } else if (lowerFile.includes('adigaa')) {
        matchedName = 'adigaa.mp3';
      } else if (lowerFile.includes('ammaadi')) {
        matchedName = 'ammaadi.mp3';
      } else if (lowerFile.includes('chedhu')) {
        matchedName = 'chedhu_nijam.mp3';
      } else if (lowerFile.includes('gaaju') || (lowerFile.includes('bomma') && lowerFile.includes('gaaju'))) {
        matchedName = 'gaaju_bomma.mp3';
      } else if (lowerFile.includes('needhe')) {
        matchedName = 'needhe_needhe.mp3';
      } else if (lowerFile.includes('odiyamma')) {
        matchedName = 'odiyamma.mp3';
      }
      // Pushpa
      else if (lowerFile.includes('srivalli')) {
        matchedName = 'srivalli.mp3';
      } else if (lowerFile.includes('dakko')) {
        matchedName = 'dakko_dakko_meka.mp3';
      } else if (lowerFile.includes('saami')) {
        matchedName = 'saami_saami.mp3';
      } else if (lowerFile.includes('oo antava')) {
        matchedName = 'oo_antava.mp3';
      } else if (lowerFile.includes('eyy bidda')) {
        matchedName = 'eyy_bidda_idhi_naa_adda.mp3';
      }
      // Shyam Singha Roy
      else if (lowerFile.includes('pranavalaya')) {
        matchedName = 'pranavalaya.mp3';
      } else if (lowerFile.includes('sirivennela') || lowerFile.includes('sirivennala')) {
        if (lowerFile.includes('female') || lowerFile.includes('version')) {
          matchedName = 'sirivennela_female.mp3';
        } else {
          matchedName = 'sirivennela.mp3';
        }
      } else if (lowerFile.includes('edo edo')) {
        matchedName = 'edo_edo.mp3';
      } else if (lowerFile.includes('tara')) {
        matchedName = 'tara.mp3';
      }
      // S/O Satyamurthy
      else if (lowerFile.includes('chal chalo')) {
        matchedName = 'chal_chalo_chalo.mp3';
      } else if (lowerFile.includes('come to the party')) {
        matchedName = 'come_to_the_party.mp3';
      } else if (lowerFile.includes('jaaruko')) {
        matchedName = 'jaaruko.mp3';
      } else if (lowerFile.includes('seethakaalam')) {
        matchedName = 'seethakaalam.mp3';
      } else if (lowerFile.includes('super machi')) {
        matchedName = 'super_machi.mp3';
      } else if (lowerFile.includes('vacchadu')) {
        matchedName = 'vacchadu.mp3';
      }
      // Orange
      else if (lowerFile.includes('ola_olaala') || lowerFile.includes('ola olaala') || (lowerFile.includes('ola') && lowerFile.includes('olaala'))) {
        matchedName = 'ola_olaala.mp3';
      } else if (lowerFile.includes('rooba')) {
        matchedName = 'rooba_rooba.mp3';
      } else if (lowerFile.includes('chilipiga')) {
        matchedName = 'chilipiga.mp3';
      } else if (lowerFile.includes('nenu nuvvantu') || lowerFile.includes('nenu_nuvvantu') || (lowerFile.includes('nenu') && lowerFile.includes('nuvvantu'))) {
        matchedName = 'nenu_nuvvantu.mp3';
      } else if (lowerFile.includes('hello rammante') || lowerFile.includes('hello_rammante') || (lowerFile.includes('hello') && lowerFile.includes('rammante'))) {
        matchedName = 'hello_rammante.mp3';
      } else if (lowerFile.includes('o range') || lowerFile.includes('o_range') || lowerFile.includes('orange-') || (lowerFile.includes('o') && lowerFile.includes('range') && !lowerFile.includes('orange.jpg'))) {
        matchedName = 'o_range.mp3';
      }
      // Mirchi
      else if (lowerFile.includes('mirchi theme') || lowerFile.includes('mirchi_theme') || (lowerFile.includes('mirchi') && lowerFile.includes('theme')) || lowerFile.includes('4-mirchi')) {
        matchedName = 'mirchi_theme.mp3';
      } else if (lowerFile.includes('yahoon') || lowerFile.includes('7-yahoon')) {
        matchedName = 'yahoon_yahoon.mp3';
      } else if (lowerFile.includes('pandagala') || lowerFile.includes('6-pandagala')) {
        matchedName = 'pandagala_digivachavu.mp3';
      } else if (lowerFile.includes('darlingey') || lowerFile.includes('2-darlingey')) {
        matchedName = 'darlingey.mp3';
      } else if (lowerFile.includes('barbie') || lowerFile.includes('1-barbie')) {
        matchedName = 'barbie_girl.mp3';
      } else if (lowerFile.includes('idhedho') || lowerFile.includes('3-idhedho') || lowerFile.includes('bagundhe')) {
        matchedName = 'idhedho_bagundhe.mp3';
      } else if (lowerFile.includes('choopula') || lowerFile.includes('5-choopula')) {
        matchedName = 'nee_choopula.mp3';
      } else if (lowerFile.includes('mahanati')) {
        matchedName = 'mahanati.mp3';
      } else if (lowerFile.includes('chivaraku') || lowerFile.includes('migiledi')) {
        matchedName = 'chivaraku_migiledi.mp3';
      } else if (lowerFile.includes('mooga') || lowerFile.includes('manasulu')) {
        matchedName = 'mooga_manasulu.mp3';
      } else if (lowerFile.includes('sada nannu') || (lowerFile.includes('sada') && lowerFile.includes('nannu'))) {
        matchedName = 'sada_nannu.mp3';
      } else if (lowerFile.includes('aagipo') || lowerFile.includes('baalyama')) {
        matchedName = 'aagipo_baalyama.mp3';
      } else if (lowerFile.includes('gelupuleni') || lowerFile.includes('samaram')) {
        matchedName = 'gelupuleni_samaram.mp3';
      }
      // Vunnadhi Okate Zindagi
      else if (lowerFile.includes('life is a rainbow') || (lowerFile.includes('life') && lowerFile.includes('rainbow'))) {
        matchedName = 'life_is_a_rainbow.mp3';
      } else if (lowerFile.includes('rayyi rayyi') || lowerFile.includes('rayyi_rayyi') || lowerFile.includes('mantu')) {
        matchedName = 'rayyi_rayyi_mantu.mp3';
      } else if (lowerFile.includes('trend maarina') || lowerFile.includes('trend_maarina') || lowerFile.includes('friend maaradu') || lowerFile.includes('friend_maaradu')) {
        matchedName = 'trend_marina_friend_maaradu.mp3';
      } else if (lowerFile.includes('vunnadhi okate') || lowerFile.includes('vunnadhi_okate') || lowerFile.includes('vunnadi okate') || lowerFile.includes('vunnadi_okate')) {
        matchedName = 'vunnadhi_okate_zindagi.mp3';
      } else if (lowerFile.includes('what amma') || lowerFile.includes('what_amma')) {
        matchedName = 'what_amma.mp3';
      }
      // V
      else if (lowerFile.includes('manasu maree') || lowerFile.includes('manasu_maree')) {
        matchedName = 'manasu_maree.mp3';
      } else if (lowerFile.includes('baby touch me') || lowerFile.includes('baby_touch_me')) {
        matchedName = 'baby_touch_me_now.mp3';
      } else if (lowerFile.includes('ranga rangeli') || lowerFile.includes('ranga_rangeli')) {
        matchedName = 'ranga_rangeli.mp3';
      } else if (lowerFile.includes('vastunna vachestunna') || lowerFile.includes('vastunna_vachestunna')) {
        matchedName = 'vastunna_vachestunna.mp3';
      }
      // Darling & Majili Priyathama matching
      else if (lowerFile.includes('priyathama')) {
        if (lowerFile.includes('priyathama priyathama')) {
          matchedName = 'priyathama_priyathama.mp3';
          try {
            fs.copyFileSync(filePath, path.join(destDir, 'priyathama.mp3'));
            console.log(`Successfully double-copied Priyathama Priyathama -> priyathama.mp3 (Darling)`);
          } catch (e: any) {}
        } else {
          matchedName = 'priyathama.mp3';
        }
      }
      else if (lowerFile.includes('inka edo') || lowerFile.includes('inka_edo') || (lowerFile.includes('inka') && lowerFile.includes('edo'))) {
        matchedName = 'inka_edo.mp3';
      } else if (lowerFile.includes('neeve') && !lowerFile.includes('neeve_kanti') && !lowerFile.includes('choopula')) {
        matchedName = 'neeve.mp3';
      } else if (lowerFile.includes('hosahore')) {
        matchedName = 'hosahore.mp3';
      } else if (lowerFile.includes('one boy') || lowerFile.includes('one_boy')) {
        matchedName = 'one_boy_one_girl.mp3';
      } else if (lowerFile.includes('bulle')) {
        matchedName = 'bulle.mp3';
      }
      // Majili
      else if (lowerFile.includes('ye manishike') || lowerFile.includes('ye_manishike') || lowerFile.includes('majiliyo')) {
        matchedName = 'ye_manishike_majiliyo.mp3';
      } else if (lowerFile.includes('yedetthu') || lowerFile.includes('mallele')) {
        matchedName = 'yedetthu_mallele.mp3';
      } else if (lowerFile.includes('maayya maayya') || lowerFile.includes('maayya_maayya') || (lowerFile.includes('maayya') && !lowerFile.includes('maayya_maayya_theme'))) {
        matchedName = 'maayya_maayya.mp3';
      } else if (lowerFile.includes('one & two') || lowerFile.includes('one_two_three') || lowerFile.includes('one & two & three')) {
        matchedName = 'one_two_three.mp3';
      } else if (lowerFile.includes('naa gundello') || lowerFile.includes('naa_gundello')) {
        matchedName = 'naa_gundello.mp3';
      }
      // Arjun
      else if (lowerFile.includes('okka mata') || lowerFile.includes('okka_mata')) {
        matchedName = 'okka_mata.mp3';
      } else if (lowerFile.includes('aey pilla') || lowerFile.includes('aey_pilla')) {
        matchedName = 'aey_pilla.mp3';
      } else if (lowerFile.includes('dum dumare') || lowerFile.includes('dum_dumare')) {
        matchedName = 'dum_dumare.mp3';
      } else if (lowerFile.includes('o cheli') || lowerFile.includes('o_cheli')) {
        matchedName = 'o_cheli.mp3';
      } else if (lowerFile.includes('madhura')) {
        matchedName = 'madhura_madhuratara.mp3';
        try {
          fs.copyFileSync(filePath, path.join(destDir, 'madhura_madhura.mp3'));
          fs.copyFileSync(filePath, path.join(destDir, 'madhura_madhure_meenakshi.mp3'));
          console.log(`Successfully multi-copied Madhura -> madhura_madhura.mp3 & madhura_madhure_meenakshi.mp3`);
        } catch (e: any) {}
      } else if (lowerFile.includes('ra ra rajakumara') || lowerFile.includes('ra ra') || lowerFile.includes('raa_raa')) {
        matchedName = 'raa_raa.mp3';
        try {
          fs.copyFileSync(filePath, path.join(destDir, 'ra_ra_rajakumara.mp3'));
          console.log(`Successfully double-copied Ra Ra -> ra_ra_rajakumara.mp3`);
        } catch (e: any) {}
      }
      // Baahubali
      else if (lowerFile.includes('dhivara') || lowerFile.includes('dheevara')) {
        if (lowerFile.includes('english')) {
          matchedName = 'dhivara_english.mp3';
          try {
            fs.copyFileSync(filePath, path.join(destDir, 'dheevara_english.mp3'));
            console.log(`Successfully double-copied Dheevara English Version -> dheevara_english.mp3`);
          } catch (e: any) {}
        } else {
          matchedName = 'dhivara.mp3';
        }
      } else if (lowerFile.includes('mamatala') || lowerFile.includes('mamathala')) {
        matchedName = 'mamathala_thalli.mp3';
        try {
          fs.copyFileSync(filePath, path.join(destDir, 'mamatala_talli.mp3'));
          console.log(`Successfully double-copied Mamatala Talli -> mamatala_talli.mp3`);
        } catch (e: any) {}
      } else if (lowerFile.includes('manohari')) {
        matchedName = 'manohari.mp3';
      } else if (lowerFile.includes('sivuni aana') || lowerFile.includes('sivuni_aana')) {
        matchedName = 'sivuni_aana.mp3';
      } else if (lowerFile.includes('bottasi') || lowerFile.includes('bottasii')) {
        matchedName = 'pachha_bottasi.mp3';
        try {
          fs.copyFileSync(filePath, path.join(destDir, 'pacha_bottasi.mp3'));
          console.log(`Successfully double-copied Pacha Bottasi -> pacha_bottasi.mp3`);
        } catch (e: any) {}
      } else if (lowerFile.includes('jeva nadhi') || lowerFile.includes('jeeva_nadhi') || lowerFile.includes('jeva_nadhi') || lowerFile.includes('jeeva nadhi')) {
        matchedName = 'jeeva_nadhi.mp3';
        try {
          fs.copyFileSync(filePath, path.join(destDir, 'jeva_nadhi.mp3'));
          console.log(`Successfully double-copied Jeeva Nadhi -> jeva_nadhi.mp3`);
        } catch (e: any) {}
      } else if (lowerFile.includes('nippulaa') || lowerFile.includes('nippule') || lowerFile.includes('swasa ga')) {
        matchedName = 'nippule_swasaga.mp3';
        try {
          fs.copyFileSync(filePath, path.join(destDir, 'nippulaa_swasaga.mp3'));
          console.log(`Successfully double-copied Nippule Swasaga -> nippulaa_swasaga.mp3`);
        } catch (e: any) {}
      }
      // Peddi
      else if (lowerFile.includes('chikiri')) {
        matchedName = 'chikiri_chikiri.mp3';
      } else if (lowerFile.includes('hellallallo')) {
        matchedName = 'hellallallo.mp3';
      } else if (lowerFile.includes('massa')) {
        matchedName = 'massa_massa.mp3';
      } else if (lowerFile.includes('rai rai raa raa') || lowerFile.includes('rai_rai_raa_raa') || (lowerFile.includes('rai') && lowerFile.includes('raa'))) {
        matchedName = 'rai_rai_raa_raa.mp3';
      }



      if (matchedName) {
        try {
          const destPath = path.join(destDir, matchedName);
          fs.copyFileSync(filePath, destPath);
          console.log(`Successfully copied ${file} -> ${matchedName}`);
        } catch (e: any) {
          console.error(`Failed to copy ${file}:`, e.message);
        }
      }
    }
  }
};

const seedTollywoodMoviesDB = async () => {
  const albumsToCheck = ['Magadheera', 'Geetha Govindam', 'Ye Maaya Chesave', 'Rangasthalam', 'Arya', 'Ala Vaikunthapurramuloo', 'Orange', 'Mirchi', 'Son of Satyamurthy', 'Mahanati', 'Vunnadhi Okate Zindagi', 'V', 'Darling', 'Majili', 'Arjun', 'Baahubali: The Beginning', 'Peddi'];

  // Unconditionally delete seeded movie albums on start to heal any database discrepancies, drifts, or incorrect mappings.
  // Note: Since users like and create playlists in localStorage, this does not affect user favorites/playlists.
  for (const albumName of albumsToCheck) {
    const album = await prisma.album.findFirst({ where: { name: albumName } });
    if (album) {
      console.log(`Self-healing database: Deleting ${albumName} to re-seed clean song definitions...`);
      await prisma.lyrics.deleteMany({ where: { song: { albumId: album.id } } });
      await prisma.song.deleteMany({ where: { albumId: album.id } });
      await prisma.album.delete({ where: { id: album.id } });
    }
  }

  // Check if albums are already seeded
  const existingAlbums = await prisma.album.findMany({
    where: { name: { in: albumsToCheck } }
  });

  const existingNames = existingAlbums.map(a => a.name);
  console.log('Already seeded albums:', existingNames);

  // 1. Get or Create Artists
  const getOrCreateArtist = async (name: string, bio: string, image: string, popularity: number) => {
    let artist = await prisma.artist.findFirst({ where: { name } });
    if (!artist) {
      artist = await prisma.artist.create({
        data: { name, bio, image, popularity }
      });
      console.log(`Created artist: ${name}`);
    }
    return artist;
  };

  const keeravani = await getOrCreateArtist('M. M. Keeravani', 'Legendary Indian music composer and playback singer.', 'http://localhost:5000/static/images/magadheera.jpg', 97);
  const gopiSundar = await getOrCreateArtist('Gopi Sundar', 'Popular Indian music composer and singer.', 'http://localhost:5000/static/images/geetha_govindham.jpg', 93);
  const rahman = await getOrCreateArtist('A. R. Rahman', 'Academy Award winning composer, singer, and songwriter.', 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', 99);
  const dsp = await getOrCreateArtist('Devi Sri Prasad', 'Famous music composer and singer in Telugu cinema.', 'http://localhost:5000/static/images/pushpa.jpg', 96);
  const thaman = await getOrCreateArtist('Thaman S', 'Prominent Telugu music director and composer.', 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', 95);
  const harris = await getOrCreateArtist('Harris Jayaraj', 'Acclaimed composer and music producer in South India.', 'http://localhost:5000/static/images/orange.jpg', 94);
  const mickey = await getOrCreateArtist('Mickey J. Meyer', 'Acclaimed Indian music composer and singer in Telugu cinema.', 'http://localhost:5000/static/images/mahanati.jpg', 92);
  const amit = await getOrCreateArtist('Amit Trivedi', 'Highly versatile Indian music composer and singer.', 'http://localhost:5000/static/images/v.jpg', 94);
  const gvp = await getOrCreateArtist('G. V. Prakash Kumar', 'Award winning Indian music composer, singer, and actor.', 'http://localhost:5000/static/images/darling.jpg', 94);
  const maniSharma = await getOrCreateArtist('Mani Sharma', 'Legendary Indian music composer, singer, and music director active primarily in Telugu cinema, known as Melodi Brahma.', 'http://localhost:5000/static/images/arjun.jpg', 95);


  // Genres
  let romanticMelody = await prisma.genre.findUnique({ where: { name: 'Romantic Melody' } });
  if (!romanticMelody) romanticMelody = await prisma.genre.create({ data: { name: 'Romantic Melody' } });

  let dancePop = await prisma.genre.findUnique({ where: { name: 'Dance Pop' } });
  if (!dancePop) dancePop = await prisma.genre.create({ data: { name: 'Dance Pop' } });

  let classicalFusion = await prisma.genre.findUnique({ where: { name: 'Classical Fusion' } });
  if (!classicalFusion) classicalFusion = await prisma.genre.create({ data: { name: 'Classical Fusion' } });

  // Seeding Function Helper
  const seedAlbum = async (albumName: string, releaseYear: number, artistId: string, coverImage: string, songs: any[]) => {
    if (existingNames.includes(albumName)) {
      console.log(`Album ${albumName} is already seeded.`);
      return;
    }

    const album = await prisma.album.create({
      data: { name: albumName, releaseYear, artistId, coverImage }
    });
    console.log(`Created album: ${albumName}`);

    for (const songData of songs) {
      const { lyrics, ...songDetails } = songData;
      const song = await prisma.song.create({
        data: {
          ...songDetails,
          albumId: album.id,
          artistId,
          coverImage,
        }
      });

      if (lyrics) {
        await prisma.lyrics.create({
          data: {
            songId: song.id,
            text: lyrics,
            synced: JSON.stringify([
              { time: 0, text: '(Music Intro)' },
              { time: 10, text: song.name },
            ])
          }
        });
      }
    }
    console.log(`Seeded songs for album: ${albumName}`);
  };

  // Magadheera
  await seedAlbum('Magadheera', 2009, keeravani.id, 'http://localhost:5000/static/images/magadheera.jpg', [
    { name: 'Panchadara Bomma', duration: 280, releaseYear: 2009, audioUrl: 'http://localhost:5000/static/audio/panchadara_bomma.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Flute Intro)\n[00:15] Panchadara bomma bomma\n[00:20] Ninnu choosthe pranam pothundhe bomma' },
    { name: 'Nakosam Nuvu', duration: 280, releaseYear: 2009, audioUrl: 'http://localhost:5000/static/audio/nakosam_nuvu.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Switzerland Intro)\n[00:15] Nakosam nuvu nilichavu' },
    { name: 'Dheera Dheera', duration: 228, releaseYear: 2009, audioUrl: 'http://localhost:5000/static/audio/dheera_dheera.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)\n[00:15] Dheera dheera dheera' },
    { name: 'Nee Kanti Chupullo', duration: 270, releaseYear: 2009, audioUrl: 'http://localhost:5000/static/audio/nee_kanti_chupullo.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Intro)\n[00:15] Nee kanti chupullo' },
    { name: 'Jorsey', duration: 290, releaseYear: 2009, audioUrl: 'http://localhost:5000/static/audio/jorsey.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Dhol Intro)\n[00:15] Jorsey jorsey jorsey' },
    { name: 'Bangaru Kodipetta', duration: 344, releaseYear: 2009, audioUrl: 'http://localhost:5000/static/audio/bangaru_kodipetta.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)\n[00:15] Bangaru kodipetta vachhindhamma' },
    { name: 'Rolling Title Music', duration: 153, releaseYear: 2009, audioUrl: 'http://localhost:5000/static/audio/rolling_title_music.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Instrumental Theme)' }
  ]);

  // Geetha Govindam
  await seedAlbum('Geetha Govindam', 2018, gopiSundar.id, 'http://localhost:5000/static/images/geetha_govindham.jpg', [
    { name: 'Inkem Inkem Inkem Kaavaale', duration: 262, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/inkem_inkem.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Veena Intro)\n[00:15] Inkem inkem inkem kaavaale' },
    { name: 'Kanureppala Kaalam', duration: 182, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/kanureppala_kaalam.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Music)' },
    { name: 'Tanemandhe Tanemandhe', duration: 200, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/tanemandhe_tanemandhe.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Melody Theme)' },
    { name: 'Vachindamma', duration: 240, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/vachindamma.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)' },
    { name: 'What The F', duration: 210, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/what_the_f.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Modern Beats)' },
    { name: 'What The Life', duration: 210, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/what_the_life.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Happy Beats)' },
    { name: 'Yenti Yenti', duration: 200, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/yenti_yenti.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Violin Intro)\n[00:15] Yenti yenti yenti kothaga' }
  ]);

  // Ye Maaya Chesave
  await seedAlbum('Ye Maaya Chesave', 2010, rahman.id, 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', [
    { name: 'Aaromale', duration: 338, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/aaromale.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aaromale' },
    { name: 'Ee Hridayam', duration: 324, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/ee_hridayam.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ee Hridayam' },
    { name: 'Kundanapu Bomma', duration: 300, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/kundanapu_bomma.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Kundanapu Bomma' },
    { name: 'Manasaa', duration: 248, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/manasaa.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Manasaa' },
    { name: 'Swaasye', duration: 190, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/swaasye.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Swaasye' },
    { name: 'Vintunnavaa', duration: 408, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/vintunnavaa.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Vintunnavaa' }
  ]);

  // Rangasthalam
  await seedAlbum('Rangasthalam', 2018, dsp.id, 'http://localhost:5000/static/images/rangasthalam.jpg', [
    { name: 'Rangamma Mangamma', duration: 264, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/rangamma_mangamma.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Rangamma Mangamma' },
    { name: 'Aa Gattununtaava', duration: 207, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/aa_gattununtaava.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aa Gattununtaava' },
    { name: 'Jigelu Rani', duration: 307, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/jigelu_rani.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Jigelu Rani' },
    { name: 'Orayyo', duration: 339, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/orayyo.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Orayyo' },
    { name: 'Ranga Ranga', duration: 319, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/ranga_ranga.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ranga Ranga' },
    { name: 'Yentha Sakkagunnave', duration: 281, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/yentha_sakkagunnave.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Yentha Sakkagunnave' }
  ]);

  // Arya
  await seedAlbum('Arya', 2004, dsp.id, 'http://localhost:5000/static/images/arya.jpg', [
    { name: 'Feel My Love', duration: 290, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/feel_my_love.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Feel My Love' },
    { name: 'Nuvvunte', duration: 309, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/nuvvunte.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Nuvvunte' },
    { name: 'You Rock My World', duration: 294, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/you_rock_my_world.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] You Rock My World' },
    { name: 'O My Brotheru', duration: 297, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/o_my_brotheru.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] O My Brotheru' },
    { name: 'Thakadimithom', duration: 325, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/thakadimithom.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Thakadimithom' },
    { name: 'Aa Ante Amalapuram', duration: 295, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/aa_ante_amalapuram.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aa Ante Amalapuram' }
  ]);

  // Ala Vaikunthapurramuloo
  await seedAlbum('Ala Vaikunthapurramuloo', 2020, thaman.id, 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', [
    { name: 'Buttabomma', duration: 198, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/buttabomma.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Buttabomma' },
    { name: 'Samajavaragamana', duration: 214, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/samajavaragamana.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Samajavaragamana' },
    { name: 'Ramuloo Ramula', duration: 240, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/ramuloo_ramula.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ramuloo Ramula' },
    { name: 'OMG Daddy', duration: 220, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/omg_daddy.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] OMG Daddy' },
    { name: 'Samajavaragamana (Female)', duration: 255, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/samajavaragamana_female.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Samajavaragamana (Female)' },
    { name: 'Sittharala Sirapadu', duration: 200, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/sittharala_sirapadu.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Sittharala Sirapadu' },
    { name: 'Ala Vaikunthapurramuloo Theme', duration: 203, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/ala_vaikunthapurramuloo_theme.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Theme Intro)' }
  ]);

  // Orange
  await seedAlbum('Orange', 2010, harris.id, 'http://localhost:5000/static/images/orange.jpg', [
    { name: 'Ola Olaala', duration: 260, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/ola_olaala.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ola Olaala' },
    { name: 'Chilipiga', duration: 250, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/chilipiga.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Chilipiga' },
    { name: 'Nenu Nuvvantu', duration: 280, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/nenu_nuvvantu.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Nenu Nuvvantu' },
    { name: 'Hello Rammante', duration: 282, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/hello_rammante.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Hello Rammante' },
    { name: 'O Range', duration: 272, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/o_range.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] O Range' },
    { name: 'Rooba Rooba', duration: 270, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/rooba_rooba.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Rooba Rooba' }
  ]);

  // Mirchi
  await seedAlbum('Mirchi', 2013, dsp.id, 'http://localhost:5000/static/images/mirchi.jpg', [
    { name: 'Mirchi Theme', duration: 85, releaseYear: 2013, audioUrl: 'http://localhost:5000/static/audio/mirchi_theme.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Theme Intro)' },
    { name: 'Barbie Girl', duration: 240, releaseYear: 2013, audioUrl: 'http://localhost:5000/static/audio/barbie_girl.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Barbie Girl' },
    { name: 'Darlingey', duration: 230, releaseYear: 2013, audioUrl: 'http://localhost:5000/static/audio/darlingey.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Darlingey' },
    { name: 'Idhedho Bagundhe', duration: 270, releaseYear: 2013, audioUrl: 'http://localhost:5000/static/audio/idhedho_bagundhe.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Idhedho Bagundhe' },
    { name: 'Nee Choopula', duration: 250, releaseYear: 2013, audioUrl: 'http://localhost:5000/static/audio/nee_choopula.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Nee Choopula' },
    { name: 'Pandagala Digivachavu', duration: 290, releaseYear: 2013, audioUrl: 'http://localhost:5000/static/audio/pandagala_digivachavu.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Pandagala Digivachavu' },
    { name: 'Yahoon Yahoon', duration: 280, releaseYear: 2013, audioUrl: 'http://localhost:5000/static/audio/yahoon_yahoon.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Yahoon Yahoon' }
  ]);

  // Son of Satyamurthy
  await seedAlbum('Son of Satyamurthy', 2015, dsp.id, 'http://localhost:5000/static/images/son_of_satyamurthy.jpg', [
    { name: 'Chal Chalo Chalo', duration: 355, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/chal_chalo_chalo.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Chal Chalo Chalo' },
    { name: 'Come To The Party', duration: 287, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/come_to_the_party.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Come To The Party' },
    { name: 'Jaaruko', duration: 308, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/jaaruko.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Jaaruko' },
    { name: 'Seethakaalam', duration: 309, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/seethakaalam.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Seethakaalam' },
    { name: 'Super Machi', duration: 324, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/super_machi.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Super Machi' },
    { name: 'Vacchadu', duration: 201, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/vacchadu.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Vacchadu' }
  ]);

  // Mahanati
  await seedAlbum('Mahanati', 2018, mickey.id, 'http://localhost:5000/static/images/mahanati.jpg', [
    { name: 'Mahanati', duration: 296, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/mahanati.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Mahanati' },
    { name: 'Mooga Manasulu', duration: 260, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/mooga_manasulu.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Mooga Manasulu' },
    { name: 'Sada Nannu', duration: 211, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/sada_nannu.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Sada Nannu' },
    { name: 'Aagipo Baalyama', duration: 261, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/aagipo_baalyama.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aagipo Baalyama' },
    { name: 'Gelupuleni Samaram', duration: 197, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/gelupuleni_samaram.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Gelupuleni Samaram' },
    { name: 'Chivaraku Migiledi', duration: 184, releaseYear: 2018, audioUrl: 'http://localhost:5000/static/audio/chivaraku_migiledi.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Chivaraku Migiledi' }
  ]);

  // Vunnadhi Okate Zindagi
  await seedAlbum('Vunnadhi Okate Zindagi', 2017, dsp.id, 'http://localhost:5000/static/images/vunnadhi_okate_zindagi.jpg', [
    { name: 'Vunnadhi Okate Zindagi Title Song', duration: 298, releaseYear: 2017, audioUrl: 'http://localhost:5000/static/audio/vunnadhi_okate_zindagi.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Intro)\n[00:15] Vunnadhi okate zindagi' },
    { name: 'Trend Maarina Friend Maaradu', duration: 251, releaseYear: 2017, audioUrl: 'http://localhost:5000/static/audio/trend_marina_friend_maaradu.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)\n[00:15] Trend maarina friend maaradu' },
    { name: 'What Amma', duration: 303, releaseYear: 2017, audioUrl: 'http://localhost:5000/static/audio/what_amma.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fun Music)\n[00:15] What Amma What is this Amma' },
    { name: 'Rayyi Rayyi Mantu', duration: 325, releaseYear: 2017, audioUrl: 'http://localhost:5000/static/audio/rayyi_rayyi_mantu.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Trumpet Intro)\n[00:15] Rayyi rayyi mantu' },
    { name: 'Life Is A Rainbow', duration: 345, releaseYear: 2017, audioUrl: 'http://localhost:5000/static/audio/life_is_a_rainbow.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Whistle Intro)\n[00:15] Life is a rainbow' }
  ]);

  // V
  await seedAlbum('V', 2020, amit.id, 'http://localhost:5000/static/images/v.jpg', [
    { name: 'Manasu Maree', duration: 248, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/manasu_maree.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Flute)\n[00:15] Manasu maree' },
    { name: 'Vastunna Vachestunna', duration: 202, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/vastunna_vachestunna.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Heavy Beats)\n[00:15] Vastunna vachestunna' },
    { name: 'Baby Touch Me Now', duration: 186, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/baby_touch_me_now.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Pop Synth)\n[00:15] Baby touch me now' },
    { name: 'Ranga Rangeli', duration: 228, releaseYear: 2020, audioUrl: 'http://localhost:5000/static/audio/ranga_rangeli.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Festive Music)\n[00:15] Ranga rangeli' }
  ]);

  // Darling
  await seedAlbum('Darling', 2010, gvp.id, 'http://localhost:5000/static/images/darling.jpg', [
    { name: 'Inka Edo', duration: 309, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/inka_edo.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Synth Intro)\n[00:15] Inka edo kothaga undhe' },
    { name: 'Neeve', duration: 280, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/neeve.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Intro)\n[00:15] Neeve naa pranamam' },
    { name: 'Hosahore', duration: 226, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/hosahore.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Heavy Beats)\n[00:15] Hosahore hosahore' },
    { name: 'Priyathama', duration: 260, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/priyathama.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Flute)\n[00:15] Priyathama priyathama' },
    { name: 'One Boy One Girl', duration: 244, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/one_boy_one_girl.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fun Music)\n[00:15] One boy and one girl' },
    { name: 'Bulle', duration: 267, releaseYear: 2010, audioUrl: 'http://localhost:5000/static/audio/bulle.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)\n[00:15] Bulle bulle bulle' }
  ]);

  // Majili
  await seedAlbum('Majili', 2019, gopiSundar.id, 'http://localhost:5000/static/images/majili.jpg', [
    { name: 'Priyathama Priyathama', duration: 243, releaseYear: 2019, audioUrl: 'http://localhost:5000/static/audio/priyathama_priyathama.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Violin)\n[00:15] Priyathama priyathama' },
    { name: 'Ye Manishike Majiliyo', duration: 260, releaseYear: 2019, audioUrl: 'http://localhost:5000/static/audio/ye_manishike_majiliyo.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Melody Intro)\n[00:15] Ye manishike majiliyo' },
    { name: 'Yedetthu Mallele', duration: 200, releaseYear: 2019, audioUrl: 'http://localhost:5000/static/audio/yedetthu_mallele.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Beats)\n[00:15] Yedetthu mallele' },
    { name: 'Naa Gundello', duration: 287, releaseYear: 2019, audioUrl: 'http://localhost:5000/static/audio/naa_gundello.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Chords)\n[00:15] Naa gundello gudu' },
    { name: 'One & Two & Three', duration: 226, releaseYear: 2019, audioUrl: 'http://localhost:5000/static/audio/one_two_three.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fast Beats)\n[00:15] One and two and three' },
    { name: 'Maayya Maayya', duration: 267, releaseYear: 2019, audioUrl: 'http://localhost:5000/static/audio/maayya_maayya.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Folkish Beat)\n[00:15] Maayya maayya' }
  ]);

  // Arjun
  await seedAlbum('Arjun', 2004, maniSharma.id, 'http://localhost:5000/static/images/arjun.jpg', [
    { name: 'Madhura Madhure Meenakshi', duration: 320, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/madhura_madhure_meenakshi.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Madhura madhure meenakshi tholisaari ninu choosi\n[00:20] Manasuni meetina thalapula layalo' },
    { name: 'Aey Pilla', duration: 250, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/aey_pilla.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Synth Intro)\n[00:15] Aey pilla aey pilla nee navvula thoota' },
    { name: 'Dum Dumare', duration: 280, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/dum_dumare.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Heavy Dhol Beats)\n[00:15] Dum dumare dum dumare dhol baje' },
    { name: 'O Cheli Nee Oyyarale', duration: 300, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/o_cheli.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Chords)\n[00:15] O cheli nee oyyarale nannu lagene' },
    { name: 'Okka Maata', duration: 260, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/okka_mata.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fast Beat Drops)\n[00:15] Okka maata okka maata cheppana pilla' },
    { name: 'Ra Ra Rajakumara', duration: 260, releaseYear: 2004, audioUrl: 'http://localhost:5000/static/audio/raa_raa.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Trumpet Intro)\n[00:15] Ra ra rajakumara sandhadhi chedam' }
  ]);

  // Baahubali: The Beginning
  await seedAlbum('Baahubali: The Beginning', 2015, keeravani.id, 'http://localhost:5000/static/images/bahubali.jpg', [
    { name: 'Dhivara', duration: 343, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/dhivara.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Flute & Waterfalls Intro)\n[00:20] Dhivara.. Prasara shourya bhaara\n[00:30] Utsara.. heera ohaaraa' },
    { name: 'Mamatala Talli', duration: 204, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/mamathala_thalli.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Chorus Intro)\n[00:15] Mamatala talli.. odibadi malli\n[00:25] Kannaadi ee nela thalli' },
    { name: 'Manohari', duration: 232, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/manohari.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)\n[00:15] Manohari.. manohari\n[00:25] Ethukommani ninnu korindhi' },
    { name: 'Sivuni Aana', duration: 325, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/sivuni_aana.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Heavy Drums Intro)\n[00:20] Sivuni aana.. aakasam\n[00:35] Shivuni aana.. shirasuna mosi' },
    { name: 'Pacha Bottasi', duration: 273, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/pachha_bottasi.mp3', genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Harp Intro)\n[00:15] Pacha bottasi.. nee cheyi thakithe\n[00:25] Naa pranam kothaga velisindhi' },
    { name: 'Jeeva Nadhi', duration: 112, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/jeeva_nadhi.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Sorrow Violins)\n[00:10] Jeeva nadhi.. parugulu theesthunte\n[00:20] Gundelona mounam karigipoye' },
    { name: 'Nippule Swasaga', duration: 203, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/nippule_swasaga.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Suspense Beats)\n[00:15] Nippule swasaga.. sathruvu nethuru\n[00:25] Kuthuraa.. yudhamo siddham' },
    { name: 'Dheevara (English Version)', duration: 206, releaseYear: 2015, audioUrl: 'http://localhost:5000/static/audio/dhivara_english.mp3', genreId: romanticMelody.id, language: 'English', lyrics: '[00:00] (Western Flute)\n[00:15] Dheevara.. english version play\n[00:25] Beyond the clouds, we fly high' }
  ]);

  // Peddi
  await seedAlbum('Peddi', 2026, rahman.id, 'http://localhost:5000/static/images/peddi.jpg', [
    { name: 'Chikiri Chikiri', duration: 248, releaseYear: 2026, audioUrl: 'http://localhost:5000/static/audio/chikiri_chikiri.mp3', genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Chikiri Chikiri' },
    { name: 'Hellallallo', duration: 219, releaseYear: 2026, audioUrl: 'http://localhost:5000/static/audio/hellallallo.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Hellallallo' },
    { name: 'Massa Massa', duration: 203, releaseYear: 2026, audioUrl: 'http://localhost:5000/static/audio/massa_massa.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Massa Massa' },
    { name: 'Rai Rai Raa Raa', duration: 254, releaseYear: 2026, audioUrl: 'http://localhost:5000/static/audio/rai_rai_raa_raa.mp3', genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Rai Rai Raa Raa' }
  ]);



  console.log('Unified Tollywood DB seeding completed successfully!');
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function gracefulShutdown(signal: string) {
  console.log(`\n[${signal}] Graceful shutdown initiated...`);
  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err.message);
      process.exit(1);
    }
    console.log('Server closed cleanly. Port released. Goodbye!');
    process.exit(0);
  });

  // Force-kill after 5 seconds if graceful close hangs
  setTimeout(() => {
    console.warn('Forced shutdown after timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Catch programmer errors — log and exit instead of hanging
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException] Fatal error — shutting down:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection] Unhandled promise rejection:', reason);
  // Do NOT exit — log and continue for non-critical async errors
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  const startTime = Date.now();
  const PREFERRED_PORT = parseInt(String(process.env.PORT || '5000'), 10);

  const tryListen = (port: number): Promise<number> =>
    new Promise((resolve, reject) => {
      server.listen(port, () => resolve(port));
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          // On Windows: show which PID is using the port
          const { execSync } = require('child_process');
          try {
            const raw = execSync(
              `netstat -ano | findstr ":${port} " 2>NUL || echo NOT_FOUND`,
              { encoding: 'utf8', timeout: 3000 }
            ).trim();
            const pidMatch = raw.match(/(\d+)\s*$/m);
            const pid = pidMatch ? pidMatch[1] : 'unknown';
            console.error(`\n⛔  Port ${port} is already in use by PID ${pid}.`);
            console.error(`    To free it: Stop-Process -Id ${pid} -Force\n`);
          } catch {
            console.error(`\n⛔  Port ${port} is already in use (could not determine PID).\n`);
          }
          reject(Object.assign(err, { port }));
        } else {
          reject(err);
        }
      });
    });

  let finalPort = PREFERRED_PORT;

  try {
    finalPort = await tryListen(PREFERRED_PORT);
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      // Try the next available port automatically
      const fallback = PREFERRED_PORT + 1;
      console.warn(`↳ Trying fallback port ${fallback}...`);
      try {
        finalPort = await tryListen(fallback);
        console.warn(`⚠️  Backend started on fallback port ${fallback} instead of ${PREFERRED_PORT}.`);
        console.warn(`    Update your Next.js proxy to point to port ${fallback} if needed.`);
      } catch {
        console.error(`❌ Both ports ${PREFERRED_PORT} and ${fallback} are in use. Cannot start server.`);
        console.error('   Please close any existing KR Music backend process and retry.');
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to start server:', (err as Error).message);
      process.exit(1);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ KR Music API Server ready`);
  console.log(`   ▶ http://localhost:${finalPort}`);
  console.log(`   ⏱ Startup completed in ${elapsed}s\n`);

  // Verify and load local assets in the background (non-blocking)
  ensureAssets()
    .then(async () => {
      console.log('📁 All local music assets verified and ready.');
      copyGeneratedCovers();
      copyMovieCovers();
      await processMovieSongs();
      await seedTollywoodMoviesDB();
    })
    .catch((err) => console.error('⚠️  Error during background asset verification:', err));
};

startServer();
