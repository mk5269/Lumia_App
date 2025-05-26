 
// app/(tabs)/settings.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';

import {
    Image,
    Modal,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState(1);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

useEffect(() => {
  if (!isMusicOn && sound) {
    sound.stopAsync();
    sound.unloadAsync();
    setSound(null);
  }
}, [isMusicOn]);

  // 🎵 음악 재생
const playMusic = async (musicFile: any) => {
  try {
    if (sound) {
      await sound.stopAsync(); // 현재 재생 중인 음악 정지
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: newSound } = await Audio.Sound.createAsync(musicFile);
    setSound(newSound);
    await newSound.playAsync();
  } catch (e) {
    console.log('음악 재생 오류:', e);
  }
};

  // ⏰ 시간 변경
  const onTimeChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) setAlarmTime(selectedDate);
    setShowPicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>option</Text>

      {/* === MUSIC === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Music</Text>
          <Switch value={isMusicOn} onValueChange={setIsMusicOn} />
        </View>

        <View style={styles.musicButtons}>
<TouchableOpacity
  onPress={() => {
    setSelectedMusic(1);
    if (isMusicOn) playMusic(require('../../assets/sounds/music1.mp3'));
  }}
>
            <Image
              source={require('../../assets/images/music1.png')}
              style={[styles.musicImage, selectedMusic === 1 && styles.selected]}
            />
            <Text style={styles.musicLabel}>music I</Text>
          </TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    setSelectedMusic(2);
    if (isMusicOn) playMusic(require('../../assets/sounds/music2.mp3'));
  }}
>
            <Image
              source={require('../../assets/images/music2.png')}
              style={[styles.musicImage, selectedMusic === 2 && styles.selected]}
            />
            <Text style={styles.musicLabel}>music II</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* === ALARM CLOCK === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Clock</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.subText}>정기 알림</Text>
          <Switch value={isAlarmOn} onValueChange={setIsAlarmOn} />
        </View>

        <Text style={styles.subText}>지정한 시간에 쪽지 알림을 보내 드려요.</Text>

        <TouchableOpacity style={styles.timePicker} onPress={() => setShowPicker(true)}>
          <Text>
            {alarmTime.toLocaleTimeString('ko-KR', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </Text>
        </TouchableOpacity>

        {/* ✅ 시간 선택 Modal */}
        {showPicker && (
          <Modal transparent={true} animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={alarmTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                  is24Hour={false}
                />
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={{ color: 'blue', marginTop: 10 }}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFBEA' },
  title: { fontSize: 26, fontStyle: 'italic', marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  subText: { color: '#666', marginVertical: 4 },
  musicButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  musicImage: { width: 100, height: 100, borderRadius: 10, marginBottom: 5 },
  musicLabel: { textAlign: 'center' },
  selected: {
    borderWidth: 2,
    borderColor: '#FFAA00'
  },
  timePicker: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#EEE',
    borderRadius: 8,
    alignItems: 'center'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
pickerContainer: {
  backgroundColor: '#111', // ← 어두운 배경
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  alignItems: 'center',
},
});

export default SettingsScreen;
