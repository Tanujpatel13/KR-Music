import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PlayerProvider } from './src/context/PlayerContext';
import { AuthProvider } from './src/context/AuthContext';
import Navigation from './src/navigation/navigation';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#000000" />
          <Navigation />
        </NavigationContainer>
      </PlayerProvider>
    </AuthProvider>
  );
}
