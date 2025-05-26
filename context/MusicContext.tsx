// context/MusicContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type MusicContextType = {
  isMusicOn: boolean;
  setIsMusicOn: (v: boolean) => void;
  selectedMusic: number;
  setSelectedMusic: (v: number) => void;
  isReady: boolean; // ✅ 추가
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMusicOn, setIsMusicOnState] = useState(true);
  const [selectedMusic, setSelectedMusicState] = useState(1);
  const [isReady, setIsReady] = useState(false); // ✅

  useEffect(() => {
    const loadStoredState = async () => {
      const storedMusic = await AsyncStorage.getItem('isMusicOn');
      const storedChoice = await AsyncStorage.getItem('selectedMusic');

      if (storedMusic !== null) setIsMusicOnState(storedMusic === 'true');
      if (storedChoice !== null) setSelectedMusicState(Number(storedChoice));

      setIsReady(true); // ✅ 로딩 완료 표시
    };

    loadStoredState();
  }, []);

  const setIsMusicOn = async (value: boolean) => {
    setIsMusicOnState(value);
    await AsyncStorage.setItem('isMusicOn', value.toString());
  };

  const setSelectedMusic = async (value: number) => {
    setSelectedMusicState(value);
    await AsyncStorage.setItem('selectedMusic', value.toString());
  };

  return (
    <MusicContext.Provider
      value={{
        isMusicOn,
        setIsMusicOn,
        selectedMusic,
        setSelectedMusic,
        isReady, // ✅ 전달
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
};
