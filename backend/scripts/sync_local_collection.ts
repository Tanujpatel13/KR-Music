import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const songsDir = path.join(process.cwd(), '..', 'Songs');
const imagesDir = path.join(process.cwd(), '..', 'images');

const imageFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

function findBestImage(title: string, filename: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerFile = filename.toLowerCase();

  for (const img of imageFiles) {
    const imgLower = img.toLowerCase();
    if (lowerTitle.includes('apna bana') && imgLower.includes('apna bana')) return `/local-images/${encodeURIComponent(img)}`;
    if (lowerTitle.includes('tum hi ho') && imgLower.includes('aashiqui')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('bekhayali') || lowerTitle.includes('kaise hua') || lowerTitle.includes('tujhe kitna')) && imgLower.includes('kabir')) return `/local-images/${encodeURIComponent(img)}`;
    if (lowerTitle.includes('kesariya') && imgLower.includes('kesariya')) return `/local-images/${encodeURIComponent(img)}`;
    if (lowerTitle.includes('gehra hua') && imgLower.includes('gehra')) return `/local-images/${encodeURIComponent(img)}`;
    if (lowerTitle.includes('nadaaniyan') && imgLower.includes('nadaaniya')) return `/local-images/${encodeURIComponent(img)}`;
    if (lowerTitle.includes('sahiba') && imgLower.includes('sahiba')) return `/local-images/${encodeURIComponent(img)}`;
    if (lowerTitle.includes('paaro') && imgLower.includes('paaro')) return `/local-images/${encodeURIComponent(img)}`;
    // Most Eligible Bachelor
    if ((lowerTitle.includes('manasa manasa') || lowerTitle.includes('most eligible')) && imgLower.includes('most-eligible')) return `/local-images/${encodeURIComponent(img)}`;
    // Aravinda Sametha - Anaganaganaga
    if ((lowerTitle.includes('anaganaganaga') || lowerTitle.includes('aravindha') || lowerFile.includes('aravindha')) && imgLower.includes('aravinda')) return `/local-images/${encodeURIComponent(img)}`;
    // I Wanna Fly - Krishnarjuna Yudham
    if ((lowerTitle.includes('i wanna fly') || lowerFile.includes('krishnarjuna') || lowerFile.includes('i wanna fly')) && imgLower.includes('i wanna fly')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('samajavaragamana') || lowerTitle.includes('buttabomma') || lowerTitle.includes('ramuloo') || lowerTitle.includes('daddy') || lowerTitle.includes('sittharala')) && imgLower.includes('ala-vaikunt')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('srivalli') || lowerTitle.includes('saami') || lowerTitle.includes('antava') || lowerTitle.includes('dakko') || lowerTitle.includes('eyy bidda')) && imgLower.includes('pushpa')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('dhivara') || lowerTitle.includes('manohari') || lowerTitle.includes('mamatala') || lowerTitle.includes('sivuni') || lowerTitle.includes('pacha') || lowerTitle.includes('jeeva') || lowerTitle.includes('nippul')) && imgLower.includes('bahubali')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('samayama') || lowerTitle.includes('adigaa') || lowerTitle.includes('ammaadi') || lowerTitle.includes('odiyamma') || lowerTitle.includes('gaaju')) && imgLower.includes('hi nanna')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('sirivennela') || lowerTitle.includes('pranavalaya') || lowerTitle.includes('tara')) && imgLower.includes('shyam singh')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('rangamma') || lowerTitle.includes('ranga ranga') || lowerTitle.includes('jigelu') || lowerTitle.includes('yentha sakka') || lowerTitle.includes('orayyo')) && imgLower.includes('rangastalam')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('inkem inkem') || lowerTitle.includes('vachindamma') || lowerTitle.includes('what the f') || lowerTitle.includes('tanemandhe') || lowerTitle.includes('yenti yenti')) && imgLower.includes('geetha')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('bangaru kodi') || lowerTitle.includes('panchadhara') || lowerTitle.includes('dheera dheera') || lowerTitle.includes('magadheera')) && imgLower.includes('maghadera')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('priyathama') || lowerTitle.includes('majili') || lowerTitle.includes('gundello') || lowerTitle.includes('one boy')) && imgLower.includes('majili')) return `/local-images/${encodeURIComponent(img)}`;
    if (lowerTitle.includes('ammayi') && imgLower.includes('animal')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('inka edo') || lowerTitle.includes('neeve') || lowerTitle.includes('hosahore')) && imgLower.includes('darling')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('ee hridayam') || lowerTitle.includes('aaromale') || lowerTitle.includes('kundanapu') || lowerTitle.includes('manasaa') || lowerTitle.includes('vintunnavaa')) && imgLower.includes('ea maya')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('mahanati') || lowerTitle.includes('mooga manasulu') || lowerTitle.includes('sada nannu') || lowerTitle.includes('baalyama') || lowerTitle.includes('gelupuleni') || lowerTitle.includes('chivaraku')) && imgLower.includes('mahanathi')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('mirchi') || lowerTitle.includes('barbie') || lowerTitle.includes('darlingey') || lowerTitle.includes('idhedho') || lowerTitle.includes('nee choopula') || lowerTitle.includes('pandagala') || lowerTitle.includes('yahoon')) && imgLower.includes('mirchi')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('alanati') || lowerTitle.includes('cheppamma') || lowerTitle.includes('ekkada ekkada') || lowerTitle.includes('bhama bhama') || lowerTitle.includes('bangaru kalla') || lowerTitle.includes('dum dum dum')) && imgLower.includes('murari')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('ola olaala') || lowerTitle.includes('chilipiga') || lowerTitle.includes('nenu nuvvantu') || lowerTitle.includes('hello rammante') || lowerTitle.includes('o range') || lowerTitle.includes('rooba rooba')) && imgLower.includes('orange')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('super machi') || lowerTitle.includes('come to the party') || lowerTitle.includes('chal chalo') || lowerTitle.includes('jaaruko') || lowerTitle.includes('seethakaalam') || lowerTitle.includes('vacchadu')) && imgLower.includes('sathyamurthy')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('manasu maree') || lowerTitle.includes('vastunna') || lowerTitle.includes('baby touch') || lowerTitle.includes('ranga rangeli')) && imgLower.includes('v-2020')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('vunnadhi okate') || lowerTitle.includes('trend maarina') || lowerTitle.includes('what amma') || lowerTitle.includes('rayyi rayyi') || lowerTitle.includes('rainbow')) && imgLower.includes('vunnadhi')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('okka mata') || lowerTitle.includes('aey pilla') || lowerTitle.includes('dum dumare') || lowerTitle.includes('o cheli') || lowerTitle.includes('madhura') || lowerTitle.includes('rajakumara')) && imgLower.includes('arjun')) return `/local-images/${encodeURIComponent(img)}`;
    if ((lowerTitle.includes('feel my love') || lowerTitle.includes('aa ante') || lowerTitle.includes('you rock') || lowerTitle.includes('thakadimithom')) && imgLower.includes('arya')) return `/local-images/${encodeURIComponent(img)}`;
  }

  return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
}

function cleanTitle(file: string): string {
  let title = file
    .replace(/\.mp3$/i, '')
    .replace(/^(\d+[\s\-_]+)+/, '')
    .replace(/[-_]?SenSongsMp3\.(Co|Com)/gi, '')
    .replace(/[-_]?NaaSongs/gi, '')
    .replace(/[-_]?320\s*Kbps/gi, '')
    .replace(/[-_]?KoshalWorld\.Com/gi, '')
    .replace(/[-_]?Full Video.*$/gi, '')
    .replace(/[-_]?Full Audio.*$/gi, '')
    .replace(/[-_]?Brahmāstra.*$/gi, '')
    .replace(/\(1\)$/gi, '')
    .trim();

  if (title.toLowerCase().startsWith('sirivennala')) return 'Sirivennela';
  if (title.toLowerCase().startsWith('mirchi')) return 'Mirchi Theme';
  if (title.toLowerCase().startsWith('kesariya')) return 'Kesariya';
  if (title.toLowerCase().startsWith('tum hi ho')) return 'Tum Hi Ho';
  if (title.toLowerCase().startsWith('barbie girl')) return 'Barbie Girl';
  if (title.toLowerCase().startsWith('jeva nadhi')) return 'Jeeva Nadhi';
  return title || file;
}

function detectLanguage(title: string, file: string): string {
  const lower = (title + ' ' + file).toLowerCase();
  
  const hindiKeywords = ['apna bana le', 'bekhayali', 'gehra hua', 'kaise hua', 'kesariya', 'nadaaniyan', 'paaro', 'sahiba', 'tujhe kitna', 'tum hi ho', 'ammayi'];
  for (const k of hindiKeywords) {
    if (lower.includes(k)) return 'Hindi';
  }

  const englishKeywords = ['barbie girl', 'dheevara (english version)', 'life is a rainbow', 'you rock my world', 'omg daddy', 'baby touch me now', 'one & two & three', 'come to the party', 'what the life', 'what the f'];
  for (const k of englishKeywords) {
    if (lower.includes(k)) return 'English';
  }

  return 'Telugu';
}

async function main() {
  console.log('Syncing local Songs collection into database & playlists...');

  const songFiles = fs.readdirSync(songsDir).filter(f => f.endsWith('.mp3'));
  console.log(`Processing ${songFiles.length} local audio files...`);

  const defaultArtist = await prisma.artist.upsert({
    where: { id: 'loc_art_main' },
    update: {},
    create: {
      id: 'loc_art_main',
      name: 'KR Local Artists',
      bio: 'Collection of top local Indian & International soundtrack artists.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
      popularity: 95
    }
  });

  const defaultAlbum = await prisma.album.upsert({
    where: { id: 'loc_alb_main' },
    update: {},
    create: {
      id: 'loc_alb_main',
      name: 'Local Songs Vault',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
      releaseYear: 2026,
      artistId: defaultArtist.id
    }
  });

  const teluguGenre = await prisma.genre.upsert({ where: { name: 'Telugu Hits' }, update: {}, create: { name: 'Telugu Hits' } });
  const hindiGenre = await prisma.genre.upsert({ where: { name: 'Hindi Hits' }, update: {}, create: { name: 'Hindi Hits' } });
  const englishGenre = await prisma.genre.upsert({ where: { name: 'English Hits' }, update: {}, create: { name: 'English Hits' } });

  const createdSongs: any[] = [];

  for (const file of songFiles) {
    const title = cleanTitle(file);
    const lang = detectLanguage(title, file);
    const coverImage = findBestImage(title, file);
    const audioUrl = `/local-songs/${encodeURIComponent(file)}`;
    const songId = 'loc_' + Buffer.from(file).toString('hex').substring(0, 16);

    const genre = lang === 'Hindi' ? hindiGenre : (lang === 'English' ? englishGenre : teluguGenre);

    const song = await prisma.song.upsert({
      where: { id: songId },
      update: {
        name: title,
        audioUrl,
        coverImage,
        language: lang
      },
      create: {
        id: songId,
        name: title,
        duration: 240,
        releaseYear: 2026,
        coverImage,
        audioUrl,
        artistId: defaultArtist.id,
        albumId: defaultAlbum.id,
        genreId: genre.id,
        language: lang
      },
      include: { artist: true, album: true }
    });

    createdSongs.push(song);
  }

  console.log(`Successfully synced ${createdSongs.length} local songs into database!`);

  const hindiSongs = createdSongs.filter(s => s.language === 'Hindi');
  const teluguSongs = createdSongs.filter(s => s.language === 'Telugu');
  const englishSongs = createdSongs.filter(s => s.language === 'English');

  console.log(`Language Breakdown -> Telugu: ${teluguSongs.length}, Hindi: ${hindiSongs.length}, English: ${englishSongs.length}`);

  const playlistsToCreate = [
    {
      id: 'pl_recommended',
      name: 'Recommended',
      description: 'All your local songs — the complete recommended collection.',
      songs: createdSongs
    },
    {
      id: 'pl_all_local',
      name: 'All Local Songs',
      description: 'Complete collection of all songs in your Songs folder.',
      songs: createdSongs
    },
    {
      id: 'pl_hindi_hits',
      name: 'Hindi Hits',
      description: 'Top Bollywood & Hindi romantic melodies and blockbusters.',
      songs: hindiSongs
    },
    {
      id: 'pl_telugu_hits',
      name: 'Telugu Hits',
      description: 'Chart-topping Tollywood & Telugu melodies.',
      songs: teluguSongs
    },
    {
      id: 'pl_english_hits',
      name: 'English Hits',
      description: 'Popular International English pop and dance anthems.',
      songs: englishSongs
    }
  ];


  let owner = await prisma.user.findFirst();
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        email: 'system@krmusic.com',
        username: 'KR Music System',
        passwordHash: 'system123',
        role: 'ADMIN'
      }
    });
  }

  for (const plData of playlistsToCreate) {
    await prisma.playlistSong.deleteMany({ where: { playlistId: plData.id } });

    const playlist = await prisma.playlist.upsert({
      where: { id: plData.id },
      update: {
        name: plData.name,
        description: plData.description,
        isPublic: true,
        coverImage: plData.songs[0]?.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'
      },
      create: {
        id: plData.id,
        name: plData.name,
        description: plData.description,
        isPublic: true,
        coverImage: plData.songs[0]?.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
        userId: owner.id
      }
    });

    const addedSongIds = new Set<string>();
    for (const song of plData.songs) {
      if (addedSongIds.has(song.id)) continue;
      addedSongIds.add(song.id);

      await prisma.playlistSong.create({
        data: {
          playlistId: playlist.id,
          songId: song.id
        }
      });
    }

    console.log(`Playlist created/updated: "${playlist.name}" with ${addedSongIds.size} unique songs.`);
  }

  console.log('ALL PLAYLISTS CREATED SUCCESSFULLY IN DATABASE!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error syncing local collection:', err);
  process.exit(1);
});
