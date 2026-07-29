import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KR Music Database with local Telugu & Hindi songs...');

  // 1. Clear database
  await prisma.listeningHistory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.lyrics.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.genre.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@krmusic.com',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  const artistUser1 = await prisma.user.create({
    data: {
      email: 'arijit_singh@krmusic.com',
      username: 'ArijitSingh',
      passwordHash,
      role: 'ARTIST',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@krmusic.com',
      username: 'KRListener',
      passwordHash,
      role: 'USER',
      profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  // Add default active subscriptions
  await prisma.subscription.create({
    data: { userId: admin.id, plan: 'PREMIUM_INDIVIDUAL', status: 'ACTIVE' },
  });
  await prisma.subscription.create({
    data: { userId: artistUser1.id, plan: 'FREE', status: 'ACTIVE' },
  });
  await prisma.subscription.create({
    data: { userId: normalUser.id, plan: 'FREE', status: 'ACTIVE' },
  });

  // 3. Create Indian Artists
  const artist1 = await prisma.artist.create({
    data: {
      name: 'Arijit Singh',
      bio: 'Leading Hindi playback singer and composer known for romantic melodies.',
      image: 'http://localhost:5000/static/images/kesariya.jpg',
      userId: artistUser1.id,
      popularity: 98,
    },
  });

  const artist2 = await prisma.artist.create({
    data: {
      name: 'Sid Sriram',
      bio: 'Renowned Indian-American Carnatic musician and playback singer in Telugu cinema.',
      image: 'http://localhost:5000/static/images/srivalli.jpg',
      popularity: 95,
    },
  });

  const artist3 = await prisma.artist.create({
    data: {
      name: 'Anurag Kulkarni',
      bio: 'Versatile Telugu playback singer known for emotional range and chartbusters.',
      image: 'http://localhost:5000/static/images/sirivennela.jpg',
      popularity: 90,
    },
  });

  const artist4 = await prisma.artist.create({
    data: {
      name: 'Mickey J. Meyer',
      bio: 'Acclaimed Indian music composer and singer known for his work in Telugu cinema.',
      image: 'http://localhost:5000/static/images/shyam_singha_roy.jpg',
      popularity: 92,
    },
  });

  const artist5 = await prisma.artist.create({
    data: {
      name: 'Devi Sri Prasad',
      bio: 'Famous music composer, singer, and director in South Indian cinema, particularly Telugu.',
      image: 'http://localhost:5000/static/images/pushpa.jpg',
      popularity: 96,
    },
  });

  const artist6 = await prisma.artist.create({
    data: {
      name: 'Hesham Abdul Wahab',
      bio: 'Famous music composer and singer known for his soulful melodies in Malayalam and Telugu cinema.',
      image: 'http://localhost:5000/static/images/hi_nanna.jpg',
      popularity: 94,
    },
  });

  const artist7 = await prisma.artist.create({
    data: {
      name: 'M. M. Keeravani',
      bio: 'Legendary Indian music composer and playback singer who won the Academy Award for Naatu Naatu.',
      image: 'http://localhost:5000/static/images/magadheera.jpg',
      popularity: 97,
    },
  });

  const artist8 = await prisma.artist.create({
    data: {
      name: 'Gopi Sundar',
      bio: 'Popular Indian music composer, singer, and programmer known for Malayalam and Telugu cinema hits.',
      image: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      popularity: 93,
    },
  });

  const artist9 = await prisma.artist.create({
    data: {
      name: 'A. R. Rahman',
      bio: 'Academy Award winning composer, singer, and songwriter.',
      image: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg',
      popularity: 99,
    },
  });

  const artist10 = await prisma.artist.create({
    data: {
      name: 'Thaman S',
      bio: 'Prominent Telugu music director and composer.',
      image: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg',
      popularity: 95,
    },
  });

  const artist11 = await prisma.artist.create({
    data: {
      name: 'Harris Jayaraj',
      bio: 'Acclaimed composer and music producer in South India.',
      image: 'http://localhost:5000/static/images/orange.jpg',
      popularity: 94,
    },
  });

  const artist12 = await prisma.artist.create({
    data: {
      name: 'Amit Trivedi',
      bio: 'Highly versatile Indian music composer and singer.',
      image: 'http://localhost:5000/static/images/v.jpg',
      popularity: 94,
    },
  });

  const artist13 = await prisma.artist.create({
    data: {
      name: 'G. V. Prakash Kumar',
      bio: 'Award-winning Indian music composer, singer, and actor.',
      image: 'http://localhost:5000/static/images/darling.jpg',
      popularity: 94,
    },
  });

  const artist14 = await prisma.artist.create({
    data: {
      name: 'Mani Sharma',
      bio: 'Legendary Indian music composer, singer, and music director active primarily in Telugu cinema, known as Melodi Brahma.',
      image: 'http://localhost:5000/static/images/arjun.jpg',
      popularity: 95,
    },
  });


  // 4. Create Genres
  const romanticMelody = await prisma.genre.create({ data: { name: 'Romantic Melody' } });
  const dancePop = await prisma.genre.create({ data: { name: 'Dance Pop' } });
  const classicalFusion = await prisma.genre.create({ data: { name: 'Classical Fusion' } });

  // 5. Create Indian Albums
  const album1 = await prisma.album.create({
    data: {
      name: 'Arijit Romantic Hits',
      coverImage: 'http://localhost:5000/static/images/kesariya.jpg',
      releaseYear: 2024,
      artistId: artist1.id,
    },
  });

  const album2 = await prisma.album.create({
    data: {
      name: 'Telugu Melodic Waves',
      coverImage: 'http://localhost:5000/static/images/srivalli.jpg',
      releaseYear: 2023,
      artistId: artist2.id,
    },
  });

  const album3 = await prisma.album.create({
    data: {
      name: 'Sensation Anurag',
      coverImage: 'http://localhost:5000/static/images/sirivennela.jpg',
      releaseYear: 2025,
      artistId: artist3.id,
    },
  });

  const album4 = await prisma.album.create({
    data: {
      name: 'Shyam Singha Roy',
      coverImage: 'http://localhost:5000/static/images/shyam_singha_roy.jpg',
      releaseYear: 2021,
      artistId: artist4.id,
    },
  });

  const album5 = await prisma.album.create({
    data: {
      name: 'Pushpa: The Rise',
      coverImage: 'http://localhost:5000/static/images/pushpa.jpg',
      releaseYear: 2021,
      artistId: artist5.id,
    },
  });

  const album6 = await prisma.album.create({
    data: {
      name: 'Hi Nanna',
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      releaseYear: 2023,
      artistId: artist6.id,
    },
  });

  const album7 = await prisma.album.create({
    data: {
      name: 'Magadheera',
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      releaseYear: 2009,
      artistId: artist7.id,
    },
  });

  const album8 = await prisma.album.create({
    data: {
      name: 'Geetha Govindam',
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      releaseYear: 2018,
      artistId: artist8.id,
    },
  });

  const album9 = await prisma.album.create({
    data: {
      name: 'Ye Maaya Chesave',
      coverImage: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg',
      releaseYear: 2010,
      artistId: artist9.id,
    },
  });

  const album10 = await prisma.album.create({
    data: {
      name: 'Rangasthalam',
      coverImage: 'http://localhost:5000/static/images/rangasthalam.jpg',
      releaseYear: 2018,
      artistId: artist5.id,
    },
  });

  const album11 = await prisma.album.create({
    data: {
      name: 'Arya',
      coverImage: 'http://localhost:5000/static/images/arya.jpg',
      releaseYear: 2004,
      artistId: artist5.id,
    },
  });

  const album12 = await prisma.album.create({
    data: {
      name: 'Ala Vaikunthapurramuloo',
      coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg',
      releaseYear: 2020,
      artistId: artist10.id,
    },
  });

  const album13 = await prisma.album.create({
    data: {
      name: 'Orange',
      coverImage: 'http://localhost:5000/static/images/orange.jpg',
      releaseYear: 2010,
      artistId: artist11.id,
    },
  });

  const album14 = await prisma.album.create({
    data: {
      name: 'Mirchi',
      coverImage: 'http://localhost:5000/static/images/mirchi.jpg',
      releaseYear: 2013,
      artistId: artist5.id,
    },
  });

  const album15 = await prisma.album.create({
    data: {
      name: 'Son of Satyamurthy',
      coverImage: 'http://localhost:5000/static/images/son_of_satyamurthy.jpg',
      releaseYear: 2015,
      artistId: artist5.id,
    },
  });

  const albumMahanati = await prisma.album.create({
    data: {
      name: 'Mahanati',
      coverImage: 'http://localhost:5000/static/images/mahanati.jpg',
      releaseYear: 2018,
      artistId: artist4.id,
    },
  });

  const albumZindagi = await prisma.album.create({
    data: {
      name: 'Vunnadhi Okate Zindagi',
      coverImage: 'http://localhost:5000/static/images/vunnadhi_okate_zindagi.jpg',
      releaseYear: 2017,
      artistId: artist5.id,
    },
  });

  const albumV = await prisma.album.create({
    data: {
      name: 'V',
      coverImage: 'http://localhost:5000/static/images/v.jpg',
      releaseYear: 2020,
      artistId: artist12.id,
    },
  });

  const albumDarling = await prisma.album.create({
    data: {
      name: 'Darling',
      coverImage: 'http://localhost:5000/static/images/darling.jpg',
      releaseYear: 2010,
      artistId: artist13.id,
    },
  });

  const albumMajili = await prisma.album.create({
    data: {
      name: 'Majili',
      coverImage: 'http://localhost:5000/static/images/majili.jpg',
      releaseYear: 2019,
      artistId: artist8.id,
    },
  });

  const albumArjun = await prisma.album.create({
    data: {
      name: 'Arjun',
      coverImage: 'http://localhost:5000/static/images/arjun.jpg',
      releaseYear: 2004,
      artistId: artist14.id,
    },
  });

  const albumBaahubali = await prisma.album.create({
    data: {
      name: 'Baahubali: The Beginning',
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      releaseYear: 2015,
      artistId: artist7.id, // M. M. Keeravani
    },
  });

  const albumPeddi = await prisma.album.create({
    data: {
      name: 'Peddi',
      coverImage: 'http://localhost:5000/static/images/peddi.jpg',
      releaseYear: 2026,
      artistId: artist9.id, // A. R. Rahman
    },
  });



  // 6. Create Songs (Hindi & Telugu only) pointing to local static assets
  const songsData = [
    {
      name: 'Kesariya',
      duration: 268,
      releaseYear: 2022,
      coverImage: 'http://localhost:5000/static/images/kesariya.jpg',
      audioUrl: 'http://localhost:5000/static/audio/kesariya.mp3',
      artistId: artist1.id,
      albumId: album1.id,
      genreId: romanticMelody.id,
      language: 'Hindi',
      lyrics: '[00:00] (Music Intro)\n[00:10] Mujhko saza de ya riha kar\n[00:15] Kesariya tera ishq hai piya\n[00:20] Rang jaaun jo main haath lagaaun\n[00:25] Din beete saara teri fikr mein\n[00:30] Rain saari teri khair manaaun',
    },
    {
      name: 'Tum Hi Ho',
      duration: 262,
      releaseYear: 2013,
      coverImage: 'http://localhost:5000/static/images/tum_hi_ho.jpg',
      audioUrl: 'http://localhost:5000/static/audio/tum_hi_ho.mp3',
      artistId: artist1.id,
      albumId: album1.id,
      genreId: romanticMelody.id,
      language: 'Hindi',
      lyrics: '[00:00] (Piano Intro)\n[00:15] Hum tere bin ab reh nahi sakte\n[00:22] Tere bina kya wajood mera\n[00:30] Kyunki tum hi ho, ab tum hi ho\n[00:38] Zindagi ab tum hi ho',
    },
    {
      name: 'Srivalli',
      duration: 224,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/pushpa.jpg',
      audioUrl: 'http://localhost:5000/static/audio/srivalli.mp3',
      artistId: artist5.id,
      albumId: album5.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Instrumental Intro)\n[00:15] Choope bangaramayene srivalli\n[00:20] Maate maanikyamayene\n[00:25] Navve navvaabunayene srivalli\n[00:30] Choosthe sravanamayene',
    },
    {
      name: 'Samayama',
      duration: 278,
      releaseYear: 2023,
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      audioUrl: 'http://localhost:5000/static/audio/samayama.mp3',
      artistId: artist6.id,
      albumId: album6.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Guitar Intro)\n[00:12] Samayama reppalu veyakuma\n[00:18] Hrudayama sadiye cheyakuma\n[00:25] Chelini nenu choosey vela\n[00:30] Kaalam aagipoda ila',
    },
    {
      name: 'Sirivennela',
      duration: 255,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/shyam_singha_roy.jpg',
      audioUrl: 'http://localhost:5000/static/audio/sirivennela.mp3',
      artistId: artist3.id,
      albumId: album4.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Flute Intro)\n[00:18] Ee kshaname eduruga nilichina siri\n[00:24] Vennela kurisenamma\n[00:30] Gundela lopala nee gnaapakam\n[00:36] Deepam veliginchedamma',
    },
    {
      name: 'Pranavalaya',
      duration: 243,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/shyam_singha_roy.jpg',
      audioUrl: 'http://localhost:5000/static/audio/pranavalaya.mp3',
      artistId: artist3.id,
      albumId: album4.id,
      genreId: classicalFusion.id,
      language: 'Telugu',
      lyrics: '[00:00] (Instrumental Intro)\n[00:15] Pranavalaya chathura harini\n[00:20] Narthana murali dhari\n[00:25] Sakala kalaa ranjini',
    },
    {
      name: 'Sirivennela (Female)',
      duration: 182,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/shyam_singha_roy.jpg',
      audioUrl: 'http://localhost:5000/static/audio/sirivennela_female.mp3',
      artistId: artist4.id,
      albumId: album4.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Music Intro)\n[00:15] Ee kshaname eduruga nilichina siri\n[00:24] Vennela kurisenamma',
    },
    {
      name: 'Edo Edo',
      duration: 202,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/shyam_singha_roy.jpg',
      audioUrl: 'http://localhost:5000/static/audio/edo_edo.mp3',
      artistId: artist4.id,
      albumId: album4.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Piano Intro)\n[00:15] Edo edo gundello nindipoye\n[00:20] Maatalone mounam karigipoye',
    },
    {
      name: 'Tara',
      duration: 172,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/shyam_singha_roy.jpg',
      audioUrl: 'http://localhost:5000/static/audio/tara.mp3',
      artistId: artist4.id,
      albumId: album4.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Guitar Intro)\n[00:15] Tara o taraa\n[00:20] Ninnu choosina kshanaana',
    },
    {
      name: 'Dakko Dakko Meka',
      duration: 292,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/pushpa.jpg',
      audioUrl: 'http://localhost:5000/static/audio/dakko_dakko_meka.mp3',
      artistId: artist5.id,
      albumId: album5.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Music Intro)\n[00:15] Dakko dakko meka pulochhi korukuthundhi peeka\n[00:20] Kasikesi kasikesi',
    },
    {
      name: 'Saami Saami',
      duration: 223,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/pushpa.jpg',
      audioUrl: 'http://localhost:5000/static/audio/saami_saami.mp3',
      artistId: artist5.id,
      albumId: album5.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Beats Intro)\n[00:15] Naa saami saami\n[00:20] Aa venaka ninnu choosthe gunde jallumane saami',
    },
    {
      name: 'Oo Antava Oo Oo Antava',
      duration: 228,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/pushpa.jpg',
      audioUrl: 'http://localhost:5000/static/audio/oo_antava.mp3',
      artistId: artist5.id,
      albumId: album5.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Instrumental)\n[00:15] Oo antava maava oo oo antava maava\n[00:20] Magabu buddhe vankara buddi maava',
    },
    {
      name: 'Eyy Bidda Idhi Naa Adda',
      duration: 234,
      releaseYear: 2021,
      coverImage: 'http://localhost:5000/static/images/pushpa.jpg',
      audioUrl: 'http://localhost:5000/static/audio/eyy_bidda_idhi_naa_adda.mp3',
      artistId: artist5.id,
      albumId: album5.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Trumpet Intro)\n[00:15] Eyy bidda idhi naa adda\n[00:20] Thaggedhele',
    },
    {
      name: 'Adigaa',
      duration: 217,
      releaseYear: 2023,
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      audioUrl: 'http://localhost:5000/static/audio/adigaa.mp3',
      artistId: artist6.id,
      albumId: album6.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Music Intro)\n[00:15] Adigaa adigaa ninnu adigaa\n[00:20] Kuduruga nilichena pranam',
    },
    {
      name: 'Ammaadi',
      duration: 224,
      releaseYear: 2023,
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      audioUrl: 'http://localhost:5000/static/audio/ammaadi.mp3',
      artistId: artist6.id,
      albumId: album6.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Acoustic Intro)\n[00:15] Ammaadi nee kanti paapa naalo\n[00:20] Kanti paapa ila cherada',
    },
    {
      name: 'Chedhu Nijam',
      duration: 263,
      releaseYear: 2023,
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      audioUrl: 'http://localhost:5000/static/audio/chedhu_nijam.mp3',
      artistId: artist6.id,
      albumId: album6.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Soft Music)\n[00:15] Chedhu nijame kalige vela\n[00:20] Nuvve thodu lekapothe ela',
    },
    {
      name: 'Gaaju Bomma',
      duration: 273,
      releaseYear: 2023,
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      audioUrl: 'http://localhost:5000/static/audio/gaaju_bomma.mp3',
      artistId: artist6.id,
      albumId: album6.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Piano Intro)\n[00:15] Naa chinni gaaju bomma\n[00:20] Karigipokuma kanti paapa',
    },
    {
      name: 'Needhe Needhe',
      duration: 204,
      releaseYear: 2023,
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      audioUrl: 'http://localhost:5000/static/audio/needhe_needhe.mp3',
      artistId: artist6.id,
      albumId: album6.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Guitar Chords)\n[00:15] Needhe needhe ee bandham needhe\n[00:20] Pranam needhe o nesthe',
    },
    {
      name: 'Odiyamma',
      duration: 206,
      releaseYear: 2023,
      coverImage: 'http://localhost:5000/static/images/hi_nanna.jpg',
      audioUrl: 'http://localhost:5000/static/audio/odiyamma.mp3',
      artistId: artist6.id,
      albumId: album6.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Beat Drops)\n[00:15] Odiyamma odiyamma choosthe pichekkuthaandhi\n[00:20] Sandhadhi sandhadhi',
    },
    {
      name: 'Panchadara Bomma',
      duration: 280,
      releaseYear: 2009,
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      audioUrl: 'http://localhost:5000/static/audio/panchadara_bomma.mp3',
      artistId: artist7.id,
      albumId: album7.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Flute Intro)\n[00:15] Panchadara bomma bomma\n[00:20] Ninnu choosthe pranam pothundhe bomma',
    },
    {
      name: 'Nakosam Nuvu',
      duration: 280,
      releaseYear: 2009,
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      audioUrl: 'http://localhost:5000/static/audio/nakosam_nuvu.mp3',
      artistId: artist7.id,
      albumId: album7.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Switzerland Intro)\n[00:15] Nakosam nuvu nilichavu',
    },
    {
      name: 'Dheera Dheera',
      duration: 228,
      releaseYear: 2009,
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      audioUrl: 'http://localhost:5000/static/audio/dheera_dheera.mp3',
      artistId: artist7.id,
      albumId: album7.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Beats Intro)\n[00:15] Dheera dheera dheera\n[00:20] Manasuna unnadhi cheppara dheera',
    },
    {
      name: 'Nee Kanti Chupullo',
      duration: 270,
      releaseYear: 2009,
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      audioUrl: 'http://localhost:5000/static/audio/nee_kanti_chupullo.mp3',
      artistId: artist7.id,
      albumId: album7.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Guitar Intro)\n[00:15] Nee kanti chupullo\n[00:20] Naa pranam undhayyo',
    },
    {
      name: 'Jorsey',
      duration: 290,
      releaseYear: 2009,
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      audioUrl: 'http://localhost:5000/static/audio/jorsey.mp3',
      artistId: artist7.id,
      albumId: album7.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Dhol Intro)\n[00:15] Jorsey jorsey jorsey\n[00:20] Nachave pilla nuvvu jorsey',
    },
    {
      name: 'Bangaru Kodipetta',
      duration: 344,
      releaseYear: 2009,
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      audioUrl: 'http://localhost:5000/static/audio/bangaru_kodipetta.mp3',
      artistId: artist7.id,
      albumId: album7.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Beats Intro)\n[00:15] Bangaru kodipetta vachhindhamma\n[00:20] Hari lo ranga hari',
    },
    {
      name: 'Rolling Title Music',
      duration: 153,
      releaseYear: 2009,
      coverImage: 'http://localhost:5000/static/images/magadheera.jpg',
      audioUrl: 'http://localhost:5000/static/audio/rolling_title_music.mp3',
      artistId: artist7.id,
      albumId: album7.id,
      genreId: classicalFusion.id,
      language: 'Telugu',
      lyrics: '[00:00] (Instrumental Theme)',
    },
    {
      name: 'Inkem Inkem Inkem Kaavaale',
      duration: 262,
      releaseYear: 2018,
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      audioUrl: 'http://localhost:5000/static/audio/inkem_inkem.mp3',
      artistId: artist8.id,
      albumId: album8.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Veena Intro)\n[00:15] Inkem inkem inkem kaavaale\n[00:20] Chaale idhi chaale naku',
    },
    {
      name: 'Kanureppala Kaalam',
      duration: 182,
      releaseYear: 2018,
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      audioUrl: 'http://localhost:5000/static/audio/kanureppala_kaalam.mp3',
      artistId: artist8.id,
      albumId: album8.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Soft Music)\n[00:15] Kanureppala kaalam lo\n[00:20] Oopiri aagena thalapulo',
    },
    {
      name: 'Tanemandhe Tanemandhe',
      duration: 200,
      releaseYear: 2018,
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      audioUrl: 'http://localhost:5000/static/audio/tanemandhe_tanemandhe.mp3',
      artistId: artist8.id,
      albumId: album8.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Melody Theme)\n[00:15] Tanemandhe tanemandhe cheli gundelo\n[00:20] Ee mounam emandhe priyuralo',
    },
    {
      name: 'Vachindamma',
      duration: 240,
      releaseYear: 2018,
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      audioUrl: 'http://localhost:5000/static/audio/vachindamma.mp3',
      artistId: artist8.id,
      albumId: album8.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Beats Intro)\n[00:15] Vachindamma vachindamma\n[00:20] Pandage techhindhamma',
    },
    {
      name: 'What The F',
      duration: 210,
      releaseYear: 2018,
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      audioUrl: 'http://localhost:5000/static/audio/what_the_f.mp3',
      artistId: artist8.id,
      albumId: album8.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Modern Beats)\n[00:15] What the F\n[00:20] Em parledhu ley',
    },
    {
      name: 'What The Life',
      duration: 210,
      releaseYear: 2018,
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      audioUrl: 'http://localhost:5000/static/audio/what_the_life.mp3',
      artistId: artist8.id,
      albumId: album8.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Happy Beats)\n[00:15] What the life is this\n[00:20] Prema lo munigithe anthe nesthem',
    },
    {
      name: 'Yenti Yenti',
      duration: 200,
      releaseYear: 2018,
      coverImage: 'http://localhost:5000/static/images/geetha_govindham.jpg',
      audioUrl: 'http://localhost:5000/static/audio/yenti_yenti.mp3',
      artistId: artist8.id,
      albumId: album8.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Violin Intro)\n[00:15] Yenti yenti yenti kothaga\n[00:20] Gundelona edo layaga',
    },
    // Ye Maaya Chesave
    { name: 'Aaromale', duration: 338, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', audioUrl: 'http://localhost:5000/static/audio/aaromale.mp3', artistId: artist9.id, albumId: album9.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aaromale' },
    { name: 'Ee Hridayam', duration: 324, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', audioUrl: 'http://localhost:5000/static/audio/ee_hridayam.mp3', artistId: artist9.id, albumId: album9.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ee Hridayam' },
    { name: 'Kundanapu Bomma', duration: 300, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', audioUrl: 'http://localhost:5000/static/audio/kundanapu_bomma.mp3', artistId: artist9.id, albumId: album9.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Kundanapu Bomma' },
    { name: 'Manasaa', duration: 248, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', audioUrl: 'http://localhost:5000/static/audio/manasaa.mp3', artistId: artist9.id, albumId: album9.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Manasaa' },
    { name: 'Swaasye', duration: 190, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', audioUrl: 'http://localhost:5000/static/audio/swaasye.mp3', artistId: artist9.id, albumId: album9.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Swaasye' },
    { name: 'Vintunnavaa', duration: 408, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/ye_maaya_chesave.jpg', audioUrl: 'http://localhost:5000/static/audio/vintunnavaa.mp3', artistId: artist9.id, albumId: album9.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Vintunnavaa' },
    // Rangasthalam
    { name: 'Rangamma Mangamma', duration: 264, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/rangasthalam.jpg', audioUrl: 'http://localhost:5000/static/audio/rangamma_mangamma.mp3', artistId: artist5.id, albumId: album10.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Rangamma Mangamma' },
    { name: 'Aa Gattununtaava', duration: 207, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/rangasthalam.jpg', audioUrl: 'http://localhost:5000/static/audio/aa_gattununtaava.mp3', artistId: artist5.id, albumId: album10.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aa Gattununtaava' },
    { name: 'Jigelu Rani', duration: 307, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/rangasthalam.jpg', audioUrl: 'http://localhost:5000/static/audio/jigelu_rani.mp3', artistId: artist5.id, albumId: album10.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Jigelu Rani' },
    { name: 'Orayyo', duration: 339, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/rangasthalam.jpg', audioUrl: 'http://localhost:5000/static/audio/orayyo.mp3', artistId: artist5.id, albumId: album10.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Orayyo' },
    { name: 'Ranga Ranga', duration: 319, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/rangasthalam.jpg', audioUrl: 'http://localhost:5000/static/audio/ranga_ranga.mp3', artistId: artist5.id, albumId: album10.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ranga Ranga' },
    { name: 'Yentha Sakkagunnave', duration: 281, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/rangasthalam.jpg', audioUrl: 'http://localhost:5000/static/audio/yentha_sakkagunnave.mp3', artistId: artist5.id, albumId: album10.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Yentha Sakkagunnave' },
    // Arya
    { name: 'Feel My Love', duration: 290, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arya.jpg', audioUrl: 'http://localhost:5000/static/audio/feel_my_love.mp3', artistId: artist5.id, albumId: album11.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Feel My Love' },
    { name: 'Nuvvunte', duration: 309, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arya.jpg', audioUrl: 'http://localhost:5000/static/audio/nuvvunte.mp3', artistId: artist5.id, albumId: album11.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Nuvvunte' },
    { name: 'You Rock My World', duration: 294, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arya.jpg', audioUrl: 'http://localhost:5000/static/audio/you_rock_my_world.mp3', artistId: artist5.id, albumId: album11.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] You Rock My World' },
    { name: 'O My Brotheru', duration: 297, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arya.jpg', audioUrl: 'http://localhost:5000/static/audio/o_my_brotheru.mp3', artistId: artist5.id, albumId: album11.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] O My Brotheru' },
    { name: 'Thakadimithom', duration: 325, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arya.jpg', audioUrl: 'http://localhost:5000/static/audio/thakadimithom.mp3', artistId: artist5.id, albumId: album11.id, genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Thakadimithom' },
    { name: 'Aa Ante Amalapuram', duration: 295, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arya.jpg', audioUrl: 'http://localhost:5000/static/audio/aa_ante_amalapuram.mp3', artistId: artist5.id, albumId: album11.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aa Ante Amalapuram' },
    // Ala Vaikunthapurramuloo
    { name: 'Buttabomma', duration: 198, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: 'http://localhost:5000/static/audio/buttabomma.mp3', artistId: artist10.id, albumId: album12.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Buttabomma' },
    { name: 'Samajavaragamana', duration: 214, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: 'http://localhost:5000/static/audio/samajavaragamana.mp3', artistId: artist10.id, albumId: album12.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Samajavaragamana' },
    { name: 'Ramuloo Ramula', duration: 240, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: 'http://localhost:5000/static/audio/ramuloo_ramula.mp3', artistId: artist10.id, albumId: album12.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ramuloo Ramula' },
    { name: 'OMG Daddy', duration: 220, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: 'http://localhost:5000/static/audio/omg_daddy.mp3', artistId: artist10.id, albumId: album12.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] OMG Daddy' },
    { name: 'Samajavaragamana (Female)', duration: 255, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: 'http://localhost:5000/static/audio/samajavaragamana_female.mp3', artistId: artist10.id, albumId: album12.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Samajavaragamana (Female)' },
    { name: 'Sittharala Sirapadu', duration: 200, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: 'http://localhost:5000/static/audio/sittharala_sirapadu.mp3', artistId: artist10.id, albumId: album12.id, genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Sittharala Sirapadu' },
    { name: 'Ala Vaikunthapurramuloo Theme', duration: 203, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/ala_vaikunthapurramuloo.jpg', audioUrl: 'http://localhost:5000/static/audio/ala_vaikunthapurramuloo_theme.mp3', artistId: artist10.id, albumId: album12.id, genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Theme Intro)' },
    // Orange
    { name: 'Ola Olaala', duration: 260, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/orange.jpg', audioUrl: 'http://localhost:5000/static/audio/ola_olaala.mp3', artistId: artist11.id, albumId: album13.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Ola Olaala' },
    { name: 'Chilipiga', duration: 250, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/orange.jpg', audioUrl: 'http://localhost:5000/static/audio/chilipiga.mp3', artistId: artist11.id, albumId: album13.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Chilipiga' },
    { name: 'Nenu Nuvvantu', duration: 280, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/orange.jpg', audioUrl: 'http://localhost:5000/static/audio/nenu_nuvvantu.mp3', artistId: artist11.id, albumId: album13.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Nenu Nuvvantu' },
    { name: 'Hello Rammante', duration: 282, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/orange.jpg', audioUrl: 'http://localhost:5000/static/audio/hello_rammante.mp3', artistId: artist11.id, albumId: album13.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Hello Rammante' },
    { name: 'O Range', duration: 272, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/orange.jpg', audioUrl: 'http://localhost:5000/static/audio/o_range.mp3', artistId: artist11.id, albumId: album13.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] O Range' },
    { name: 'Rooba Rooba', duration: 270, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/orange.jpg', audioUrl: 'http://localhost:5000/static/audio/rooba_rooba.mp3', artistId: artist11.id, albumId: album13.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Rooba Rooba' },
    // Mirchi
    { name: 'Mirchi Theme', duration: 85, releaseYear: 2013, coverImage: 'http://localhost:5000/static/images/mirchi.jpg', audioUrl: 'http://localhost:5000/static/audio/mirchi_theme.mp3', artistId: artist5.id, albumId: album14.id, genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Theme Intro)' },
    { name: 'Barbie Girl', duration: 240, releaseYear: 2013, coverImage: 'http://localhost:5000/static/images/mirchi.jpg', audioUrl: 'http://localhost:5000/static/audio/barbie_girl.mp3', artistId: artist5.id, albumId: album14.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Barbie Girl' },
    { name: 'Darlingey', duration: 230, releaseYear: 2013, coverImage: 'http://localhost:5000/static/images/mirchi.jpg', audioUrl: 'http://localhost:5000/static/audio/darlingey.mp3', artistId: artist5.id, albumId: album14.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Darlingey' },
    { name: 'Idhedho Bagundhe', duration: 270, releaseYear: 2013, coverImage: 'http://localhost:5000/static/images/mirchi.jpg', audioUrl: 'http://localhost:5000/static/audio/idhedho_bagundhe.mp3', artistId: artist5.id, albumId: album14.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Idhedho Bagundhe' },
    { name: 'Nee Choopula', duration: 250, releaseYear: 2013, coverImage: 'http://localhost:5000/static/images/mirchi.jpg', audioUrl: 'http://localhost:5000/static/audio/nee_choopula.mp3', artistId: artist5.id, albumId: album14.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Nee Choopula' },
    { name: 'Pandagala Digivachavu', duration: 290, releaseYear: 2013, coverImage: 'http://localhost:5000/static/images/mirchi.jpg', audioUrl: 'http://localhost:5000/static/audio/pandagala_digivachavu.mp3', artistId: artist5.id, albumId: album14.id, genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Pandagala Digivachavu' },
    { name: 'Yahoon Yahoon', duration: 280, releaseYear: 2013, coverImage: 'http://localhost:5000/static/images/mirchi.jpg', audioUrl: 'http://localhost:5000/static/audio/yahoon_yahoon.mp3', artistId: artist5.id, albumId: album14.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Yahoon Yahoon' },
    // Son of Satyamurthy
    { name: 'Chal Chalo Chalo', duration: 355, releaseYear: 2015, coverImage: 'http://localhost:5000/static/images/son_of_satyamurthy.jpg', audioUrl: 'http://localhost:5000/static/audio/chal_chalo_chalo.mp3', artistId: artist5.id, albumId: album15.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Chal Chalo Chalo' },
    { name: 'Come To The Party', duration: 287, releaseYear: 2015, coverImage: 'http://localhost:5000/static/images/son_of_satyamurthy.jpg', audioUrl: 'http://localhost:5000/static/audio/come_to_the_party.mp3', artistId: artist5.id, albumId: album15.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Come To The Party' },
    { name: 'Jaaruko', duration: 308, releaseYear: 2015, coverImage: 'http://localhost:5000/static/images/son_of_satyamurthy.jpg', audioUrl: 'http://localhost:5000/static/audio/jaaruko.mp3', artistId: artist5.id, albumId: album15.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Jaaruko' },
    { name: 'Seethakaalam', duration: 309, releaseYear: 2015, coverImage: 'http://localhost:5000/static/images/son_of_satyamurthy.jpg', audioUrl: 'http://localhost:5000/static/audio/seethakaalam.mp3', artistId: artist5.id, albumId: album15.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Seethakaalam' },
    { name: 'Super Machi', duration: 324, releaseYear: 2015, coverImage: 'http://localhost:5000/static/images/son_of_satyamurthy.jpg', audioUrl: 'http://localhost:5000/static/audio/super_machi.mp3', artistId: artist5.id, albumId: album15.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Super Machi' },
    { name: 'Vacchadu', duration: 201, releaseYear: 2015, coverImage: 'http://localhost:5000/static/images/son_of_satyamurthy.jpg', audioUrl: 'http://localhost:5000/static/audio/vacchadu.mp3', artistId: artist5.id, albumId: album15.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Vacchadu' },
    
    // Mahanati
    { name: 'Mahanati', duration: 296, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/mahanati.jpg', audioUrl: 'http://localhost:5000/static/audio/mahanati.mp3', artistId: artist4.id, albumId: albumMahanati.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Mahanati' },
    { name: 'Mooga Manasulu', duration: 260, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/mahanati.jpg', audioUrl: 'http://localhost:5000/static/audio/mooga_manasulu.mp3', artistId: artist4.id, albumId: albumMahanati.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Mooga Manasulu' },
    { name: 'Sada Nannu', duration: 211, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/mahanati.jpg', audioUrl: 'http://localhost:5000/static/audio/sada_nannu.mp3', artistId: artist4.id, albumId: albumMahanati.id, genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Sada Nannu' },
    { name: 'Aagipo Baalyama', duration: 261, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/mahanati.jpg', audioUrl: 'http://localhost:5000/static/audio/aagipo_baalyama.mp3', artistId: artist4.id, albumId: albumMahanati.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Aagipo Baalyama' },
    { name: 'Gelupuleni Samaram', duration: 197, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/mahanati.jpg', audioUrl: 'http://localhost:5000/static/audio/gelupuleni_samaram.mp3', artistId: artist4.id, albumId: albumMahanati.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Gelupuleni Samaram' },
    { name: 'Chivaraku Migiledi', duration: 184, releaseYear: 2018, coverImage: 'http://localhost:5000/static/images/mahanati.jpg', audioUrl: 'http://localhost:5000/static/audio/chivaraku_migiledi.mp3', artistId: artist4.id, albumId: albumMahanati.id, genreId: classicalFusion.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Chivaraku Migiledi' },
    
    // Vunnadhi Okate Zindagi
    { name: 'Vunnadhi Okate Zindagi Title Song', duration: 298, releaseYear: 2017, coverImage: 'http://localhost:5000/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: 'http://localhost:5000/static/audio/vunnadhi_okate_zindagi.mp3', artistId: artist5.id, albumId: albumZindagi.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Intro)\n[00:15] Vunnadhi okate zindagi' },
    { name: 'Trend Maarina Friend Maaradu', duration: 251, releaseYear: 2017, coverImage: 'http://localhost:5000/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: 'http://localhost:5000/static/audio/trend_marina_friend_maaradu.mp3', artistId: artist5.id, albumId: albumZindagi.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)\n[00:15] Trend maarina friend maaradu' },
    { name: 'What Amma', duration: 303, releaseYear: 2017, coverImage: 'http://localhost:5000/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: 'http://localhost:5000/static/audio/what_amma.mp3', artistId: artist5.id, albumId: albumZindagi.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fun Music)\n[00:15] What Amma What is this Amma' },
    { name: 'Rayyi Rayyi Mantu', duration: 325, releaseYear: 2017, coverImage: 'http://localhost:5000/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: 'http://localhost:5000/static/audio/rayyi_rayyi_mantu.mp3', artistId: artist5.id, albumId: albumZindagi.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Trumpet Intro)\n[00:15] Rayyi rayyi mantu' },
    { name: 'Life Is A Rainbow', duration: 345, releaseYear: 2017, coverImage: 'http://localhost:5000/static/images/vunnadhi_okate_zindagi.jpg', audioUrl: 'http://localhost:5000/static/audio/life_is_a_rainbow.mp3', artistId: artist5.id, albumId: albumZindagi.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Whistle Intro)\n[00:15] Life is a rainbow' },
    
    // V
    { name: 'Manasu Maree', duration: 248, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/v.jpg', audioUrl: 'http://localhost:5000/static/audio/manasu_maree.mp3', artistId: artist12.id, albumId: albumV.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Flute)\n[00:15] Manasu maree' },
    { name: 'Vastunna Vachestunna', duration: 202, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/v.jpg', audioUrl: 'http://localhost:5000/static/audio/vastunna_vachestunna.mp3', artistId: artist12.id, albumId: albumV.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Heavy Beats)\n[00:15] Vastunna vachestunna' },
    { name: 'Baby Touch Me Now', duration: 186, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/v.jpg', audioUrl: 'http://localhost:5000/static/audio/baby_touch_me_now.mp3', artistId: artist12.id, albumId: albumV.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Pop Synth)\n[00:15] Baby touch me now' },
    { name: 'Ranga Rangeli', duration: 228, releaseYear: 2020, coverImage: 'http://localhost:5000/static/images/v.jpg', audioUrl: 'http://localhost:5000/static/audio/ranga_rangeli.mp3', artistId: artist12.id, albumId: albumV.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Festive Music)\n[00:15] Ranga rangeli' },

    // Darling
    { name: 'Inka Edo', duration: 309, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/darling.jpg', audioUrl: 'http://localhost:5000/static/audio/inka_edo.mp3', artistId: artist13.id, albumId: albumDarling.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Synth Intro)\n[00:15] Inka edo kothaga undhe' },
    { name: 'Neeve', duration: 280, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/darling.jpg', audioUrl: 'http://localhost:5000/static/audio/neeve.mp3', artistId: artist13.id, albumId: albumDarling.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Intro)\n[00:15] Neeve naa pranamam' },
    { name: 'Hosahore', duration: 226, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/darling.jpg', audioUrl: 'http://localhost:5000/static/audio/hosahore.mp3', artistId: artist13.id, albumId: albumDarling.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Heavy Beats)\n[00:15] Hosahore hosahore' },
    { name: 'Priyathama', duration: 260, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/darling.jpg', audioUrl: 'http://localhost:5000/static/audio/priyathama.mp3', artistId: artist13.id, albumId: albumDarling.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Flute)\n[00:15] Priyathama priyathama' },
    { name: 'One Boy One Girl', duration: 244, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/darling.jpg', audioUrl: 'http://localhost:5000/static/audio/one_boy_one_girl.mp3', artistId: artist13.id, albumId: albumDarling.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fun Music)\n[00:15] One boy and one girl' },
    { name: 'Bulle', duration: 267, releaseYear: 2010, coverImage: 'http://localhost:5000/static/images/darling.jpg', audioUrl: 'http://localhost:5000/static/audio/bulle.mp3', artistId: artist13.id, albumId: albumDarling.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Beats Intro)\n[00:15] Bulle bulle bulle' },

    // Majili
    { name: 'Priyathama Priyathama', duration: 243, releaseYear: 2019, coverImage: 'http://localhost:5000/static/images/majili.jpg', audioUrl: 'http://localhost:5000/static/audio/priyathama_priyathama.mp3', artistId: artist8.id, albumId: albumMajili.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Violin)\n[00:15] Priyathama priyathama' },
    { name: 'Ye Manishike Majiliyo', duration: 260, releaseYear: 2019, coverImage: 'http://localhost:5000/static/images/majili.jpg', audioUrl: 'http://localhost:5000/static/audio/ye_manishike_majiliyo.mp3', artistId: artist8.id, albumId: albumMajili.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Melody Intro)\n[00:15] Ye manishike majiliyo' },
    { name: 'Yedetthu Mallele', duration: 200, releaseYear: 2019, coverImage: 'http://localhost:5000/static/images/majili.jpg', audioUrl: 'http://localhost:5000/static/audio/yedetthu_mallele.mp3', artistId: artist8.id, albumId: albumMajili.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Soft Beats)\n[00:15] Yedetthu mallele' },
    { name: 'Naa Gundello', duration: 287, releaseYear: 2019, coverImage: 'http://localhost:5000/static/images/majili.jpg', audioUrl: 'http://localhost:5000/static/audio/naa_gundello.mp3', artistId: artist8.id, albumId: albumMajili.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Chords)\n[00:15] Naa gundello gudu' },
    { name: 'One & Two & Three', duration: 226, releaseYear: 2019, coverImage: 'http://localhost:5000/static/images/majili.jpg', audioUrl: 'http://localhost:5000/static/audio/one_two_three.mp3', artistId: artist8.id, albumId: albumMajili.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fast Beats)\n[00:15] One and two and three' },
    { name: 'Maayya Maayya', duration: 267, releaseYear: 2019, coverImage: 'http://localhost:5000/static/images/majili.jpg', audioUrl: 'http://localhost:5000/static/audio/maayya_maayya.mp3', artistId: artist8.id, albumId: albumMajili.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Folkish Beat)\n[00:15] Maayya maayya' },

    // Arjun
    { name: 'Madhura Madhure Meenakshi', duration: 320, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arjun.jpg', audioUrl: 'http://localhost:5000/static/audio/madhura_madhure_meenakshi.mp3', artistId: artist14.id, albumId: albumArjun.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Music Intro)\n[00:15] Madhura madhure meenakshi tholisaari ninu choosi\n[00:20] Manasuni meetina thalapula layalo' },
    { name: 'Aey Pilla', duration: 250, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arjun.jpg', audioUrl: 'http://localhost:5000/static/audio/aey_pilla.mp3', artistId: artist14.id, albumId: albumArjun.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Synth Intro)\n[00:15] Aey pilla aey pilla nee navvula thoota' },
    { name: 'Dum Dumare', duration: 280, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arjun.jpg', audioUrl: 'http://localhost:5000/static/audio/dum_dumare.mp3', artistId: artist14.id, albumId: albumArjun.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Heavy Dhol Beats)\n[00:15] Dum dumare dum dumare dhol baje' },
    { name: 'O Cheli Nee Oyyarale', duration: 300, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arjun.jpg', audioUrl: 'http://localhost:5000/static/audio/o_cheli.mp3', artistId: artist14.id, albumId: albumArjun.id, genreId: romanticMelody.id, language: 'Telugu', lyrics: '[00:00] (Guitar Chords)\n[00:15] O cheli nee oyyarale nannu lagene' },
    { name: 'Okka Maata', duration: 260, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arjun.jpg', audioUrl: 'http://localhost:5000/static/audio/okka_mata.mp3', artistId: artist14.id, albumId: albumArjun.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Fast Beat Drops)\n[00:15] Okka maata okka maata cheppana pilla' },
    { name: 'Ra Ra Rajakumara', duration: 260, releaseYear: 2004, coverImage: 'http://localhost:5000/static/images/arjun.jpg', audioUrl: 'http://localhost:5000/static/audio/raa_raa.mp3', artistId: artist14.id, albumId: albumArjun.id, genreId: dancePop.id, language: 'Telugu', lyrics: '[00:00] (Trumpet Intro)\n[00:15] Ra ra rajakumara sandhadhi chedam' },

    // Baahubali: The Beginning
    {
      name: 'Dhivara',
      duration: 343,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/dhivara.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Flute & Waterfalls Intro)\n[00:20] Dhivara.. Prasara shourya bhaara\n[00:30] Utsara.. heera ohaaraa'
    },
    {
      name: 'Mamatala Talli',
      duration: 204,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/mamathala_thalli.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: classicalFusion.id,
      language: 'Telugu',
      lyrics: '[00:00] (Chorus Intro)\n[00:15] Mamatala talli.. odibadi malli\n[00:25] Kannaadi ee nela thalli'
    },
    {
      name: 'Manohari',
      duration: 232,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/manohari.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Beats Intro)\n[00:15] Manohari.. manohari\n[00:25] Ethukommani ninnu korindhi'
    },
    {
      name: 'Sivuni Aana',
      duration: 325,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/sivuni_aana.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: classicalFusion.id,
      language: 'Telugu',
      lyrics: '[00:00] (Heavy Drums Intro)\n[00:20] Sivuni aana.. aakasam\n[00:35] Shivuni aana.. shirasuna mosi'
    },
    {
      name: 'Pacha Bottasi',
      duration: 273,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/pachha_bottasi.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: romanticMelody.id,
      language: 'Telugu',
      lyrics: '[00:00] (Harp Intro)\n[00:15] Pacha bottasi.. nee cheyi thakithe\n[00:25] Naa pranam kothaga velisindhi'
    },
    {
      name: 'Jeeva Nadhi',
      duration: 112,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/jeeva_nadhi.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: classicalFusion.id,
      language: 'Telugu',
      lyrics: '[00:00] (Sorrow Violins)\n[00:10] Jeeva nadhi.. parugulu theesthunte\n[00:20] Gundelona mounam karigipoye'
    },
    {
      name: 'Nippule Swasaga',
      duration: 203,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/nippule_swasaga.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: classicalFusion.id,
      language: 'Telugu',
      lyrics: '[00:00] (Suspense Beats)\n[00:15] Nippule swasaga.. sathruvu nethuru\n[00:25] Kuthuraa.. yudhamo siddham'
    },
    {
      name: 'Dheevara (English Version)',
      duration: 206,
      releaseYear: 2015,
      coverImage: 'http://localhost:5000/static/images/bahubali.jpg',
      audioUrl: 'http://localhost:5000/static/audio/dhivara_english.mp3',
      artistId: artist7.id,
      albumId: albumBaahubali.id,
      genreId: romanticMelody.id,
      language: 'English',
      lyrics: '[00:00] (Western Flute)\n[00:15] Dheevara.. english version play\n[00:25] Beyond the clouds, we fly high'
    },
    {
      name: 'Chikiri Chikiri',
      duration: 248,
      releaseYear: 2026,
      coverImage: 'http://localhost:5000/static/images/peddi.jpg',
      audioUrl: 'http://localhost:5000/static/audio/chikiri_chikiri.mp3',
      artistId: artist9.id,
      albumId: albumPeddi.id,
      genreId: classicalFusion.id,
      language: 'Telugu',
      lyrics: '[00:00] (Music Intro)\n[00:15] Chikiri Chikiri'
    },
    {
      name: 'Hellallallo',
      duration: 219,
      releaseYear: 2026,
      coverImage: 'http://localhost:5000/static/images/peddi.jpg',
      audioUrl: 'http://localhost:5000/static/audio/hellallallo.mp3',
      artistId: artist9.id,
      albumId: albumPeddi.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Music Intro)\n[00:15] Hellallallo'
    },
    {
      name: 'Massa Massa',
      duration: 203,
      releaseYear: 2026,
      coverImage: 'http://localhost:5000/static/images/peddi.jpg',
      audioUrl: 'http://localhost:5000/static/audio/massa_massa.mp3',
      artistId: artist9.id,
      albumId: albumPeddi.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Music Intro)\n[00:15] Massa Massa'
    },
    {
      name: 'Rai Rai Raa Raa',
      duration: 254,
      releaseYear: 2026,
      coverImage: 'http://localhost:5000/static/images/peddi.jpg',
      audioUrl: 'http://localhost:5000/static/audio/rai_rai_raa_raa.mp3',
      artistId: artist9.id,
      albumId: albumPeddi.id,
      genreId: dancePop.id,
      language: 'Telugu',
      lyrics: '[00:00] (Music Intro)\n[00:15] Rai Rai Raa Raa'
    },
  ];



  for (const songData of songsData) {
    const { lyrics, ...songDetails } = songData;
    const song = await prisma.song.create({
      data: songDetails,
    });

    if (lyrics) {
      await prisma.lyrics.create({
        data: {
          songId: song.id,
          text: lyrics,
          synced: JSON.stringify([
            { time: 0, text: '(Music Intro)' },
            { time: 10, text: 'Kesariya tera ishq hai piya' },
            { time: 20, text: 'Rang jaaun jo main haath lagaaun' },
          ]),
        },
      });
    }
  }

  // 7. Create Playlist
  const defaultPlaylist = await prisma.playlist.create({
    data: {
      name: 'Desi Melodies Lounge',
      description: 'The best of Telugu and Hindi romantic tracks and melodies.',
      coverImage: 'http://localhost:5000/static/images/kesariya.jpg',
      userId: admin.id,
      isPublic: true,
    },
  });

  const createdSongs = await prisma.song.findMany();
  for (const song of createdSongs) {
    await prisma.playlistSong.create({
      data: {
        playlistId: defaultPlaylist.id,
        songId: song.id,
      },
    });
  }

  // Create Podcast
  const podcast = await prisma.podcast.create({
    data: {
      title: 'Chitra Geet & Tollywood Talks',
      publisher: 'Desi Podcast Network',
      description: 'Deep dives into Telugu cinema music and Hindi playback histories.',
      coverImage: 'http://localhost:5000/static/images/sirivennela.jpg',
    },
  });

  await prisma.podcastEpisode.create({
    data: {
      title: 'The Evolution of Playback in Indian Cinema',
      description: 'Discussing the masters: S.P. Balasubrahmanyam, Kishore Kumar, and Arijit Singh.',
      audioUrl: 'http://localhost:5000/static/audio/kesariya.mp3', // Re-use local file
      duration: 945,
      publishDate: new Date(),
      podcastId: podcast.id,
    },
  });

  console.log('Seeding completed successfully with local Telugu and Hindi assets!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
