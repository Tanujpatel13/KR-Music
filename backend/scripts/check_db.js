const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  const songCount = await p.song.count();
  console.log('=== DATABASE STATUS ===');
  console.log('Total songs in DB:', songCount);
  
  const songs = await p.song.findMany({
    select: { id: true, name: true, audioUrl: true, language: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  console.log('\nLatest 20 songs:');
  songs.forEach(s => console.log(' -', s.name, '|', s.language, '|', s.audioUrl.substring(0, 60)));

  const playlists = await p.playlist.findMany({
    select: { id: true, name: true, isPublic: true, _count: { select: { songs: true } } }
  });
  console.log('\nAll playlists:');
  playlists.forEach(pl => console.log(' -', pl.id, '|', pl.name, '| public:', pl.isPublic, '|', pl._count.songs, 'songs'));

  // Search test
  const searchResult = await p.song.findMany({
    where: { name: { contains: 'apna' } },
    select: { id: true, name: true, audioUrl: true }
  });
  console.log('\nSearch "apna":', searchResult.length, 'results');
  searchResult.forEach(s => console.log(' -', s.name));

  await p.$disconnect();
}

check().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
