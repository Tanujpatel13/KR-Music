import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Heart, Disc, Music, Plus } from 'lucide-react-native';

const PLAYLISTS = [
  { id: '1', name: 'Chill Coding Beats', count: 12, cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150' },
  { id: '2', name: 'Driving Night Mix', count: 24, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150' },
  { id: '3', name: 'Acoustic Morning', count: 8, cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150' },
];

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Actions */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Library</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Liked Songs Entry */}
        <TouchableOpacity style={styles.likedCard}>
          <View style={styles.likedIconContainer}>
            <Heart size={24} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View style={styles.likedDetails}>
            <Text style={styles.likedTitle}>Liked Songs</Text>
            <Text style={styles.likedSubtitle}>Playlist • 5 songs</Text>
          </View>
        </TouchableOpacity>

        {/* Playlists grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playlists</Text>
          {PLAYLISTS.map((playlist) => (
            <TouchableOpacity key={playlist.id} style={styles.playlistRow}>
              <Image source={{ uri: playlist.cover }} style={styles.playlistCover} />
              <View style={styles.playlistDetails}>
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.playlistSub}>{playlist.count} tracks</Text>
              </View>
              <Disc size={16} color="#A7A7A7" />
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  likedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginBottom: 24,
  },
  likedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'purple',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedDetails: {
    marginLeft: 16,
  },
  likedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  likedSubtitle: {
    color: '#A7A7A7',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#121212/30',
    padding: 8,
    borderRadius: 8,
  },
  playlistCover: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  playlistDetails: {
    marginLeft: 16,
    flex: 1,
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playlistSub: {
    color: '#A7A7A7',
    fontSize: 12,
    marginTop: 2,
  },
});
