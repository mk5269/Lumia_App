// ch4/app/(tabs)/healing.tsx

import { useIsFocused } from '@react-navigation/native';
import { Audio, ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useMusic } from '../../context/MusicContext'; // MusicContext import

const SCREEN_WIDTH = Dimensions.get('window').width;

const data = [
  {
    key: 'fire',
    label: '불멍',
    type: 'video' as const,
    video: require('../../assets/videos/fire.mp4'),
    sound: require('../../assets/sounds/fire_sound.mp3'),
  },
  {
    key: 'rain',
    label: '빗멍',
    type: 'image' as const,
    image: require('../../assets/images/rain.gif'), // 이 파일 경로 및 GIF 유효성 확인 필요
    sound: require('../../assets/sounds/rain_sound.mp3'),
  },
];

export default function HealingScreen() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const viewIndex = useRef(0);
  const videoRef = useRef<Video | null>(null);
  const isFocused = useIsFocused();

  const {
    isMusicOn: isBgMusicPlaying, // 배경 음악 재생 상태 (MusicContext에서 가져옴)
    setIsMusicOn: setBgMusicOn,   // 배경 음악 켜고 끄는 함수 (MusicContext에서 가져옴)
  } = useMusic();

  const playHealingSound = async (index: number) => {
    if (index < 0 || index >= data.length) {
      console.warn(`playHealingSound: Invalid index ${index}`);
      return;
    }
    const item = data[index];
    console.log(`[HealingScreen] playHealingSound for index: ${index}, key: ${item.key}`);

    await stopHealingSound();

    // 힐링 사운드 재생 전, 배경 음악이 켜져 있다면 끈다
    if (isBgMusicPlaying) {
      console.log('[HealingScreen] Background music is playing. Turning it off for healing sound.');
      await setBgMusicOn(false); // MusicContext를 통해 배경 음악 끄기
    }

    try {
      const { sound } = await Audio.Sound.createAsync(item.sound, {
        isLooping: true,
      });
      soundRef.current = sound;
      await sound.playAsync();
      console.log(`[HealingScreen] Healing sound playing for ${item.key}`);
    } catch (error) {
      console.error(`[HealingScreen] Error loading or playing healing sound for ${item.key}:`, error);
    }
  };

  const stopHealingSound = async () => {
    if (soundRef.current) {
      console.log('[HealingScreen] Stopping and unloading previous healing sound...');
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        console.log('[HealingScreen] Previous healing sound unloaded.');
      } catch (error) {
        console.error('[HealingScreen] Error stopping or unloading healing sound:', error);
      }
      soundRef.current = null;
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { item: (typeof data)[0]; index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        const currentItemKey = viewableItems[0].item.key;
        console.log(`[HealingScreen] onViewableItemsChanged: New index: ${newIndex}, Key: ${currentItemKey}, Current viewIndex.current: ${viewIndex.current}`);

        if (newIndex !== viewIndex.current) {
          viewIndex.current = newIndex;
          if (isFocused) {
            playHealingSound(newIndex);
          }
        } else if (newIndex === viewIndex.current && !soundRef.current && isFocused) {
          console.log(`[HealingScreen] Re-playing healing sound for current index ${newIndex} as it's focused and sound was off.`);
          playHealingSound(newIndex);
        }
      }
    }
  ).current;


  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
    waitForInteraction: false,
  });

  useEffect(() => {
    if (isFocused) {
      console.log(`[HealingScreen] Screen focused. Current viewIndex: ${viewIndex.current}`);
      playHealingSound(viewIndex.current);
      const currentItem = data[viewIndex.current];
      if (videoRef.current && currentItem?.type === 'video') {
        videoRef.current.playAsync().catch(e => console.warn("[HealingScreen] Error playing video on focus:", e));
      }
    } else {
      console.log('[HealingScreen] Screen unfocused. Stopping healing sound and video.');
      stopHealingSound();
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(e => console.warn("[HealingScreen] Error pausing video on blur:", e));
      }
      // 힐링 화면을 벗어날 때 배경 음악을 다시 켤지는 MusicContext의 로직에 따릅니다.
      // (MusicContext의 useEffect가 isMusicOn=true이고 selectedMusic이 있으면 자동 재생될 수 있음)
    }

    return () => {
      console.log('[HealingScreen] Cleanup (unmount or focus lost). Stopping healing sound.');
      stopHealingSound();
    };
  }, [isFocused]); // isFocused가 변경될 때 실행


  const renderItem = ({ item, index }: { item: (typeof data)[0]; index: number }) => {
    console.log(`[HealingScreen] Rendering item at index ${index}: ${item.key}`);
    const videoItemIndex = data.findIndex(d => d.type === 'video');
    const shouldAssignRef = item.type === 'video' && index === videoItemIndex;

    return (
      <View style={styles.page}>
        {item.type === 'video' ? (
          <Video
            ref={shouldAssignRef ? videoRef : null}
            source={item.video}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isFocused}
            isMuted // 효과음은 Audio API로 별도 재생
            onError={(error) => console.log(`[HealingScreen] Error loading video for ${item.key}:`, error)}
          />
        ) : (
          <Image
            source={item.image} // GIF 로딩 에러 발생 시 이 부분 확인 필요
            style={styles.media}
            resizeMode="cover"
            onError={(e) => console.log(`[HealingScreen] Error loading image for ${item.key}:`, e.nativeEvent.error)}
          />
        )}
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{item.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewConfigRef.current}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    width: SCREEN_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 80,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
  },
  labelText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});