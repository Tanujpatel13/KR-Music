import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useMobilePlayer, MobileSong } from '../context/PlayerContext';
import { Compass, Star, Music, Award, LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const MOCK_SONGS: MobileSong[] = [
  {
    id: 's1',
    name: 'Kesariya',
    duration: 268,
    coverImage: 'http://10.0.2.2:5000/static/images/kesariya.jpg',
    audioUrl: 'http://10.0.2.2:5000/static/audio/kesariya.mp3',
    artist: 'Arijit Singh',
  },
  {
    id: 's2',
    name: 'Tum Hi Ho',
    duration: 262,
    coverImage: 'http://10.0.2.2:5000/static/images/tum_hi_ho.jpg',
    audioUrl: 'http://10.0.2.2:5000/static/audio/tum_hi_ho.mp3',
    artist: 'Arijit Singh',
  },
  {
    id: 's3',
    name: 'Srivalli',
    duration: 224,
    coverImage: 'http://10.0.2.2:5000/static/images/srivalli.jpg',
    audioUrl: 'http://10.0.2.2:5000/static/audio/srivalli.mp3',
    artist: 'Sid Sriram',
  },
];

export default function HomeScreen({ navigation }: any) {
  const { playSong, currentSong } = useMobilePlayer();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Banner Welcome Header */}
        <View style={styles.headerBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Good Evening</Text>
            <Text style={styles.subtext}>Ready for high-fidelity audio?</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Award size={24} color="#C8FF4D" />
            <TouchableOpacity onPress={logout}>
              <LogOut size={24} color="#FF4D4D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recently Played Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Compass size={16} color="#C8FF4D" /> Recently Played
          </Text>
          <View style={styles.grid}>
            {MOCK_SONGS.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={styles.gridCard}
                onPress={() => playSong(song)}
              >
                <Image source={{ uri: song.coverImage }} style={styles.gridImage} />
                <View style={styles.gridDetails}>
                  <Text style={[styles.songName, currentSong?.id === song.id && { color: '#C8FF4D' }]} numberOfLines={1}>
                    {song.name}
                  </Text>
                  <Text style={styles.artistName} numberOfLines={1}>
                    {song.artist}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended Tracks Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Star size={16} color="#C8FF4D" /> Recommended For You
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slider}>
            {MOCK_SONGS.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={styles.sliderCard}
                onPress={() => {
                  playSong(song);
                  navigation.navigate('Player');
                }}
              >
                <Image source={{ uri: song.coverImage }} style={styles.sliderImage} />
                <Text style={styles.songName} numberOfLines={1}>
                  {song.name}
                </Text>
                <Text style={styles.artistName} numberOfLines={1}>
                  {song.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  headerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginBottom: 24,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#A7A7A7',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    gap: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: 50,
    height: 50,
  },
  gridDetails: {
    padding: 8,
    flex: 1,
  },
  songName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#A7A7A7',
    fontSize: 10,
    marginTop: 2,
  },
  slider: {
    gap: 16,
  },
  sliderCard: {
    width: 130,
    backgroundColor: '#121212',
    padding: 10,
    borderRadius: 12,
  },
  sliderImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    marginBottom: 8,
  },
});
