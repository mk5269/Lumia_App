// app/(tabs)/_layout.tsx

import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { Tabs, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import MusicController from '../../components/MusicController';
import { MusicProvider, useMusic } from '../../context/MusicContext';
import { registerForPushNotificationsAsync } from '../notifications';

function MusicRouteController() {
  const pathname = usePathname();
  const { isMusicOn, backgroundSoundRef } = useMusic();
  const mutedPages = ['/healing', '/settings'];
  useEffect(() => {
    const controlMusic = async () => {
      if (!backgroundSoundRef.current) return;

     if (mutedPages.includes(pathname)) {
  await backgroundSoundRef.current.pauseAsync();
} else if (isMusicOn) {
  const status = await backgroundSoundRef.current.getStatusAsync();
  if ('isLoaded' in status && status.isLoaded && !status.isPlaying) {
    try {
      await backgroundSoundRef.current.playAsync();
    } catch (e) {
      console.warn('음악 재생 실패:', e);
    }
  }
}
    };

    controlMusic();
  }, [pathname]);

  return null; // 렌더링은 하지 않음
}

export default function TabLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <MusicProvider>
      <MusicController />
      <MusicRouteController /> {/* 여기에 음악 자동 제어 */}
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
