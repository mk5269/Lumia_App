// app/(tabs)/_layout.tsx
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';
import MusicController from '../../components/MusicController';
import { MusicProvider } from '../../context/MusicContext'; // 📌 경로 주의!

export default function TabLayout() {
  return (
    <MusicProvider> {/* ✅ 전역 음악 컨텍스트로 감싸기 */}
    <MusicController /> {/* ✅ 음악 전역 제어 컴포넌트 삽입 */}
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
