import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Search, Play } from 'lucide-react-native';
import { useMobilePlayer, MobileSong } from '../context/PlayerContext';

const MOCK_DB: MobileSong[] = [
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

const GENRES = [
  { id: 'g1', name: 'Romantic Melody', color: '#FF4500' },
  { id: 'g2', name: 'Dance Pop', color: '#C8FF4D' },
  { id: 'g3', name: 'Classical Fusion', color: '#00FFFF' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { playSong } = useMobilePlayer();

  const filteredSongs = MOCK_DB.filter(
    (song) =>
      song.name.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Search Input Box */}
        <View style={styles.searchBar}>
          <Search size={20} color="#A7A7A7" style={styles.searchIcon} />
          <TextInput
            placeholder="Search songs, artists..."
            placeholderTextColor="#A7A7A7"
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
        </View>

        {query.length > 0 ? (
          /* Search Results */
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => playSong(item)}>
                <Image source={{ uri: item.coverImage }} style={styles.resultImage} />
                <View style={styles.resultDetails}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultArtist}>{item.artist}</Text>
                </View>
                <Play size={16} color="#C8FF4D" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          /* Browse All Genres */
          <View style={styles.browseSection}>
            <Text style={styles.sectionTitle}>Browse All</Text>
            <FlatList
              data={GENRES}
              numColumns={2}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={styles.genreRow}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.genreCard, { backgroundColor: item.color }]}>
                  <Text style={styles.genreName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  innerContainer: {
    padding: 16,
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  browseSection: {
    flex: 1,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  genreRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  genreCard: {
    width: '48%',
    height: 90,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'flex-end',
  },
  genreName: {
    color: '#000000',
    fontWeight: 'black',
    fontSize: 16,
  },
  resultsList: {
    gap: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 10,
    borderRadius: 8,
  },
  resultImage: {
    width: 44,
    height: 44,
    borderRadius: 4,
    marginRight: 12,
  },
  resultDetails: {
    flex: 1,
  },
  resultName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultArtist: {
    color: '#A7A7A7',
    fontSize: 12,
    marginTop: 2,
  },
});
