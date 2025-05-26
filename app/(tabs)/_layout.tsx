// app/(tabs)/_layout.tsx
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import MusicController from '../../components/MusicController';
import { MusicProvider } from '../../context/MusicContext';
import { registerForPushNotificationsAsync } from '../notifications';

export default function TabLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <MusicProvider>
      <MusicController />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="chat" />
        <Tabs.Screen name="records" />
        <Tabs.Screen name="index" />
        <Tabs.Screen name="board" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </MusicProvider>
  );
}
