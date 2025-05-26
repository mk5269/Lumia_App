// components/MusicController.tsx
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';

const MusicController = () => {
  const { isMusicOn, selectedMusic, isReady } = useMusic(); // ✅ 추가

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!isReady) return; // ✅ 로딩 전이면 아무것도 하지 마!

    const manageMusic = async () => {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (!isMusicOn) return;

      const file =
        selectedMusic === 1
          ? require('../assets/sounds/music1.mp3')
          : require('../assets/sounds/music2.mp3');

      const { sound } = await Audio.Sound.createAsync(file);
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
      soundRef.current = sound;
    };

    manageMusic();

    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [isMusicOn, selectedMusic, isReady]); // ✅ 여기에 isReady 꼭 넣기

  return null;
};

export default MusicController;
