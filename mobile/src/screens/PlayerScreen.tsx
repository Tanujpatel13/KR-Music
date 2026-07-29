import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useMobilePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, Heart, Shuffle, Repeat, Mic2, ArrowLeft } from 'lucide-react-native';

export default function PlayerScreen({ navigation }: any) {
  const { currentSong, isPlaying, progress, duration, togglePlay, seek } = useMobilePlayer();
  const [liked, setLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No track loaded. Select a song from Home or Search to play.</Text>
      </SafeAreaView>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Controls Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <View style={{ width: 24 }} />
      </View>

      {showLyrics ? (
        /* Synced Lyrics Panel Overlay */
        <View style={styles.lyricsContainer}>
          <Text style={styles.lyricsHeader}>Synced Lyrics</Text>
          <ScrollView contentContainerStyle={styles.lyricsScroll}>
            <Text style={styles.lyricLineActive}>[Active Lyric Line plays here...]</Text>
            <Text style={styles.lyricLineMuted}>Driving through the dark</Text>
            <Text style={styles.lyricLineMuted}>Neon lights ignite the spark</Text>
            <Text style={styles.lyricLineMuted}>Speeding down the digital street</Text>
            <Text style={styles.lyricLineMuted}>Feel the rhythm, feel the heat</Text>
          </ScrollView>
          <TouchableOpacity style={styles.lyricsToggleActive} onPress={() => setShowLyrics(false)}>
            <Mic2 size={20} color="#C8FF4D" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Core Player Display */
        <View style={styles.body}>
          {/* Rotating Artwork */}
          <Image source={{ uri: currentSong.coverImage }} style={styles.artwork} />

          {/* Details Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaText}>
              <Text style={styles.songName} numberOfLines={1}>{currentSong.name}</Text>
              <Text style={styles.artistName} numberOfLines={1}>{currentSong.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => setLiked(!liked)}>
              <Heart size={24} color={liked ? '#C8FF4D' : '#A7A7A7'} fill={liked ? '#C8FF4D' : 'transparent'} />
            </TouchableOpacity>
          </View>

          {/* Seek Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(progress / duration) * 100}%` }]} />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(progress)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls Panel */}
          <View style={styles.controlsRow}>
            <TouchableOpacity>
              <Shuffle size={20} color="#A7A7A7" />
            </TouchableOpacity>
            <TouchableOpacity>
              <SkipBack size={24} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
              {isPlaying ? (
                <Pause size={28} color="#000000" fill="#000000" />
              ) : (
                <Play size={28} color="#000000" fill="#000000" style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity>
              <SkipForward size={24} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Repeat size={20} color="#A7A7A7" />
            </TouchableOpacity>
          </View>

          {/* Footer controls */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => setShowLyrics(true)}>
              <Mic2 size={20} color="#A7A7A7" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#A7A7A7',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 16,
    shadowColor: '#C8FF4D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  metaText: {
    flex: 1,
    marginRight: 16,
  },
  songName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#A7A7A7',
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#1F1F1F',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C8FF4D',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#A7A7A7',
    fontSize: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  lyricsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  lyricsHeader: {
    color: '#C8FF4D',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  lyricsScroll: {
    gap: 16,
  },
  lyricLineActive: {
    color: '#C8FF4D',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  lyricLineMuted: {
    color: '#A7A7A7',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  lyricsToggleActive: {
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8FF4D',
  },
});
