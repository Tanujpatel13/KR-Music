import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export interface MobileSong {
  id: string;
  name: string;
  duration: number;
  coverImage: string;
  audioUrl: string;
  artist: string;
}

interface PlayerContextType {
  currentSong: MobileSong | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playSong: (song: MobileSong) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<MobileSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Configure Audio for background playback
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldRouteThroughEarpieceAndroid: false,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Track status updates
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
      }
    }
  };

  const playSong = async (song: MobileSong) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading mobile track:', error);
    }
  };

  const togglePlay = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const seek = async (seconds: number) => {
    if (!sound) return;
    await sound.setPositionAsync(seconds * 1000);
    setProgress(seconds);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        playSong,
        togglePlay,
        seek,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const useMobilePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('useMobilePlayer must be used inside a PlayerProvider');
  return context;
};
